const STATUS_STYLES: Record<string, string> = {
  live: 'bg-green-100 text-green-800 border-green-300',
  dead: 'bg-red-100 text-red-800 border-red-300',
  alienated: 'bg-orange-100 text-orange-800 border-orange-300',
  migrated: 'bg-blue-100 text-blue-800 border-blue-300',
  new: 'bg-purple-100 text-purple-800 border-purple-300',
  pending: 'bg-gray-100 text-gray-600',
  synced: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
}

export function Badge({ label, variant }: { label: string; variant: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[variant] ?? STATUS_STYLES.pending}`}
    >
      {variant === 'synced' && <span aria-hidden>✓</span>}
      {variant === 'pending' && <span aria-hidden>☁</span>}
      {variant === 'failed' && <span aria-hidden>!</span>}
      {label}
    </span>
  )
}

export function voterStatusVariant(v: {
  isDead: boolean
  isAlienated: boolean
  isImmigrated: boolean
  isNewVoter: boolean
  isLive: boolean
}): { label: string; variant: string } {
  if (v.isDead) return { label: 'Dead', variant: 'dead' }
  if (v.isAlienated) return { label: 'Alienated', variant: 'alienated' }
  if (v.isImmigrated) return { label: 'Migrated', variant: 'migrated' }
  if (v.isNewVoter) return { label: 'New', variant: 'new' }
  if (v.isLive) return { label: 'Live', variant: 'live' }
  return { label: 'Unknown', variant: 'pending' }
}
