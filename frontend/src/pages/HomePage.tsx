import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const KPI_CARDS = [
  {
    title: 'Player Register',
    description: 'Register as a cricket player',
    icon: '🏏',
    link: '/register',
    color: '#c9a84c',
  },
  {
    title: 'One-to-One',
    description: 'Individual registration',
    icon: '👤',
    link: '/register/one-to-one',
    color: '#e8b4d4',
  },
  {
    title: 'Spouse & Kids',
    description: 'Family registration',
    icon: '👨‍👩‍👧‍👦',
    link: '/register/family',
    color: '#76d4ff',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── KPI Dashboard ── */}
      <section className="kpi-dashboard">
        <div className="kpi-header">
          <h1 className="kpi-title">BNI – TPL 2026</h1>
          <p className="kpi-subtitle">TRICHY PREMIER LEAGUE</p>
          <p className="kpi-description">Select an option to register</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="kpi-cards-grid">
          {KPI_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="kpi-card"
              style={{ borderTopColor: card.color }}
            >
              <div className="kpi-card-icon">{card.icon}</div>
              <h2 className="kpi-card-title">{card.title}</h2>
              <p className="kpi-card-description">{card.description}</p>
              <div className="kpi-card-arrow">→</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
