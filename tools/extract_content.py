#!/usr/bin/env python3
"""
Content extraction pipeline for the UEI/VEI 01 course material.

Reads the supplied PDF/PPTX lectures (read-only) and emits, per chapter:
  - src/content/<discipline>/<chapterId>.json  (typed ContentBlock stream, source order preserved)
  - public/content/<discipline>/<chapterId>/img-NNN.<ext>  (deduplicated embedded images)
  - src/content/manifest.json  (chapter/topic inventory for the app shell)

Rules:
  * Text is copied verbatim — never rewritten, summarized or invented.
  * Images keep their source order; captions use the source's own page/slide title.
  * Tables are copied cell-by-cell from the source tables.
"""
import hashlib
import json
import os
import re
import zipfile
import xml.etree.ElementTree as ET
from statistics import median

import fitz  # PyMuPDF

SRC = "/Users/macbook/Desktop/cardioeng"
PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(PROJECT, "src", "content")
PUBLIC_DIR = os.path.join(PROJECT, "public", "content")

A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

MIN_IMG_PX = 200
MIN_IMG_BYTES = 5_000

ROMAN = re.compile(r"^\s*[IVXLC]{1,4}[\s\-––.)]+")
ALPHA = re.compile(r"^\s*[A-Z][\s\-––.)]+")
NUM = re.compile(r"^\s*\d{1,2}[\s\-––.)]+")


def clean(t: str) -> str:
    return re.sub(r"\s+", " ", t or "").strip()


def slug_ext(ext: str) -> str:
    ext = (ext or "png").lower().lstrip(".")
    return {"jpeg": "jpg", "jpe": "jpg"}.get(ext, ext)


class ChapterWriter:
    def __init__(self, disc: str, chapter_id: str):
        self.disc = disc
        self.chapter_id = chapter_id
        self.img_dir = os.path.join(PUBLIC_DIR, disc, chapter_id)
        self.url_prefix = f"/content/{disc}/{chapter_id}/"
        self.hashes = {}
        self.count = 0
        self.pages = []

    def add_image(self, data: bytes, ext: str, caption: str):
        w_ok = True
        key = hashlib.md5(data).hexdigest()
        if key in self.hashes:
            return {"type": "image", "src": self.hashes[key], "caption": caption}
        if len(data) < MIN_IMG_BYTES:
            return None
        try:
            pix = fitz.Pixmap(data)
            w_ok = pix.width >= MIN_IMG_PX and pix.height >= MIN_IMG_PX
            pix = None
        except Exception:
            w_ok = True
        if not w_ok:
            return None
        self.count += 1
        name = f"img-{self.count:03d}.{slug_ext(ext)}"
        os.makedirs(self.img_dir, exist_ok=True)
        with open(os.path.join(self.img_dir, name), "wb") as f:
            f.write(data)
        src = self.url_prefix + name
        self.hashes[key] = src
        return {"type": "image", "src": src, "caption": caption}


def heading_level(text: str) -> int:
    if ROMAN.match(text):
        return 2
    if ALPHA.match(text) or NUM.match(text):
        return 3
    return 3


# ---------------------------------------------------------------- PDF -------
def extract_pdf(path: str, writer: ChapterWriter):
    doc = fitz.open(path)
    # median body size
    sizes = []
    for page in doc:
        for b in page.get_text("dict")["blocks"]:
            if b.get("type") != 0:
                continue
            for l in b["lines"]:
                for s in l["spans"]:
                    if len(s["text"].strip()) >= 30:
                        sizes.append(s["size"])
    med = median(sizes) if sizes else 12.0

    for pno, page in enumerate(doc):
        tables = []
        table_rects = []
        try:
            found = page.find_tables()
            for t in found.tables:
                rows = [[clean(c) for c in row] for row in t.extract()]
                rows = [r for r in rows if any(r)]
                if len(rows) >= 2:
                    tables.append((t.bbox, rows))
                    table_rects.append(fitz.Rect(t.bbox))
        except Exception:
            pass

        blocks = []
        for b in page.get_text("dict")["blocks"]:
            if b.get("type") != 0:
                continue
            rect = fitz.Rect(b["bbox"])
            if any(r.contains(rect) for r in table_rects):
                continue
            lines = []
            for l in b["lines"]:
                line_text = clean("".join(s["text"] for s in l["spans"]))
                if not line_text:
                    continue
                sz = max((s["size"] for s in l["spans"]), default=med)
                bold = any(s["flags"] & 16 for s in l["spans"])
                lines.append((line_text, sz, bold))
            if not lines:
                continue
            text = " ".join(t for t, _, _ in lines)
            max_sz = max(sz for _, sz, _ in lines)
            any_bold = any(bd for _, _, bd in lines)
            is_heading = len(text) < 140 and (max_sz >= med + 1.2 or (any_bold and max_sz >= med - 0.5))
            if is_heading:
                blocks.append({"type": "heading", "level": heading_level(text), "text": text})
            else:
                blocks.append({"type": "paragraph", "text": text})
            # insert tables that start right after this block? keep simple: tables appended per page below

        # images in visual order
        img_blocks = []
        infos = page.get_image_info(xrefs=True)
        infos.sort(key=lambda i: (round(i["bbox"][1] / 40), i["bbox"][0]))
        seen = set()
        for info in infos:
            xref = info.get("xref", 0)
            if not xref or xref in seen:
                continue
            seen.add(xref)
            try:
                raw = doc.extract_image(xref)
            except Exception:
                continue
            blk = writer.add_image(raw["image"], raw["ext"], "")
            if blk:
                img_blocks.append(blk)

        for _bbox, rows in tables:
            blocks.append({"type": "table", "headers": rows[0], "rows": rows[1:]})

        page_title = next((b["text"] for b in blocks if b["type"] == "heading"), "")
        for blk in img_blocks:
            blk["caption"] = page_title
        blocks.extend(img_blocks)
        if blocks:
            writer.pages.append({"n": pno + 1, "title": page_title, "blocks": blocks})
    doc.close()


# --------------------------------------------------------------- PPTX -------
def extract_pptx(path: str, writer: ChapterWriter):
    z = zipfile.ZipFile(path)
    names = z.namelist()
    slide_names = sorted(
        (n for n in names if re.match(r"ppt/slides/slide\d+\.xml$", n)),
        key=lambda n: int(re.search(r"(\d+)", n).group(1)),
    )
    # pass 1: titles for running-header detection
    titles = {}
    for s in slide_names:
        root = ET.fromstring(z.read(s))
        title = ""
        for sp in root.iter(f"{P}sp"):
            ph = sp.find(f".//{P}ph")
            if ph is not None and ph.get("type") in ("title", "ctrTitle"):
                title = clean("".join(t.text or "" for t in sp.iter(f"{A}t")))
                break
        titles[s] = title
    counts = {}
    for t in titles.values():
        if t:
            counts[t] = counts.get(t, 0) + 1
    running = {t for t, c in counts.items() if c >= max(3, 0.25 * len(slide_names))}

    current_section = None
    for s in slide_names:
        root = ET.fromstring(z.read(s))
        title = titles[s]
        blocks = []

        if title and title not in running:
            if ROMAN.match(title) or "chapter" in title.lower():
                if title != current_section:
                    current_section = title
                    blocks.append({"type": "heading", "level": 2, "text": title})
            else:
                blocks.append({"type": "heading", "level": 3, "text": title})

        # body paragraphs
        for sp in root.iter(f"{P}sp"):
            ph = sp.find(f".//{P}ph")
            if ph is not None and ph.get("type") in ("title", "ctrTitle"):
                continue
            for para in sp.iter(f"{A}p"):
                text = clean("".join(t.text or "" for t in para.iter(f"{A}t")))
                if text:
                    blocks.append({"type": "paragraph", "text": text})

        # tables
        for tbl in root.iter(f"{A}tbl"):
            rows = []
            for tr in tbl.findall(f"{A}tr"):
                cells = []
                for tc in tr.findall(f"{A}tc"):
                    cells.append(clean("".join(t.text or "" for t in tc.iter(f"{A}t"))))
                if any(cells):
                    rows.append(cells)
            if len(rows) >= 2:
                width = max(len(r) for r in rows)
                rows = [r + [""] * (width - len(r)) for r in rows]
                blocks.append({"type": "table", "headers": rows[0], "rows": rows[1:]})

        # images in document order
        rels_name = s.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels"
        rel_map = {}
        if rels_name in names:
            rels = ET.fromstring(z.read(rels_name))
            for rel in rels:
                rel_map[rel.get("Id")] = rel.get("Target", "")
        caption = title if title not in running else ""
        for blip in root.iter(f"{A}blip"):
            rid = blip.get(f"{R}embed")
            tgt = rel_map.get(rid, "")
            if "../media/" not in tgt:
                continue
            media = "ppt/media/" + tgt.split("../media/")[1]
            if media not in names:
                continue
            data = z.read(media)
            ext = os.path.splitext(media)[1]
            blk = writer.add_image(data, ext, caption)
            if blk:
                blocks.append(blk)

        if blocks:
            writer.pages.append(
                {"n": int(re.search(r"(\d+)", s).group(1)), "title": title, "blocks": blocks}
            )
    z.close()


# ------------------------------------------------------------- plumbing -----
DISC_OF_DIR = {
    "anatomy cardiovasculaire": "anatomie-cardiovasculaire",
    "anatomy respiratoire": "anatomie-respiratoire",
    "biophysic": "biophysique",
    "histology": "histologie",
    "physio cardiovasculaire": "physiologie-cardiovasculaire",
    "physio respiratoir": "physiologie-respiratoire",
}
PREFIX = {
    "anatomie-cardiovasculaire": "ac",
    "anatomie-respiratoire": "ar",
    "biophysique": "bp",
    "histologie": "hi",
    "physiologie-cardiovasculaire": "pc",
    "physiologie-respiratoire": "pr",
}


def chapter_meta(disc: str, fname: str):
    base = os.path.splitext(fname)[0]
    m = re.match(r"(\d+)\)", base)
    if base.upper().startswith("TD"):
        m2 = re.search(r"TD-?(\d+)", base, re.I)
        number = f"TD{m2.group(1) if m2 else ''}"
        kind = "td"
    else:
        number = m.group(1) if m else "0"
        kind = "cours"
    return f"{PREFIX[disc]}-{number.lower()}", number, kind


def good_title(t: str) -> bool:
    t = clean(t)
    if not (10 <= len(t) <= 90):
        return False
    if t[0] in ".,;:0123456789•-–":
        return False
    if re.search(r"\b(Dr|Pr|Prof|Dr\.)\s", t):
        return False
    if t.count(" ") < 1:
        return False
    return True


TITLE_OVERRIDES = {
    # Titles restored verbatim from the authoritative source filenames
    # (spacing reinserted; French medical terminology preserved).
    "ac-1": "L'anatomie de la paroi thoracique",
    "ac-2": "L'anatomie du médiastin",
    "ac-3": "La configuration extérieure et intérieure du cœur",
    "ac-4": "Structures du cœur et péricarde",
    "ac-5": "La vascularisation du cœur",
    "ac-6": "L'innervation du cœur",
    "ac-7": "L'anatomie du système aortique",
    "ac-8": "L'anatomie des systèmes Cave et Azygos",
    "ac-9": "Anatomie du système lymphatique",
    "ar-10": "Anatomie du larynx",
    "ar-11": "Anatomie de la trachée et des bronches",
    "ar-12": "Anatomie des poumons, plèvre et des pédicules pulmonaires",
    "ar-13": "Anatomie du diaphragme et du nerf phrénique",
    "bp-1": "Hémodynamique et Biophysique Vasculaire",
    "bp-2": "Biophysique Cardiaque",
    "bp-3": "Électrocardiogramme",
    "hi-1": "Histologie de l'Appareil Cardio-vasculaire",
    "hi-2": "Histologie de l'appareil respiratoire",
    "hi-3": "Histologie des organes hématopoïétiques",
    "hi-4": "Histologie de la rate",
    "hi-5": "Histologie du thymus",
    "pc-1": "Électrophysiologie cardiaque",
    "pc-2": "Le cycle cardiaque",
    "pc-3": "Le débit cardiaque",
    "pc-4": "Régulation de la pression artérielle",
    "pc-5": "Système à basse pression",
    "pc-6": "La circulation coronaire",
    "pc-7": "L'hémostase (La physiologie du sang)",
    "pc-td01": "TD 01 — L'ECG",
    "pr-8": "Introduction à la Physiologie respiratoire",
    "pr-9": "Mécanique ventilatoire",
    "pr-10": "Échanges gazeux pulmonaire et systémique",
    "pr-11": "Transport des gaz dans le sang",
    "pr-12": "Régulation de la respiration",
    "pr-td02": "TD 02 — Spirométrie",
}


def derive_title(pages) -> str:
    for pg in pages[:6]:
        for b in pg["blocks"]:
            if b["type"] == "heading" and good_title(b["text"]):
                return b["text"]
        if good_title(pg["title"]):
            return pg["title"]
    return ""


_AUTHOR_FOOTER = re.compile(r"\b(Dr|Pr|Prof)\b|Bouzeria|Boudiaf|DEVICE\s*20|2025\s*/\s*2026", re.I)
_BULLET_LEAD = re.compile(r"^[\-\u2013\u2022\*\u25aa\u00b7]+\s*")


def _is_label(t: str) -> bool:
    """A short term-like block (structure name) rather than a sentence.

    Only reclassifies real supplied text; never invents anything. Labels are the
    short call-outs that sit on a slide next to a micrograph (e.g. 'Endocardium',
    'Parietal pericardium'), so the viewer can offer structure identification.
    """
    if not t or t.endswith((".", ";", ":", ",")):
        return False
    if len(t) > 42 or len(t.split()) > 5:
        return False
    # Keep parenthetical qualifiers like "(visceral sheet)" as labels too.
    return True


def build_histology_slides():
    """Emit src/content/histologySlides.json from the extracted histology images.

    Each record carries only references (src) plus text taken verbatim from the
    image's own source slide: the slide title, the short structure call-outs
    (`labels`), and the explanatory sentences (`text`). The images themselves
    already live under public/content/histologie/. Nothing is invented — when a
    slide has no real title/labels/explanation the fields stay empty and the UI
    falls back to the chapter name. Context is page-level: if a slide holds
    several micrographs they share that slide's text (`pageImageCount` > 1).
    """
    import glob as _glob

    # Stain detection must never fire on ordinary words. Abbreviations are
    # matched case-SENSITIVELY (uppercase only, so 'the'/'These' never match)
    # and full stain names case-insensitively.
    stain_abbr = re.compile(r"(H\s*&\s*E|H\.E\.|HES|\bHE\b|\bEO\b|\bPAS\b|\bM\.E\.S\b)")
    stain_name = re.compile(
        r"(Masson|trichrome|h[ée]matein|h[ée]malun|Gomori|Wright|Giemsa|silver|"
        r"argentique|May-?Gr[üu]nwald|orange\s+G|safranin|carmine|verhoeff|van\s+gieson)",
        re.I,
    )
    slides = []
    files = sorted(_glob.glob(os.path.join(CONTENT_DIR, "histologie", "*.json")))
    for fp in files:
        data = json.load(open(fp))
        cid = data["chapterId"]
        ctitle = data.get("title", cid)
        n = 0
        for pg in data["pages"]:
            pnum = pg.get("n")
            ptitle = clean(pg.get("title", ""))
            slide_title = ptitle if good_title(ptitle) else ""
            # First pass: collect the slide's real heading text (skip images).
            labels, text = [], []
            for b in pg["blocks"]:
                if b.get("type") == "image":
                    continue
                raw = clean(b.get("text", ""))
                if not raw:
                    continue
                if re.fullmatch(r"\d{1,3}", raw):  # bare slide/page number
                    continue
                if _AUTHOR_FOOTER.search(raw):  # running author/session footer
                    continue
                t = clean(_BULLET_LEAD.sub("", raw))
                if not t or t == slide_title or t == ctitle:
                    continue
                if _is_label(t):
                    if t not in labels:
                        labels.append(t)
                elif t not in text:
                    text.append(t)
            img_blocks = [b for b in pg["blocks"] if b.get("type") == "image"]
            page_img_count = len(img_blocks)
            page_ctx = " ".join([slide_title, ptitle, " ".join(labels), " ".join(text)])
            for k, b in enumerate(img_blocks, 1):
                n += 1
                cap = clean(b.get("caption", ""))
                if not good_title(cap):
                    cap = slide_title or (text[0] if text else "")
                stain_src = cap + " " + page_ctx
                m = stain_abbr.search(stain_src) or stain_name.search(stain_src)
                stain_val = None
                if m:
                    v = clean(m.group(1))
                    stain_val = re.sub(r"\s*&\s*", "&", v).upper() if stain_abbr.fullmatch(v) else v.title()
                suffix = f" · img {k}" if page_img_count > 1 else ""
                title = cap[:90] if cap else f"{ctitle} — diapo {pnum}{suffix}"
                slides.append(
                    {
                        "id": f"{cid}-{n:03d}",
                        "src": b["src"],
                        "title": title,
                        "caption": cap or ctitle,
                        "chapterId": cid,
                        "chapterTitle": ctitle,
                        "page": pnum,
                        "pageImageCount": page_img_count,
                        "slideTitle": slide_title or None,
                        "labels": labels,
                        "text": text,
                        "stain": stain_val,
                    }
                )
    with open(os.path.join(CONTENT_DIR, "histologySlides.json"), "w") as f:
        json.dump(slides, f, ensure_ascii=False, indent=1)
    with_labels = sum(1 for s in slides if s["labels"])
    with_text = sum(1 for s in slides if s["text"])
    print(
        f"histologySlides.json: {len(slides)} slides "
        f"({with_labels} with labels, {with_text} with explanation text)"
    )


def main():
    manifest = []
    for dirname, disc in DISC_OF_DIR.items():
        folder = os.path.join(SRC, dirname)
        for fname in sorted(os.listdir(folder)):
            if not fname.lower().endswith((".pdf", ".pptx")):
                continue
            path = os.path.join(folder, fname)
            chapter_id, number, kind = chapter_meta(disc, fname)
            import shutil

            shutil.rmtree(os.path.join(PUBLIC_DIR, disc, chapter_id), ignore_errors=True)
            writer = ChapterWriter(disc, chapter_id)
            if fname.lower().endswith(".pdf"):
                extract_pdf(path, writer)
            else:
                extract_pptx(path, writer)
            title = (
                TITLE_OVERRIDES.get(chapter_id)
                or derive_title(writer.pages)
                or clean(fname).replace("_EN", "").replace("__EN", "")
            )
            topics = []
            for pg in writer.pages:
                for b in pg["blocks"]:
                    if b["type"] == "heading" and b["text"] not in topics:
                        topics.append(b["text"])
            topics = topics[:60]
            payload = {
                "file": f"{dirname}/{fname}",
                "chapterId": chapter_id,
                "title": title,
                "kind": kind,
                "pages": writer.pages,
            }
            os.makedirs(os.path.join(CONTENT_DIR, disc), exist_ok=True)
            with open(os.path.join(CONTENT_DIR, disc, f"{chapter_id}.json"), "w") as f:
                json.dump(payload, f, ensure_ascii=False)
            manifest.append(
                {
                    "discipline": disc,
                    "chapterId": chapter_id,
                    "number": number,
                    "kind": kind,
                    "title": title,
                    "file": f"{dirname}/{fname}",
                    "pages": len(writer.pages),
                    "images": writer.count,
                    "topics": topics,
                }
            )
            print(f"{disc}/{chapter_id}: pages={len(writer.pages)} imgs={writer.count} topics={len(topics)} title={title[:60]}")

    # TD-02 at root -> physiologie-respiratoire
    td2 = os.path.join(SRC, "TD-02)Spirométrie_EN.pdf")
    if os.path.exists(td2):
        disc = "physiologie-respiratoire"
        chapter_id, number, kind = "pr-td02", "TD02", "td"
        writer = ChapterWriter(disc, chapter_id)
        extract_pdf(td2, writer)
        title = TITLE_OVERRIDES.get(chapter_id) or derive_title(writer.pages) or "TD 02 — Spirométrie"
        topics = []
        for pg in writer.pages:
            for b in pg["blocks"]:
                if b["type"] == "heading" and b["text"] not in topics:
                    topics.append(b["text"])
        topics = topics[:60]
        with open(os.path.join(CONTENT_DIR, disc, f"{chapter_id}.json"), "w") as f:
            json.dump(
                {"file": "TD-02)Spirométrie_EN.pdf", "chapterId": chapter_id, "title": title, "kind": kind, "pages": writer.pages},
                f,
                ensure_ascii=False,
            )
        manifest.append(
            {
                "discipline": disc,
                "chapterId": chapter_id,
                "number": number,
                "kind": kind,
                "title": title,
                "file": "TD-02)Spirométrie_EN.pdf",
                "pages": len(writer.pages),
                "images": writer.count,
                "topics": topics,
            }
        )
        print(f"{disc}/{chapter_id}: pages={len(writer.pages)} imgs={writer.count} title={title[:60]}")

    manifest.sort(key=lambda m: (m["discipline"], str(m["number"]).zfill(3)))
    os.makedirs(CONTENT_DIR, exist_ok=True)
    with open(os.path.join(CONTENT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print("manifest:", len(manifest), "chapters")

    build_histology_slides()


if __name__ == "__main__":
    main()
