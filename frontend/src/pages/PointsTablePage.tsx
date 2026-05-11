import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { fetchStandings, TeamStanding } from '../services/api';

export default function PointsTablePage() {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings('league')
      .then(setStandings)
      .catch(() => toast.error('Failed to load standings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <div className="page-header">
        <h1>POINTS TABLE</h1>
      </div>

      <div className="table-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
            Loading standings…
          </p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 48 }}>#</th>
                  <th>Team</th>
                  <th style={{ textAlign: 'center' }} title="Played">P</th>
                  <th style={{ textAlign: 'center' }} title="Won">W</th>
                  <th style={{ textAlign: 'center' }} title="Lost">L</th>
                  <th style={{ textAlign: 'center' }} title="No Result">NR</th>
                  <th style={{ textAlign: 'center' }} title="Net Run Rate">NRR</th>
                  <th style={{ textAlign: 'center' }} title="Points">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => (
                  <tr
                    key={s.team_name}
                    style={s.rank <= 4 && s.played > 0 ? { background: 'rgba(201,168,76,0.08)' } : undefined}
                  >
                    <td className="table-rank">{s.rank}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: s.rank <= 4 && s.played > 0 ? 'var(--gold)' : 'var(--cream-dark)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700, color: 'var(--charcoal)',
                          flexShrink: 0, border: '1px solid var(--border)',
                        }}>
                          {s.team_name.substring(0, 2).toUpperCase()}
                        </div>
                        {s.team_name}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{s.played}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--gold-dark)' }}>{s.won}</td>
                    <td style={{ textAlign: 'center' }}>{s.lost}</td>
                    <td style={{ textAlign: 'center', color: 'var(--charcoal-light)' }}>{s.no_result}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                      {s.nrr >= 0 ? '+' : ''}{s.nrr.toFixed(3)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--charcoal-light)' }}>
              Top 4 teams (highlighted) qualify for the playoffs · P=Played W=Won L=Lost NR=No Result NRR=Net Run Rate Pts=Points
            </p>
          </>
        )}
      </div>
    </>
  );
}
