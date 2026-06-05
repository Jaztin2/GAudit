import { DEFAULT_FEE_TIERS } from '../utils/fees'
import { peso } from '../utils/format'

export default function SettingsTab({
  profile, txCount, totalProfit, currentUser,
  setGcash, setSGcash, setCash, setSCash,
  setTiers, setSTiers,
  onSaveBalances, onSaveFeeTiers, onLogout,
  dark, onToggleDark, installPrompt, onInstall,
}) {
  return (
    <div style={{ paddingBottom: 8 }}>

      {/* Capital */}
      <div className="settings-group">
        <div className="settings-group-title">Capital</div>
        <div style={{ padding: '12px 16px 16px' }}>
          <div className="fg">
            <label>GCash Balance (₱)</label>
            <input type="number" min="0" inputMode="decimal" value={setGcash} onChange={e => setSGcash(e.target.value)} />
          </div>
          <div className="fg">
            <label>Cash on Hand (₱)</label>
            <input type="number" min="0" inputMode="decimal" value={setCash} onChange={e => setSCash(e.target.value)} />
          </div>
          <button className="btn btn-blue" onClick={onSaveBalances}>Save Balances</button>
        </div>
      </div>

      {/* Fee Tiers */}
      <div className="settings-group">
        <div className="settings-group-title">Fee Tiers</div>
        <div style={{ padding: '12px 16px 16px' }}>
          <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 12, lineHeight: 1.5 }}>
            Set your service fees per amount range.
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {['Min ₱','Max ₱','Fee ₱'].map(h => (
              <span key={h} style={{ flex:1, fontSize:11, fontWeight:700, color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.6px', textAlign:'center' }}>{h}</span>
            ))}
            <span style={{ width: 32 }} />
          </div>
          {setTiers.map((t, i) => (
            <div key={i} style={{ display:'flex', gap:6, marginBottom:8, alignItems:'center' }}>
              <input className="tier-input" type="number" min="0" inputMode="numeric" value={t.min}
                onChange={e => setSTiers(prev => prev.map((x,j) => j===i ? {...x, min: Number(e.target.value)||0} : x))} />
              <input className="tier-input" type="number" min="0" inputMode="numeric" value={t.max}
                onChange={e => setSTiers(prev => prev.map((x,j) => j===i ? {...x, max: Number(e.target.value)||0} : x))} />
              <input className="tier-input" type="number" min="0" inputMode="numeric" value={t.fee}
                onChange={e => setSTiers(prev => prev.map((x,j) => j===i ? {...x, fee: Number(e.target.value)||0} : x))} />
              <button onClick={() => setSTiers(prev => prev.filter((_,j) => j!==i))}
                style={{ width:32, height:32, background:'var(--red-light)', border:'none', borderRadius:8, color:'var(--red)', cursor:'pointer', fontSize:16, flexShrink:0 }}>×</button>
            </div>
          ))}
          <button onClick={() => setSTiers(prev => [...prev, {min:0, max:0, fee:0}])}
            style={{ width:'100%', padding:'10px', background:'var(--blue-light)', border:'2px dashed var(--blue)', borderRadius:10, color:'var(--blue)', fontWeight:700, cursor:'pointer', fontSize:14, marginBottom:10 }}>
            + Add Tier
          </button>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-gray" style={{ flex:1 }} onClick={() => setSTiers(DEFAULT_FEE_TIERS.map(t=>({...t})))}>Reset</button>
            <button className="btn btn-blue" style={{ flex:2 }} onClick={onSaveFeeTiers}>Save Tiers</button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-group">
        <div className="settings-group-title">Appearance</div>
        <div style={{ padding: '12px 16px 16px' }}>
          {installPrompt && (
            <button className="btn btn-blue" onClick={onInstall} style={{ marginBottom: 14 }}>
              📲 Install GAudit App
            </button>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{dark ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
            <div onClick={onToggleDark} style={{
              width: 50, height: 28, borderRadius: 14, cursor: 'pointer', position: 'relative',
              background: dark ? 'var(--blue)' : 'var(--border)', transition: 'background 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: dark ? 25 : 3,
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="settings-group">
        <div className="settings-group-title">Account</div>
        <div style={{ padding: '12px 16px 16px' }}>
          <div className="detail-section" style={{ marginBottom: 14 }}>
            <div className="detail-row"><span className="dl">Email</span><span className="dv" style={{ fontSize:13 }}>{currentUser.email}</span></div>
            <div className="detail-row"><span className="dl">Total transactions</span><span className="dv">{txCount}</span></div>
            <div className="detail-row"><span className="dl">All-time profit</span><span className="dv" style={{ color:'var(--green)' }}>{peso(totalProfit)}</span></div>
          </div>
          <button className="btn btn-danger" onClick={onLogout}>Log Out</button>
        </div>
      </div>

    </div>
  )
}
