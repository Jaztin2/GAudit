import { fmtDate } from '../utils/format'
import { peso } from '../utils/format'

const ICONS  = { cashin: '↙', cashout: '↗', other: '⊕' }
const LABELS = { cashin: 'Cash In', cashout: 'Cash Out', other: 'Other' }
const COLORS = { cashin: 'var(--green)', cashout: 'var(--red)', other: 'var(--orange)' }
const BG     = { cashin: 'var(--green-light)', cashout: 'var(--red-light)', other: 'var(--orange-light)' }

export default function TxRow({ tx, onClick, showDate }) {
  const subtitle = showDate
    ? fmtDate(tx.timestamp)
    : tx.type === 'cashin' && tx.customerPhone
      ? tx.customerPhone
      : tx.notes || fmtDate(tx.timestamp)

  return (
    <div className="tx-item" onClick={onClick}>
      <div className="tx-ico" style={{ background: BG[tx.type], color: COLORS[tx.type] }}>
        {ICONS[tx.type]}
      </div>
      <div className="tx-body">
        <div className="tx-type">{LABELS[tx.type]}{tx.customerName ? ` · ${tx.customerName}` : ''}</div>
        <div className="tx-note">{subtitle}</div>
      </div>
      <div className="tx-right">
        <div className="tx-amt">{peso(tx.amount)}</div>
        <div className="tx-profit">+{peso(tx.fee)}</div>
      </div>
    </div>
  )
}
