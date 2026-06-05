export default function Header({ userName, onSettings, onLogout }) {
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })
  return (
    <div className="header">
      <div className="header-left">
        <div className="header-logo">g<span>audit</span></div>
        {userName && <div className="header-user">Hi, {userName.split(' ')[0]} 👋</div>}
      </div>
      <div className="header-right">
        <button className="btn-icon" onClick={onSettings} title="Settings">⚙</button>
        <button className="btn-icon" onClick={onLogout}   title="Log Out">⎋</button>
      </div>
    </div>
  )
}
