export function peso(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function fmtDate(timestamp) {
  if (!timestamp) return '—'
  const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  return d.toLocaleString('en-PH', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export function isToday(timestamp) {
  if (!timestamp) return false
  const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  return d.toDateString() === new Date().toDateString()
}
