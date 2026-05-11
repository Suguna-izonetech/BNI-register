import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LOGO_DATA_URL } from '../assets/logo';

const TEAMS = [
  'Azpire', 'Benchmark', 'Champions', 'Dynamic', 'EMPEROR',
  'FORTUNE', 'GLADIATORS', 'HARMONY', 'ICONS', 'JAAGUAR',
  'KINGS', 'Legends', 'Millionaire', 'Nest', 'PRINCE',
  'SPARK', 'OSCAR', 'TYCOON', 'ROYALS', 'WARRIORS',
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-arc" aria-hidden="true" />
        <div className="hero-center">

          {/* Logo — transparent, full width */}
          <img
            src={LOGO_DATA_URL}
            alt="BNI-TPL 2026 Trichy Premier League"
            className="hero-logo"
          />

          {/* Single CTA */}
          <div className="hero-actions">
            <Link to="/register" className="btn-hero-primary">Register Now</Link>
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {[
              { value: '20',     label: 'Teams'   },
              { value: '190+',   label: 'Players' },
              { value: 'T20',    label: 'Format'  },
              { value: 'Trichy', label: 'City'    },
            ].map((s) => (
              <div key={s.label} className="hero-stat-card">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About strip ── */}
      <section className="about-strip">
        <div className="about-strip-inner">
          <div className="about-block">
            <span className="about-icon">🏏</span>
            <div>
              <h3>Premier Cricket</h3>
              <p>High-intensity cricket battles under pressure and passion</p>
            </div>
          </div>
          <div className="about-divider" aria-hidden="true" />
          <div className="about-block">
            <span className="about-icon">🔥</span>
            <div>
              <h3>Pure Matchday Energy</h3>
              <p>Big shots, fierce rivalries, and unforgettable moments</p>
            </div>
          </div>
          <div className="about-divider" aria-hidden="true" />
          <div className="about-block">
            <span className="about-icon">🏆</span>
            <div>
              <h3>Race for the Trophy</h3>
              <p>The strongest teams fight till the final ball for glory</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Teams grid ── */}
      <section className="teams-section">
        <div className="section-header">
          <h2 className="section-title">PARTICIPATING TEAMS</h2>
          <div className="section-rule" aria-hidden="true" />
        </div>
        <div className="teams-grid">
          {TEAMS.map((name) => (
            <div key={name} className="team-chip">
              <span className="team-chip-badge">{name.substring(0, 2).toUpperCase()}</span>
              <span className="team-chip-name">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <div>
            <h2>Ready to Play?</h2>
            <p>Secure your spot in BNI – TPL 2026 before registrations close.</p>
          </div>
          <Link to="/register" className="btn-hero-primary">Register Your Team</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <img src={LOGO_DATA_URL} alt="BNI-TPL 2026" className="footer-logo" />
        <p>© 2026 BNI – TPL | Trichy Premier League. All rights reserved.</p>
        <p className="footer-tagline">Building Business Beyond Boundaries</p>
      </footer>
    </>
  );
}
