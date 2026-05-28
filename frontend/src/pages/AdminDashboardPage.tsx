import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { fetchRegistrations, fetchTeams, Registration, Team } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Resolve photo_url to a full URL (handles both /uploads/... and full URLs) */
function photoSrc(url: string): string {
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}

/** Deterministic colour from a string — cycles through a palette */
const TEAM_COLOURS: [string, string][] = [
  ['#d13b2a', '#9a2a1c'],
  ['#c9a84c', '#9a7a30'],
  ['#2d6a4f', '#1b4332'],
  ['#1d3557', '#0d1b2a'],
  ['#6a0572', '#3d0140'],
  ['#c77dff', '#7b2d8b'],
  ['#e76f51', '#a84232'],
  ['#2a9d8f', '#1a6b62'],
  ['#457b9d', '#1d3557'],
  ['#e9c46a', '#b5862a'],
];
function teamColour(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return TEAM_COLOURS[Math.abs(hash) % TEAM_COLOURS.length];
}

export default function AdminDashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchRegistrations(), fetchTeams()])
      .then(([regs, teams]) => {
        setRegistrations(regs);
        setAllTeams(teams);
      })
      .catch(() => {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/admin/login');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  /** Shared row mapper — same shape for both all-data and team exports */
  const toExcelRows = (rows: Registration[]) =>
    rows.map((r, i) => ({
      '#': i + 1,
      'Team Name': r.team_name,
      'Player Name': r.player_name,
      'Phone Number': r.phone_number,
      'Jersey Name': r.jersey_name,
      'Jersey Number': r.jersey_number,
      'Jersey Size': r.jersey_size,
      'Lower Size': r.lower_size,
      'Photo': r.photo_url ?? 'Not Uploaded',
      'Registered At': new Date(r.registered_at).toLocaleString('en-IN'),
    }));

  const buildAndDownload = (rows: Registration[], filename: string, sheetName: string) => {
    const data = toExcelRows(rows);
    if (data.length === 0) { toast.error('No registrations to export.'); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, ...data.map((r) => String((r as Record<string, unknown>)[key] ?? '').length)) + 2,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, filename);
  };

  /** Export all registrations client-side */
  const handleExportAll = () => {
    buildAndDownload(registrations, 'BNI_TPL_2026_All_Registrations.xlsx', 'All Players');
    toast.success('Full Excel downloaded!');
  };

  /** Export only the active team's registrations */
  const handleExportTeam = () => {
    if (!activeTeam) return;
    const teamRegs = registrations.filter((r) => r.team_name === activeTeam);
    buildAndDownload(teamRegs, `BNI_TPL_2026_${activeTeam.replace(/\s+/g, '_')}.xlsx`, activeTeam);
    toast.success(`${activeTeam} data exported!`);
  };

  const filtered = registrations.filter((r) => {
    const matchesSearch = [r.player_name, r.team_name, r.phone_number, r.jersey_name]
      .some((v) => v.toLowerCase().includes(search.toLowerCase()));
    const matchesTeam = activeTeam ? r.team_name === activeTeam : true;
    return matchesSearch && matchesTeam;
  });

  // Build sorted team list — all 20 teams, zero-count included
  const regMap = registrations.reduce<Record<string, { count: number; photos: string[] }>>((acc, r) => {
    if (!acc[r.team_name]) acc[r.team_name] = { count: 0, photos: [] };
    acc[r.team_name].count += 1;
    if (r.photo_url && r.photo_url !== 'Not Uploaded' && acc[r.team_name].photos.length < 3) acc[r.team_name].photos.push(r.photo_url);
    return acc;
  }, {});

  const teamRows = allTeams
    .map((t) => ({
      name: t.name,
      count: regMap[t.name]?.count ?? 0,
      photos: regMap[t.name]?.photos ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const withPhoto = registrations.filter((r) => r.photo_url && r.photo_url !== 'Not Uploaded').length;

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
            <div className="stat-value">{allTeams.length}</div>
            <div className="stat-label">Total Teams</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{withPhoto}</div>
            <div className="stat-label">Photos Uploaded</div>
          </div>
        </div>

        {/* ── Teams Overview ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.3rem',
              color: 'var(--charcoal)', letterSpacing: '0.06em',
            }}>
              TEAMS OVERVIEW
            </h2>
            {activeTeam && (
              <button
                onClick={() => { setActiveTeam(null); setSearch(''); }}
                style={{
                  fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
                  letterSpacing: '0.06em', background: 'var(--cream-dark)',
                  color: 'var(--charcoal)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '0.35rem 0.9rem', cursor: 'pointer',
                }}
              >
                ✕ Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem' }}>Loading teams...</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.85rem',
            }}>
              {teamRows.map(({ name, count, photos }) => {
                const [bg, bgDark] = teamColour(name);
                const isActive = activeTeam === name;
                const initials = name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div
                    key={name}
                    onClick={() => {
                      setActiveTeam(isActive ? null : name);
                      setSearch('');
                    }}
                    style={{
                      background: 'var(--white)',
                      border: isActive
                        ? `2px solid ${bg}`
                        : '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1rem 1.1rem',
                      cursor: 'pointer',
                      boxShadow: isActive
                        ? `0 4px 20px ${bg}33`
                        : 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = bg;
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px ${bg}33`;
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Top row: badge + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                        background: `linear-gradient(135deg, ${bg}, ${bgDark})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-heading)', fontSize: '0.85rem',
                        fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
                      }}>
                        {initials}
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
                        fontWeight: 600, color: 'var(--charcoal)',
                        letterSpacing: '0.04em', lineHeight: 1.2,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {name}
                      </span>
                    </div>

                    {/* Player count pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: isActive ? bg : 'var(--cream-dark)',
                        color: isActive ? '#fff' : 'var(--charcoal)',
                        fontFamily: 'var(--font-heading)', fontSize: '0.78rem',
                        fontWeight: 600, letterSpacing: '0.05em',
                        padding: '0.25rem 0.65rem', borderRadius: 20,
                        transition: 'all 0.2s',
                      }}>
                        🏏 {count} player{count !== 1 ? 's' : ''}
                      </span>

                      {/* Mini photo stack */}
                      {photos.length > 0 && (
                        <div style={{ display: 'flex', marginLeft: 'auto' }}>
                          {photos.map((url, idx) => (
                            <img
                              key={idx}
                              src={photoSrc(url)}
                              alt=""
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              style={{
                                width: 24, height: 24, borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid var(--white)',
                                marginLeft: idx === 0 ? 0 : -8,
                                zIndex: photos.length - idx,
                                position: 'relative',
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <h2>
            {activeTeam ? `${activeTeam.toUpperCase()} — PLAYERS` : 'PLAYER REGISTRATIONS'}
          </h2>
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
              onClick={activeTeam ? handleExportTeam : handleExportAll}
            >
              {activeTeam ? `⬇ Export ${activeTeam}` : '⬇ Export All'}
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
            Loading registrations...
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
            {search ? 'No results found.' : 'No registrations yet.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-lg)' }}>
            <table className="data-table" style={{ minWidth: 1000 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Photo</th>
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

                    {/* Photo cell */}
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {r.photo_url && r.photo_url !== 'Not Uploaded' ? (
                        <span
                          title={r.photo_url}
                          onClick={() => setLightbox({ src: photoSrc(r.photo_url!), name: r.player_name })}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
                            color: '#1a7a3c', background: '#eafaf1',
                            border: '1px solid #a9dfbf', borderRadius: 4,
                            padding: '2px 8px', whiteSpace: 'nowrap',
                          }}>
                            ✓ Uploaded
                          </span>
                          <span style={{
                            fontSize: '0.72rem', color: 'var(--charcoal-light)',
                            maxWidth: 160, overflow: 'hidden',
                            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontFamily: 'monospace',
                          }}>
                            {r.photo_url}
                          </span>
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em',
                          color: '#c0392b', background: '#fff0ee',
                          border: '1px solid #e8a09a', borderRadius: 4,
                          padding: '2px 8px', whiteSpace: 'nowrap',
                        }}>
                          ✗ Not Uploaded
                        </span>
                      )}
                    </td>

                    <td>{r.team_name}</td>
                    <td style={{ fontWeight: 600 }}>{r.player_name}</td>
                    <td>{r.phone_number}</td>
                    <td>{r.jersey_name}</td>
                    <td style={{ textAlign: 'center' }}>{r.jersey_number}</td>
                    <td style={{ textAlign: 'center' }}>{r.jersey_size}</td>
                    <td style={{ textAlign: 'center' }}>{r.lower_size}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--charcoal-light)' }}>
                      {new Date(r.registered_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.82)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox.src}
            alt={lightbox.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '80vh',
              borderRadius: 10,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
          <p style={{
            marginTop: '1rem', color: '#fff',
            fontFamily: 'var(--font-heading)', fontSize: '1.1rem',
            letterSpacing: '0.06em',
          }}>
            {lightbox.name}
          </p>
          <button
            onClick={() => setLightbox(null)}
            style={{
              marginTop: '0.75rem',
              background: 'var(--red)', color: '#fff',
              border: 'none', borderRadius: 6,
              padding: '0.5rem 1.5rem', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontSize: '0.9rem',
              letterSpacing: '0.06em',
            }}
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}
