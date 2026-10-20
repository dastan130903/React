export default function Header({ count }) {
  return <header className="topbar"><div className="layout topbar-inner"><div className="brand"><span className="brand-mark">S</span><span>StudyShelf<span className="accent">.</span></span></div><span className="top-label">REACT MIDTERM PROJECT <span className="separator">/</span> {count} RESOURCES</span></div></header>;
}
