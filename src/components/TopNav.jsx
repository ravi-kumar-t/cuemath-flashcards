import './TopNav.css';

export default function TopNav({ onAddCards }) {
  return (
    <nav className="topnav">
      <div className="topnav-left">
        <h2 className="topnav-page-title">Dashboard</h2>
      </div>
      <div className="topnav-right">
        <button className="btn btn-primary btn-sm topnav-add-btn" onClick={onAddCards}>
          ＋ Add Cards
        </button>
      </div>
    </nav>
  );
}
