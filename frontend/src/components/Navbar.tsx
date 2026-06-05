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

      {/* Desktop links */}
      <ul className="navbar-links">
        <li><NavLink to="/" end>Home</NavLink></li>
        <li><NavLink to="/register" end>Player Register</NavLink></li>
        <li><NavLink to="/register/one-to-one" end>One-to-One</NavLink></li>
        <li><NavLink to="/register/family" end>Spouse & Kids</NavLink></li>
      </ul>


      {/* Desktop CTA */}
      <NavLink to="/register" className="btn-register navbar-cta">
        Register Now
      </NavLink>

      {/* Mobile hamburger */}
      <button
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/register" end onClick={() => setMenuOpen(false)}>Player</NavLink>
          <NavLink to="/register/one-to-one" onClick={() => setMenuOpen(false)}>One-to-One</NavLink>
          <NavLink to="/register/family" onClick={() => setMenuOpen(false)}>Spouse & Kids</NavLink>
        </div>
      )}
    </nav>
  );
}
