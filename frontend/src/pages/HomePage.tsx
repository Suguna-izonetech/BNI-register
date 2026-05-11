import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { LOGO_DATA_URL } from '../assets/logo';

const TEAMS = [
  'Azpire', 'Benchmark', 'Champions', 'Dynamic', 'EMPEROR',
  'FORTUNE', 'GLADIATORS', 'HARMONY', 'ICONS', 'JAAGUAR',
  'KINGS', 'Legends', 'Millionaire', 'Nest', 'PRINCE',
  'SPARK', 'OSCAR', 'TYCOON', 'ROYALS', 'WARRIORS',
];

const STATS = [
  { value: '20',      label: 'Teams'        },
  { value: '300+',    label: 'Players'      },
  { value: 'T6/8/10', label: 'Format'       },
  { value: '1000+',   label: 'Entrepreneurs'},
  { value: 'Trichy',  label: 'City'         },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-arc" aria-hidden="true" />

        <div className="hero-inner">
          {/* Left — logo */}
          <div className="hero-logo-wrap">
            <img
              src={LOGO_DATA_URL}
              alt="BNI-TPL 2026 Trichy Premier League"
              className="hero-logo"
            />
          </div>

          {/* Right — text + CTA + stats */}
          <div className="hero-content">
            <h1 className="hero-title">BNI – TPL 2026</h1>
            <h2 className="hero-subtitle">TRICHY PREMIER LEAGUE</h2>
            <p className="hero-tagline">
              <span className="tagline-dot">●</span>
              Building Business Beyond Boundaries
              <span className="tagline-dot">●</span>
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn-hero-primary">Register Now</Link>
            </div>

            {/* Stats grid */}
            <div className="hero-stats">
              {STATS.map((s) => (
                <div key={s.label} className="hero-stat-card">
                  <span className="hero-stat-value">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
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
        <p style={{ fontSize: '0.75rem', color: 'var(--charcoal-light)', marginTop: '0.25rem' }}>
          Powered by <strong>@Izone</strong> · All rights reserved
        </p>
      </footer>
    </>
  );
}
