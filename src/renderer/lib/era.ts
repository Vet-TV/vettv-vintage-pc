import type { GuestEra } from '@shared/types'

export const ERA_OPTIONS: {
  id: GuestEra
  title: string
  blurb: string
  experimental?: boolean
}[] = [
  {
    id: 'win95',
    title: 'Windows 95',
    blurb: 'Mid-90s desktop profile · SB16 sound'
  },
  {
    id: 'win98se',
    title: 'Windows 98 / 98SE',
    blurb: 'Default MVP profile for classic 9x gaming'
  },
  {
    id: 'win2000',
    title: 'Windows 2000',
    blurb: 'Experimental until smoke bar passes',
    experimental: true
  }
]

export function eraLabel(era: GuestEra): string {
  return ERA_OPTIONS.find((e) => e.id === era)?.title || era
}
