import { useState, useEffect, useCallback } from 'react'
import {
  doc, collection, query, orderBy, onSnapshot,
  runTransaction, setDoc, updateDoc, addDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import TxModal      from '../components/TxModal'
import DetailModal  from '../components/DetailModal'
import HomeTab      from '../tabs/HomeTab'
import LogsTab      from '../tabs/LogsTab'
import CustomersTab from '../tabs/CustomersTab'
import SettingsTab  from '../tabs/SettingsTab'
import { DEFAULT_FEE_TIERS } from '../utils/fees'
import { peso } from '../utils/format'

const NAV = [
  { id: 'home',      ico: '🏠', label: 'Home'      },
  { id: 'logs',      ico: '📋', label: 'Logs'      },
  { id: 'customers', ico: '👥', label: 'Customers' },
  { id: 'settings',  ico: '⚙️', label: 'Settings'  },
]

export default function Home() {
  const { currentUser, logout } = useAuth()
  const uid = currentUser.uid

  // ── Data state ─────────────────────────────────────────────
  const [profile,    setProfile]    = useState(null)
  const [feeTiers,   setFeeTiers]   = useState(DEFAULT_FEE_TIERS)
  const [txs,        setTxs]        = useState([])
  const [customers,  setCustomers]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)

  // ── UI state ───────────────────────────────────────────────
  const [activeTab, setActiveTab]  = useState('home')
  const [txModal,   setTxModal]    = useState({ open: false, type: 'cashin' })
  const [detailTx,  setDetailTx]   = useState(null)
  const [toast,     setToast]      = useState('')
  const [busy,      setBusy]       = useState(false)

  // ── Setup form ─────────────────────────────────────────────
  const [setupGcash, setSetupGcash] = useState('')
  const [setupCash,  setSetupCash]  = useState('')

  // ── Settings form (lifted so SettingsTab can mutate) ───────
  const [sGcash,  setSGcash]  = useState('')
  const [sCash,   setSCash]   = useState('')
  const [sTiers,  setSTiers]  = useState([])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2600) }

  // ── Firestore ──────────────────────────────────────────────
  useEffect(() => {
    const userRef = doc(db, 'users', uid)
    const unsubUser = onSnapshot(userRef, snap => {
      if (!snap.exists() || !snap.data().setupComplete) {
        setNeedsSetup(true); setLoading(false)
      } else {
        const d = snap.data()
        setProfile(d); setFeeTiers(d.feeTiers || DEFAULT_FEE_TIERS)
        setNeedsSetup(false); setLoading(false)
      }
    }, () => setLoading(false))

    const unsubTx = onSnapshot(
      query(collection(db, 'users', uid, 'transactions'), orderBy('timestamp', 'desc')),
      snap => setTxs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    const unsubCust = onSnapshot(
      query(collection(db, 'users', uid, 'customers'), orderBy('name')),
      snap => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return () => { unsubUser(); unsubTx(); unsubCust() }
  }, [uid])

  // Sync settings form fields when data loads
  useEffect(() => {
    if (profile) { setSGcash(profile.gcashBalance ?? 0); setSCash(profile.cashOnHand ?? 0) }
    setSTiers((feeTiers || DEFAULT_FEE_TIERS).map(t => ({ ...t })))
  }, [profile, feeTiers])

  // ── Handlers ──────────────────────────────────────────────
  async function handleSetup() {
    if (busy) return; setBusy(true)
    try {
      await setDoc(doc(db, 'users', uid), {
        gcashBalance: parseFloat(setupGcash) || 0, cashOnHand: parseFloat(setupCash) || 0,
        feeTiers: DEFAULT_FEE_TIERS, setupComplete: true, createdAt: serverTimestamp(),
      })
    } catch { showToast('Error. Try again.') }
    finally { setBusy(false) }
  }

  async function saveCustomer(name, phone) {
    if (!name) return
    const ex = customers.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (ex) { if (phone && phone !== ex.phone) await updateDoc(doc(db, 'users', uid, 'customers', ex.id), { phone }) }
    else await addDoc(collection(db, 'users', uid, 'customers'), { name, phone: phone || '', createdAt: serverTimestamp() })
  }

  const handleAddTx = useCallback(async (type, amount, fee, notes, custName, custPhone) => {
    try {
      await runTransaction(db, async t => {
        const snap = await t.get(doc(db, 'users', uid))
        const p = snap.exists() ? snap.data() : { gcashBalance: 0, cashOnHand: 0 }
        let gcash = p.gcashBalance ?? 0, cash = p.cashOnHand ?? 0
        if (type === 'cashin')       { gcash -= amount; cash += amount + fee }
        else if (type === 'cashout') { gcash += amount; cash -= (amount - fee) }
        else                         { cash  += fee }
        t.set(doc(collection(db, 'users', uid, 'transactions')), {
          type, amount, fee, notes, customerName: custName || '', customerPhone: custPhone || '', timestamp: serverTimestamp(),
        })
        t.update(doc(db, 'users', uid), { gcashBalance: gcash, cashOnHand: cash })
      })
      if (custName) await saveCustomer(custName, custPhone)
      showToast(`✓ ${type === 'cashin' ? 'Cash In' : type === 'cashout' ? 'Cash Out' : 'Other'} +${peso(fee)} profit`)
    } catch (e) { console.error(e); showToast('Error adding transaction') }
  }, [uid, customers])

  async function handleEditTx(oldTx, nType, nAmt, nFee, nNotes, nCN, nCP) {
    try {
      await runTransaction(db, async t => {
        const snap = await t.get(doc(db, 'users', uid))
        const p = snap.data()
        let gcash = p.gcashBalance, cash = p.cashOnHand
        if (oldTx.type === 'cashin')       { gcash += oldTx.amount; cash -= (oldTx.amount + oldTx.fee) }
        else if (oldTx.type === 'cashout') { gcash -= oldTx.amount; cash += (oldTx.amount - oldTx.fee) }
        else                               { cash  -= oldTx.fee }
        if (nType === 'cashin')       { gcash -= nAmt; cash += nAmt + nFee }
        else if (nType === 'cashout') { gcash += nAmt; cash -= (nAmt - nFee) }
        else                         { cash  += nFee }
        t.update(doc(db, 'users', uid, 'transactions', oldTx.id), { type: nType, amount: nAmt, fee: nFee, notes: nNotes, customerName: nCN || '', customerPhone: nCP || '' })
        t.update(doc(db, 'users', uid), { gcashBalance: gcash, cashOnHand: cash })
      })
      if (nCN) await saveCustomer(nCN, nCP)
      setDetailTx(null); showToast('Transaction updated')
    } catch { showToast('Error updating') }
  }

  async function handleDeleteTx(tx) {
    try {
      await runTransaction(db, async t => {
        const snap = await t.get(doc(db, 'users', uid))
        const p = snap.data()
        let gcash = p.gcashBalance, cash = p.cashOnHand
        if (tx.type === 'cashin')       { gcash += tx.amount; cash -= (tx.amount + tx.fee) }
        else if (tx.type === 'cashout') { gcash -= tx.amount; cash += (tx.amount - tx.fee) }
        else                            { cash  -= tx.fee }
        t.delete(doc(db, 'users', uid, 'transactions', tx.id))
        t.update(doc(db, 'users', uid), { gcashBalance: gcash, cashOnHand: cash })
      })
      setDetailTx(null); showToast('Deleted')
    } catch { showToast('Error deleting') }
  }

  async function handleSaveBalances() {
    try {
      await updateDoc(doc(db, 'users', uid), { gcashBalance: parseFloat(sGcash) || 0, cashOnHand: parseFloat(sCash) || 0 })
      showToast('Balances updated')
    } catch { showToast('Error') }
  }

  async function handleSaveFeeTiers() {
    const sorted = [...sTiers].filter(t => t.max > 0 && t.fee > 0).sort((a, b) => a.min - b.min)
    try { await updateDoc(doc(db, 'users', uid), { feeTiers: sorted }); showToast('Fee tiers saved') }
    catch { showToast('Error saving tiers') }
  }

  async function handleDeleteCustomer(id) {
    if (!window.confirm('Remove this customer?')) return
    try { const { deleteDoc } = await import('firebase/firestore'); await deleteDoc(doc(db, 'users', uid, 'customers', id)); showToast('Removed') }
    catch { showToast('Error') }
  }

  async function handleClearLogs() {
    if (!txs.length || !window.confirm('Clear ALL transaction history?\n\nBalances stay as-is.')) return
    try {
      const { writeBatch } = await import('firebase/firestore')
      const batch = writeBatch(db)
      txs.forEach(tx => batch.delete(doc(db, 'users', uid, 'transactions', tx.id)))
      await batch.commit(); showToast('History cleared')
    } catch { showToast('Error') }
  }

  const totalProfit = txs.reduce((s, t) => s + (t.fee || 0), 0)

  // ── Screens ────────────────────────────────────────────────
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  if (needsSetup) return (
    <div className="setup-overlay">
      <h2>Welcome to gaudit</h2>
      <p>Enter your starting capital to begin tracking your GCash business.</p>
      <div className="fg"><label>GCash Wallet Balance (₱)</label>
        <input type="number" inputMode="decimal" placeholder="0" value={setupGcash} onChange={e => setSetupGcash(e.target.value)} />
      </div>
      <div className="fg"><label>Cash on Hand (₱)</label>
        <input type="number" inputMode="decimal" placeholder="0" value={setupCash} onChange={e => setSetupCash(e.target.value)} />
      </div>
      <button className="btn-white" onClick={handleSetup} disabled={busy}>{busy ? 'Saving…' : 'Start Tracking →'}</button>
    </div>
  )

  return (
    <div className="app-shell">

      {/* Header */}
      <div className="app-header">
        <div>
          <div className="app-logo">g<span>audit</span></div>
          <div className="app-sub">Hi, {(currentUser.displayName || currentUser.email).split(/[\s@]/)[0]} 👋</div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="app-content">
        {activeTab === 'home' && (
          <HomeTab profile={profile} txs={txs} feeTiers={feeTiers}
            onOpenTx={type => setTxModal({ open: true, type })}
            onOpenDetail={setDetailTx}
            onGoLogs={() => setActiveTab('logs')}
          />
        )}
        {activeTab === 'logs' && (
          <LogsTab txs={txs} onOpenDetail={setDetailTx} onClearAll={handleClearLogs} />
        )}
        {activeTab === 'customers' && (
          <CustomersTab customers={customers} txs={txs} onDelete={handleDeleteCustomer} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            profile={profile} txCount={txs.length} totalProfit={totalProfit} currentUser={currentUser}
            setGcash={sGcash} setSGcash={setSGcash} setCash={sCash} setSCash={setSCash}
            setTiers={sTiers} setSTiers={setSTiers}
            onSaveBalances={handleSaveBalances} onSaveFeeTiers={handleSaveFeeTiers} onLogout={logout}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        {NAV.map(tab => (
          <button key={tab.id} className={`nav-item ${activeTab === tab.id ? 'on' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="nav-ico">{tab.ico}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modals */}
      <TxModal
        isOpen={txModal.open} type={txModal.type} feeTiers={feeTiers} customers={customers}
        onClose={() => setTxModal(m => ({ ...m, open: false }))} onSubmit={handleAddTx}
      />
      <DetailModal tx={detailTx} feeTiers={feeTiers} onClose={() => setDetailTx(null)} onDelete={handleDeleteTx} onEdit={handleEditTx} />

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  )
}
