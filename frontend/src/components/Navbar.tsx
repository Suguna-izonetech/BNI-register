import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BNI_LOGO_DATA_URL } from '../assets/bniLogo';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
        <img src={BNI_LOGO_DATA_URL} alt="BNI Trichy" className="navbar-logo-img" />
      </NavLink>

      {/* Desktop links removed - KPI cards on home page instead */}
      <ul className="navbar-links">
      </ul>

      {/* Mobile hamburger */}
      <button
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer - empty */}
      {menuOpen && (
        <div className="mobile-menu">
        </div>
      )}
    </nav>
  );
}
