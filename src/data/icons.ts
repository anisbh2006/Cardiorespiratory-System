import {
  Activity,
  AirVent,
  Atom,
  Heart,
  Microscope,
  Wind,
  type LucideIcon,
} from 'lucide-react'

/** Maps the `icon` string field in data files to Lucide components. */
export const iconRegistry: Record<string, LucideIcon> = {
  Heart,
  Wind,
  Atom,
  Microscope,
  Activity,
  AirVent,
}

export function getDisciplineIcon(name: string): LucideIcon {
  return iconRegistry[name] ?? Heart
}
