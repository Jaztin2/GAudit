import { useState, useEffect, useRef } from 'react'
import { getFee, DEFAULT_FEE_TIERS } from '../utils/fees'
import { peso } from '../utils/format'

const CONFIG = {
  cashin:  { title: 'Cash In',      btnClass: 'btn-green',  custLbl: 'Customer pays (cash)',      gcashLbl: 'You send to their GCash' },
  cashout: { title: 'Cash Out',     btnClass: 'btn-red',    custLbl: 'You give cash to customer',  gcashLbl: 'You receive from GCash'  },
  other:   { title: 'Other Income', btnClass: 'btn-orange', custLbl: 'Transaction amount',         gcashLbl: 'Type / description'      },
}

export default function TxModal({ isOpen, type, feeTiers, customers = [], onClose, onSubmit }) {
  const [amount,    setAmount]    = useState('')
  const [customFee, setCustomFee] = useState('')
  const [custName,  setCustName]  = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [notes,     setNotes]     = useState('')
  const [showSug,   setShowSug]   = useState(false)
  const nameRef = useRef(null)

  const tiers = feeTiers || DEFAULT_FEE_TIERS

  useEffect(() => {
    if (isOpen) {
      setAmount(''); setCustomFee(''); setCustName('')
      setCustPhone(''); setNotes(''); setShowSug(false)
    }
  }, [isOpen, type])

  const amt      = parseInt(amount) || 0
  const autoFee  = amt > 0 ? getFee(amt, tiers) : null
  const fee      = autoFee !== null ? autoFee : (parseInt(customFee) || 0)
  const showBox  = amt > 0
  const needCustom = amt > 0 && autoFee === null

  const suggestions = custName.trim().length > 0
    ? customers.filter(c => c.name.toLowerCase().includes(custName.toLowerCase()))
    : []

  const cfg = CONFIG[type] || CONFIG.cashin

  function selectCustomer(c) {
    setCustName(c.name)
    setCustPhone(c.phone || '')
    setShowSug(false)
  }

  function custAmt() {
    if (type === 'cashin')  return peso(amt + fee)
    if (type === 'cashout') return peso(amt - fee)
    return peso(amt)
  }
  function gcashAmt() {
    if (type === 'cashin' || type === 'cashout') return peso(amt)
    return '—'
  }

  async function submit() {
    if (amt <= 0) return
    await onSubmit(type, amt, fee, notes.trim(), custName.trim(), custPhone.trim())
    onClose()
  }

  return (
    <div className={`overlay ${isOpen ? 'on' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="drag-handle" />
        <h2>{cfg.title}</h2>

        {/* Customer name with autocomplete */}
        <div className="fg" style={{ position: 'relative' }}>
          <label>Customer Name (optional)</label>
          <input
            ref={nameRef}
            type="text"
            placeholder="Type name…"
            value={custName}
            onChange={e => { setCustName(e.target.value); setShowSug(true) }}
            onFocus={() => setShowSug(true)}
            onBlur={() => setTimeout(() => setShowSug(false), 150)}
            autoComplete="off"
          />
          {showSug && suggestions.length > 0 && (
            <div className="autocomplete-list">
              {suggestions.map(c => (
                <div key={c.id} className="autocomplete-item" onMouseDown={() => selectCustomer(c)}>
                  <span style={{ fontWeight: 700 }}>{c.name}</span>
                  {c.phone && <span style={{ color: 'var(--gray)', fontSize: 12, marginLeft: 8 }}>{c.phone}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phone — only relevant for cash-in */}
        {type === 'cashin' && (
          <div className="fg">
            <label>Phone Number (optional)</label>
            <input
              type="tel" placeholder="09xx xxx xxxx"
              value={custPhone} onChange={e => setCustPhone(e.target.value)}
            />
          </div>
        )}

        {/* Amount */}
        <div className="fg">
          <label>Amount (₱)</label>
          <input
            className="big" type="number" inputMode="numeric"
            placeholder="0" min="1" value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        {/* Fee preview */}
        <div className={`fee-box ${showBox ? 'vis' : ''}`}>
          <div className="fee-row">
            <span className="fl">{cfg.custLbl}</span>
            <span><strong>{custAmt()}</strong></span>
          </div>
          <div className="fee-row">
            <span className="fl">{cfg.gcashLbl}</span>
            <span>{gcashAmt()}</span>
          </div>
          <div className="fee-row">
            <span className="fl">Service fee</span>
            <span style={{ color: 'var(--green)', fontWeight: 800 }}>+{peso(fee)}</span>
          </div>
          <div className="fee-row total profit">
            <span>Your profit</span>
            <span>+{peso(fee)}</span>
          </div>
        </div>

        {needCustom && (
          <div className="fg mt12">
            <label>Custom Fee (₱) — outside your fee tiers</label>
            <input type="number" inputMode="numeric" placeholder="0" min="0" value={customFee} onChange={e => setCustomFee(e.target.value)} />
          </div>
        )}

        <div className="fg mt12">
          <label>Notes (optional)</label>
          <input type="text" placeholder="Reference #, purpose…" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <button className={`btn ${cfg.btnClass} mt16`} onClick={submit} disabled={amt <= 0}>
          Record Transaction
        </button>
      </div>
    </div>
  )
}
