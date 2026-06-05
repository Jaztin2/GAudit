import { useState, useEffect } from 'react'
import { getFee } from '../utils/fees'
import { peso, fmtDate } from '../utils/format'

const COLORS = {
  cashin:  { bg: 'var(--green-light)',  fg: 'var(--green)',  icon: '↙', label: 'Cash In'  },
  cashout: { bg: 'var(--red-light)',    fg: 'var(--red)',    icon: '↗', label: 'Cash Out' },
  other:   { bg: 'var(--orange-light)', fg: 'var(--orange)', icon: '⊕', label: 'Other'    },
}

export default function DetailModal({ tx, feeTiers, onClose, onDelete, onEdit }) {
  const [editing,     setEditing]     = useState(false)
  const [editType,    setEditType]    = useState('cashin')
  const [editAmount,  setEditAmount]  = useState('')
  const [editFee,     setEditFee]     = useState('')
  const [editNotes,   setEditNotes]   = useState('')
  const [editCustName,  setEditCustName]  = useState('')
  const [editCustPhone, setEditCustPhone] = useState('')

  useEffect(() => {
    if (tx) {
      setEditing(false)
      setEditType(tx.type)
      setEditAmount(tx.amount)
      setEditFee(tx.fee)
      setEditNotes(tx.notes || '')
      setEditCustName(tx.customerName || '')
      setEditCustPhone(tx.customerPhone || '')
    }
  }, [tx])

  if (!tx) return <div className="overlay" />

  const c = COLORS[tx.type] || COLORS.other

  const editAmt    = parseInt(editAmount) || 0
  const autoFee    = editAmt > 0 ? getFee(editAmt, feeTiers) : null
  const computedFee = autoFee !== null ? autoFee : (parseInt(editFee) || 0)

  function handleDelete() {
    if (!window.confirm('Delete this transaction? Your balances will be reversed.')) return
    onDelete(tx)
  }

  function handleSaveEdit() {
    if (editAmt <= 0) return
    onEdit(tx, editType, editAmt, computedFee, editNotes.trim(), editCustName.trim(), editCustPhone.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="overlay on" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="drag-handle" />
          <h2>Edit Transaction</h2>

          <div className="fg">
            <label>Type</label>
            <select value={editType} onChange={e => setEditType(e.target.value)}>
              <option value="cashin">Cash In</option>
              <option value="cashout">Cash Out</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="fg">
            <label>Amount (₱)</label>
            <input className="big" type="number" inputMode="numeric" min="1"
              value={editAmount} onChange={e => setEditAmount(e.target.value)} />
          </div>

          <div className="fg">
            <label>Fee / Profit (₱){autoFee !== null ? ` — auto: ₱${autoFee}` : ' — enter manually'}</label>
            <input type="number" inputMode="numeric" min="0"
              value={autoFee !== null ? autoFee : editFee}
              disabled={autoFee !== null}
              onChange={e => setEditFee(e.target.value)}
              style={{ background: autoFee !== null ? 'var(--gray-light)' : 'white' }}
            />
          </div>

          <div className="fg">
            <label>Customer Name (optional)</label>
            <input type="text" placeholder="Name" value={editCustName} onChange={e => setEditCustName(e.target.value)} />
          </div>

          <div className="fg">
            <label>Customer Phone (optional)</label>
            <input type="tel" placeholder="09xx xxx xxxx" value={editCustPhone} onChange={e => setEditCustPhone(e.target.value)} />
          </div>

          <div className="fg">
            <label>Notes (optional)</label>
            <input type="text" placeholder="Reference, notes…" value={editNotes} onChange={e => setEditNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-gray" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-blue" style={{ flex: 2 }} onClick={handleSaveEdit} disabled={editAmt <= 0}>Save Changes</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`overlay ${tx ? 'on' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="drag-handle" />

        <div className="detail-type-badge" style={{ background: c.bg, color: c.fg }}>
          {c.icon} &nbsp;{c.label}
        </div>

        <div className="detail-section">
          {tx.type === 'cashin' && <>
            <div className="detail-row"><span className="dl">Customer gave (cash)</span><span className="dv">{peso(tx.amount + tx.fee)}</span></div>
            <div className="detail-row"><span className="dl">Sent to customer GCash</span><span className="dv">{peso(tx.amount)}</span></div>
          </>}
          {tx.type === 'cashout' && <>
            <div className="detail-row"><span className="dl">Received via GCash</span><span className="dv">{peso(tx.amount)}</span></div>
            <div className="detail-row"><span className="dl">Given to customer (cash)</span><span className="dv">{peso(tx.amount - tx.fee)}</span></div>
          </>}
          {tx.type === 'other' && <>
            <div className="detail-row"><span className="dl">Transaction amount</span><span className="dv">{peso(tx.amount)}</span></div>
          </>}
          <div className="detail-row" style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 10 }}>
            <span className="dl">Service fee</span>
            <span className="dv" style={{ color: 'var(--green)' }}>+{peso(tx.fee)}</span>
          </div>
          <div className="detail-row">
            <span className="dl" style={{ fontWeight: 700 }}>Your profit</span>
            <span className="dv" style={{ color: 'var(--green)', fontSize: 17 }}>+{peso(tx.fee)}</span>
          </div>
        </div>

        <div className="detail-section">
          {tx.customerName && <div className="detail-row"><span className="dl">👤 Customer</span><span className="dv">{tx.customerName}{tx.customerPhone ? ` · ${tx.customerPhone}` : ''}</span></div>}
          {tx.notes && <div className="detail-row"><span className="dl">📝 Notes</span><span className="dv" style={{ maxWidth: '65%', textAlign: 'right' }}>{tx.notes}</span></div>}
          <div className="detail-row"><span className="dl">🕐 Date &amp; Time</span><span className="dv" style={{ fontWeight: 500 }}>{fmtDate(tx.timestamp)}</span></div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete}>Delete</button>
          <button className="btn btn-blue"   style={{ flex: 1 }} onClick={() => setEditing(true)}>Edit</button>
        </div>
      </div>
    </div>
  )
}
