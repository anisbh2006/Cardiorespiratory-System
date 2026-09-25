interface DataTableProps {
  headers: string[]
  rows: string[][]
  caption?: string
}

export function DataTable({ headers, rows, caption }: DataTableProps) {
  return (
    <div className="my-7 overflow-hidden rounded-lg border border-border shadow-xs">
      {caption && (
        <div className="border-b border-border bg-elevated px-4 py-2.5 text-xs font-medium text-muted">
          {caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/50 bg-background/40 transition-colors duration-150 last:border-0 even:bg-surface/40 hover:bg-elevated/60"
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 align-top text-foreground/85">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
