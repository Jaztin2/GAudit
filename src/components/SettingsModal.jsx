import { useState, useEffect } from 'react'
import { DEFAULT_FEE_TIERS } from '../utils/fees'
import { peso } from '../utils/format'

export default function SettingsModal({ isOpen, profile, feeTiers, txCount, totalProfit, onClose, onSave, onSaveFeeTiers }) {
  const [tab,   setTab]   = useState('bal')
  const [gcash, setGcash] = useState('')
  const [cash,  setCash]  = useState('')
  const [tiers, setTiers] = useState([])

  useEffect(() => {
    if (isOpen) {
      setGcash(profile.gcashBalance ?? 0)
      setCash(profile.cashOnHand ?? 0)
      setTiers((feeTiers || DEFAULT_FEE_TIERS).map(t => ({ ...t })))
      setTab('bal')
    }
  }, [isOpen, profile, feeTiers])

  function handleSaveBal() {
    onSave(parseFloat(gcash) || 0, parseFloat(cash) || 0)
  }

  function updateTier(idx, field, val) {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: Number(val) || 0 } : t))
  }

  function addTier() {
    setTiers(prev => [...prev, { min: 0, max: 0, fee: 0 }])
  }

  function removeTier(idx) {
    setTiers(prev => prev.filter((_, i) => i !== idx))
  }

  function handleSaveTiers() {
    const sorted = [...tiers]
      .filter(t => t.max > 0 && t.fee > 0)
      .sort((a, b) => a.min - b.min)
    onSaveFeeTiers(sorted)
  }

  function resetTiers() {
    setTiers(DEFAULT_FEE_TIERS.map(t => ({ ...t })))
  }

  return (
    <div className={`overlay ${isOpen ? 'on' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="drag-handle" />
        <h2>Settings</h2>

        <div className="tabs">
          <div className={`tab ${tab === 'bal'   ? 'on' : ''}`} onClick={() => setTab('bal')}>Balances</div>
          <div className={`tab ${tab === 'fees'  ? 'on' : ''}`} onClick={() => setTab('fees')}>Fee Tiers</div>
          <div className={`tab ${tab === 'about' ? 'on' : ''}`} onClick={() => setTab('about')}>Account</div>
        </div>

        {tab === 'bal' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 16, lineHeight: 1.5 }}>
              Manually adjust balances if they don't match. This won't add a transaction.
            </p>
            <div className="fg">
              <label>GCash Balance (₱)</label>
              <input type="number" min="0" inputMode="decimal" value={gcash} onChange={e => setGcash(e.target.value)} />
            </div>
            <div className="fg">
              <label>Cash on Hand (₱)</label>
              <input type="number" min="0" inputMode="decimal" value={cash} onChange={e => setCash(e.target.value)} />
            </div>
            <button className="btn btn-blue" onClick={handleSaveBal}>Save Balances</button>
          </>
        )}

        {tab === 'fees' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 14, lineHeight: 1.5 }}>
              Edit your service fee tiers. Add ₱1,000+ tiers here.
            </p>

            <div style={{ display: 'flex', gap: 6, marginBottom: 8, padding: '0 2px' }}>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Min (₱)</span>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Max (₱)</span>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Fee (₱)</span>
              <span style={{ width: 32 }} />
            </div>

            {tiers.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                <input
                  className="tier-input" type="number" min="0" inputMode="numeric"
                  value={t.min} onChange={e => updateTier(idx, 'min', e.target.value)}
                />
                <input
                  className="tier-input" type="number" min="0" inputMode="numeric"
                  value={t.max} onChange={e => updateTier(idx, 'max', e.target.value)}
                />
                <input
                  className="tier-input" type="number" min="0" inputMode="numeric"
                  value={t.fee} onChange={e => updateTier(idx, 'fee', e.target.value)}
                />
                <button
                  onClick={() => removeTier(idx)}
                  style={{ width: 32, height: 32, background: 'var(--red-light)', border: 'none', borderRadius: 8, color: 'var(--red)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
                >×</button>
              </div>
            ))}

            <button
              onClick={addTier}
              style={{ width: '100%', padding: '10px', background: 'var(--blue-light)', border: '2px dashed var(--blue)', borderRadius: 10, color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}
            >+ Add Tier</button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-gray" style={{ flex: 1 }} onClick={resetTiers}>Reset Default</button>
              <button className="btn btn-blue" style={{ flex: 2 }} onClick={handleSaveTiers}>Save Tiers</button>
            </div>
          </>
        )}

        {tab === 'about' && (
          <div className="detail-section">
            <div className="detail-row"><span className="dl">Total transactions</span><span className="dv">{txCount}</span></div>
            <div className="detail-row"><span className="dl">All-time profit</span><span className="dv" style={{ color: 'var(--green)' }}>{peso(totalProfit)}</span></div>
            <div className="detail-row"><span className="dl">App version</span><span className="dv">gaudit 1.0</span></div>
          </div>
        )}
      </div>
    </div>
  )
}
