import { peso } from '../utils/format'

export default function CustomersTab({ customers, txs, onDelete }) {
  const stats = customers.map(c => {
    const cTxs = txs.filter(t => (t.customerName || '').toLowerCase() === c.name.toLowerCase())
    return { ...c, txCount: cTxs.length, totalAmt: cTxs.reduce((s, t) => s + t.amount, 0) }
  })

  return (
    <>
      <div className="sec-hdr" style={{ paddingTop: 4 }}>
        <span className="sec-title">Customer Directory</span>
        <span className="sec-title" style={{ fontWeight: 400 }}>{customers.length} saved</span>
      </div>
      <div className="tx-list">
        {customers.length === 0
          ? <div className="empty-state"><div className="eim">👥</div><p>No customers yet.<br/>Names you enter in Cash In<br/>transactions are saved here.</p></div>
          : stats.map(c => (
            <div key={c.id} className="tx-item">
              <div className="tx-ico" style={{ background: '#E6F0FF', color: 'var(--blue)', fontSize: 20 }}>👤</div>
              <div className="tx-body">
                <div className="tx-type">{c.name}</div>
                <div className="tx-note">{c.phone || 'No number'} · {c.txCount} transaction{c.txCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="tx-right">
                <div className="tx-amt">{peso(c.totalAmt)}</div>
                <div style={{ fontSize: 11, color: 'var(--red)', cursor: 'pointer', marginTop: 4, fontWeight: 600 }} onClick={() => onDelete(c.id)}>Remove</div>
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}
