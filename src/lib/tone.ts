import type { MovementType, PoStatus, SerialStatus, Tone } from '@/entities/types'
import { daysUntil } from './format'

export function toneClasses(tone: Tone): { bg: string; fg: string } {
  switch (tone) {
    case 'green':
      return { bg: 'bg-[var(--green-weak)]', fg: 'text-[var(--green)]' }
    case 'amber':
      return { bg: 'bg-[var(--amber-weak)]', fg: 'text-[var(--amber)]' }
    case 'red':
      return { bg: 'bg-[var(--red-weak)]', fg: 'text-[var(--red)]' }
    case 'violet':
      return { bg: 'bg-[var(--violet-weak)]', fg: 'text-[var(--violet)]' }
    case 'teal':
      return { bg: 'bg-[var(--teal-weak)]', fg: 'text-[var(--teal)]' }
    case 'accent':
      return { bg: 'bg-[var(--brand-accent-weak)]', fg: 'text-[var(--brand-accent-d)]' }
    default:
      return { bg: 'bg-[var(--surface-3)]', fg: 'text-[var(--text-2)]' }
  }
}

export function toneColor(tone: Tone): string {
  switch (tone) {
    case 'green':
      return 'var(--green)'
    case 'amber':
      return 'var(--amber)'
    case 'red':
      return 'var(--red)'
    case 'violet':
      return 'var(--violet)'
    case 'teal':
      return 'var(--teal)'
    case 'accent':
      return 'var(--brand-accent-d)'
    default:
      return 'var(--text-2)'
  }
}

export function stockTone(qty: number, min: number): Tone {
  if (qty <= 0) return 'red'
  if (qty < min) return 'amber'
  return 'green'
}

export function poStatusTone(status: PoStatus): Tone {
  const map: Record<PoStatus, Tone> = {
    DRAFT: 'neutral',
    CONFIRMED: 'accent',
    PARTIAL_RECEIVED: 'amber',
    FULLY_RECEIVED: 'green',
    CLOSED: 'teal',
    CANCELLED: 'red',
  }
  return map[status]
}

export function movementTypeTone(type: MovementType): Tone {
  const map: Record<MovementType, Tone> = {
    RECEIVING: 'green',
    ISSUE: 'amber',
    ADJUSTMENT: 'neutral',
    TRANSFER_IN: 'accent',
    TRANSFER_OUT: 'accent',
    RETURN: 'teal',
  }
  return map[type]
}

export function serialStatusTone(status: SerialStatus): Tone {
  const map: Record<SerialStatus, Tone> = {
    IN_STOCK: 'green',
    ISSUED: 'amber',
    RETURNED: 'accent',
    DAMAGED: 'red',
  }
  return map[status]
}

const HASH_TONES: Tone[] = ['accent', 'violet', 'teal', 'amber', 'green', 'red']

export function hashTone(seed: string): Tone {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return HASH_TONES[hash % HASH_TONES.length]
}

export function expiryTone(expiry: string, remaining: number): Tone {
  if (remaining <= 0) return 'neutral'
  const d = daysUntil(expiry)
  if (d < 0) return 'red'
  if (d <= 60) return 'amber'
  return 'green'
}
