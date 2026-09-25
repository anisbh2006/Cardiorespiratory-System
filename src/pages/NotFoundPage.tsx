import { Link } from 'react-router-dom'
import { HeartCrack } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10 shadow-[0_0_0_6px_rgba(224,36,58,0.04)]">
        <HeartCrack className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-6 font-serif text-5xl font-bold tracking-tight text-foreground">404</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        Cette page est introuvable — comme une veine pulmonaire dans un modèle 3D non chargé.
      </p>
      <Link to="/" className="mt-8">
        <Button size="lg">Retour à l'accueil</Button>
      </Link>
    </div>
  )
}
