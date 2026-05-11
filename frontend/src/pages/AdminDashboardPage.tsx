import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchRegistrations, exportExcel, Registration } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function AdminDashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations()
      .then(setRegistrations)
      .catch(() => {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/admin/login');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportExcel();
      toast.success('Excel file downloaded!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const filtered = registrations.filter((r) =>
    [r.player_name, r.team_name, r.phone_number, r.jersey_name]
      .some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  const teamCounts = registrations.reduce<Record<string, number>>((acc, r) => {
    acc[r.team_name] = (acc[r.team_name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <h1>🏏 BNI-TPL 2026 | Admin Dashboard</h1>
        <button className="btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{registrations.length}</div>
            <div className="stat-label">Total Players</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(teamCounts).length}</div>
            <div className="stat-label">Teams Registered</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <h2>PLAYER REGISTRATIONS</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search players, teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220, padding: '0.55rem 0.9rem', borderRadius: 6, border: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}
            />
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: 0 }}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : '⬇ Export Excel'}
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>Loading registrations...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
            {search ? 'No results found.' : 'No registrations yet.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-lg)' }}>
            <table className="data-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Player Name</th>
                  <th>Phone</th>
                  <th>Jersey Name</th>
                  <th>Jersey #</th>
                  <th>Jersey Size</th>
                  <th>Lower Size</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="table-rank">{i + 1}</td>
                    <td>{r.team_name}</td>
                    <td style={{ fontWeight: 600 }}>{r.player_name}</td>
                    <td>{r.phone_number}</td>
                    <td>{r.jersey_name}</td>
                    <td style={{ textAlign: 'center' }}>{r.jersey_number}</td>
                    <td style={{ textAlign: 'center' }}>{r.jersey_size}</td>
                    <td style={{ textAlign: 'center' }}>{r.lower_size}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--charcoal-light)' }}>
                      {new Date(r.registered_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
