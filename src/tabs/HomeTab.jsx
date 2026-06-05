import { peso } from '../utils/format'
import TxRow from '../components/TxRow'

export default function HomeTab({ profile, txs, feeTiers, onOpenTx, onOpenDetail, onGoLogs }) {
  const gcash       = profile?.gcashBalance ?? 0
  const cash        = profile?.cashOnHand   ?? 0
  const ciTxs       = txs.filter(t => t.type === 'cashin')
  const coTxs       = txs.filter(t => t.type === 'cashout')
  const totalProfit = txs.reduce((s, t) => s + (t.fee || 0), 0)
  const todayProfit = txs.filter(t => {
    if (!t.timestamp) return false
    const d = t.timestamp?.toDate ? t.timestamp.toDate() : new Date(t.timestamp)
    return d.toDateString() === new Date().toDateString()
  }).reduce((s, t) => s + (t.fee || 0), 0)

  return (
    <>
      <div className="profit-card">
        <div className="lbl">Total Profit</div>
        <div className="big">{peso(totalProfit)}</div>
        <div className="sub">Today: {peso(todayProfit)}</div>
      </div>

      <div className="balance-card">
        <div><div className="lbl">GCash</div><div className="val blue">{peso(gcash)}</div></div>
        <div className="vdivider" />
        <div><div className="lbl">Cash</div><div className="val">{peso(cash)}</div></div>
        <div className="vdivider" />
        <div><div className="lbl">Capital</div><div className="val">{peso(gcash + cash)}</div></div>
      </div>

      <div className="row2">
        <div className="card">
          <div className="lbl">Cash-ins</div>
          <div className="val green">{ciTxs.length}</div>
          <div className="sub2">{peso(ciTxs.reduce((s,t)=>s+t.fee,0))} profit</div>
        </div>
        <div className="card">
          <div className="lbl">Cash-outs</div>
          <div className="val red">{coTxs.length}</div>
          <div className="sub2">{peso(coTxs.reduce((s,t)=>s+t.fee,0))} profit</div>
        </div>
      </div>

      <div className="section-label">Add Transaction</div>
      <div className="actions">
        <button className="btn-action ci" onClick={() => onOpenTx('cashin')}><span className="ico">↙</span>Cash In</button>
        <button className="btn-action co" onClick={() => onOpenTx('cashout')}><span className="ico">↗</span>Cash Out</button>
        <button className="btn-action ot" onClick={() => onOpenTx('other')}><span className="ico">⊕</span>Other</button>
      </div>

      <div className="sec-hdr">
        <span className="sec-title">Recent</span>
        <span className="sec-link" style={{ color: 'var(--blue)' }} onClick={onGoLogs}>See all</span>
      </div>
      <div className="tx-list">
        {txs.length === 0
          ? <div className="empty-state"><div className="eim">📋</div><p>No transactions yet.<br/>Tap an action above to start.</p></div>
          : txs.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx} onClick={() => onOpenDetail(tx)} />)
        }
      </div>
    </>
  )
}
