import { Link } from 'react-router-dom'
import { HeartCrack } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
      <HeartCrack className="h-10 w-10 text-primary" />
      <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground">404</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Cette page est introuvable — comme une veine pulmonaire dans un modèle 3D non chargé.
      </p>
      <Link to="/" className="mt-6">
        <Button>Retour à l'accueil</Button>
      </Link>
    </div>
  )
}
