import { useState } from 'react'
import TxRow from '../components/TxRow'

const LABELS = { cashin: 'Cash In', cashout: 'Cash Out', other: 'Other' }

export default function LogsTab({ txs, onOpenDetail, onClearAll }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter)

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
          : filtered.map(tx => <TxRow key={tx.id} tx={tx} onClick={() => onOpenDetail(tx)} showDate />)
        }
      </div>
    </>
  )
}
