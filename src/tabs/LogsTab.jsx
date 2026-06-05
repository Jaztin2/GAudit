import { useState } from 'react'
import TxRow from '../components/TxRow'
import { peso } from '../utils/format'

const LABELS = { cashin: 'Cash In', cashout: 'Cash Out', other: 'Other' }

function getDateKey(timestamp) {
  if (!timestamp) return 'Unknown'
  const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function LogsTab({ txs, onOpenDetail, onClearAll }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter)

  // Group by day
  const groups = []
  const seen = {}
  filtered.forEach(tx => {
    const key = getDateKey(tx.timestamp)
    if (!seen[key]) { seen[key] = []; groups.push({ key, txs: seen[key] }) }
    seen[key].push(tx)
  })

  return (
    <>
      <div className="sec-hdr" style={{ paddingTop: 4 }}>
        <span className="sec-title">Transaction Logs</span>
        {txs.length > 0 && <span className="sec-link" onClick={onClearAll}>Clear All</span>}
      </div>

      <div className="filter-chips">
        {['all','cashin','cashout','other'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : LABELS[f]}
          </button>
        ))}
      </div>

      <div className="tx-list">
        {filtered.length === 0
          ? <div className="empty-state"><div className="eim">📋</div><p>No {filter !== 'all' ? LABELS[filter] : ''} transactions yet.</p></div>
          : groups.map(({ key, txs: dayTxs }) => {
              const dayProfit = dayTxs.reduce((s, t) => s + (t.fee || 0), 0)
              return (
                <div key={key}>
                  {/* Day header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px 6px' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--dark)' }}>{key}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'var(--green-light)', padding: '3px 10px', borderRadius: 20 }}>
                      +{peso(dayProfit)} profit
                    </span>
                  </div>
                  {/* Transactions for this day */}
                  {dayTxs.map(tx => <TxRow key={tx.id} tx={tx} onClick={() => onOpenDetail(tx)} showDate />)}
                </div>
              )
            })
        }
      </div>
    </>
  )
}
