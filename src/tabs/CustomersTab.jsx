import { useState } from 'react'
import { peso, fmtDate } from '../utils/format'

const TYPE_LABEL = { cashin: 'Cash In', cashout: 'Cash Out', other: 'Other' }
const TYPE_COLOR = { cashin: 'var(--green)', cashout: 'var(--red)', other: 'var(--orange)' }

export default function CustomersTab({ customers, txs, onDelete, onOpenDetail }) {
  const [expanded, setExpanded] = useState(null)

  const stats = customers.map(c => {
    const cTxs = txs.filter(t => (t.customerName || '').toLowerCase() === c.name.toLowerCase())
    const totalProfit = cTxs.reduce((s, t) => s + (t.fee || 0), 0)
    return { ...c, cTxs, totalProfit }
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
            <div key={c.id} style={{ marginBottom: 8 }}>
              {/* Customer header row */}
              <div className="tx-item" onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                style={{ borderRadius: expanded === c.id ? '12px 12px 0 0' : 12 }}>
                <div className="tx-ico" style={{ background: '#E6F0FF', color: 'var(--blue)', fontSize: 20 }}>👤</div>
                <div className="tx-body">
                  <div className="tx-type">{c.name}</div>
                  <div className="tx-note">{c.phone || 'No number'} · {c.cTxs.length} transaction{c.cTxs.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="tx-right">
                  <div className="tx-profit" style={{ fontSize: 13 }}>+{peso(c.totalProfit)} profit</div>
                  <div style={{ fontSize: 11, color: 'var(--red)', cursor: 'pointer', marginTop: 6, fontWeight: 600 }}
                    onClick={e => { e.stopPropagation(); onDelete(c.id) }}>Remove</div>
                </div>
              </div>

              {/* Expanded transaction logs */}
              {expanded === c.id && (
                <div style={{ background: '#F5F8FF', borderRadius: '0 0 12px 12px', border: '1px solid #E0EAFF', borderTop: 'none', overflow: 'hidden' }}>
                  {c.cTxs.length === 0
                    ? <div style={{ padding: '14px 16px', color: 'var(--gray)', fontSize: 13 }}>No transactions yet.</div>
                    : c.cTxs.map(tx => (
                      <div key={tx.id}
                        onClick={() => onOpenDetail(tx)}
                        style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #EEF3FF', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseDown={e => e.currentTarget.style.background = '#EBF2FF'}
                        onMouseUp={e => e.currentTarget.style.background = ''}
                        onTouchStart={e => e.currentTarget.style.background = '#EBF2FF'}
                        onTouchEnd={e => e.currentTarget.style.background = ''}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: TYPE_COLOR[tx.type] }}>{TYPE_LABEL[tx.type]}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 2 }}>{fmtDate(tx.timestamp)}{tx.notes ? ` · ${tx.notes}` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{peso(tx.amount)}</div>
                          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>+{peso(tx.fee)}</div>
                        </div>
                        <div style={{ marginLeft: 10, color: 'var(--gray)', fontSize: 16 }}>›</div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          ))
        }
      </div>
    </>
  )
}
