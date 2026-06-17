import * as XLSX from 'xlsx';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchRegistrations,
  fetchOneToOneRegistrations,
  fetchFamilyRegistrations,
  fetchTeams,
  Registration,
  OneToOneRegistration,
  FamilyRegistration,
  Team,
} from '../services/api';
import { useAuth } from '../hooks/useAuth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function photoSrc(url: string): string {
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
}

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

type Tab = 'players' | 'one-to-one' | 'family';

// ── Generic Teams Overview Grid ──────────────────────────────────────
interface TeamCardProps {
  allTeams: Team[];
  dataMap: Record<string, { count: number; photos: string[] }>;
  activeTeam: string | null;
  onSelect: (name: string | null) => void;
  loading: boolean;
}
function TeamsGrid({ allTeams, dataMap, activeTeam, onSelect, loading }: TeamCardProps) {
  const teamRows = allTeams
    .map((t) => ({
      name: t.name,
      count: dataMap[t.name]?.count ?? 0,
      photos: dataMap[t.name]?.photos ?? [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (loading) return <p style={{ color: 'var(--charcoal-light)', fontSize: '0.9rem' }}>Loading teams...</p>;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
      gap: '0.75rem',
    }}>
      {teamRows.map(({ name, count, photos }) => {
        const [bg, bgDark] = teamColour(name);
        const isActive = activeTeam === name;
        const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

        return (
          <div
            key={name}
            onClick={() => onSelect(isActive ? null : name)}
            style={{
              background: 'var(--white)',
              border: isActive ? `2px solid ${bg}` : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.9rem 1rem',
              cursor: 'pointer',
              boxShadow: isActive ? `0 4px 20px ${bg}33` : 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', gap: '0.6rem',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = bg;
                el.style.boxShadow = `0 4px 16px ${bg}33`;
                el.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = 'var(--border)';
                el.style.boxShadow = 'var(--shadow-sm)';
                el.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                background: `linear-gradient(135deg, ${bg}, ${bgDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontSize: '0.82rem',
                fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
              }}>
                {initials}
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600,
                color: 'var(--charcoal)', letterSpacing: '0.04em', lineHeight: 1.2,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {name}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                background: isActive ? bg : 'var(--cream-dark)',
                color: isActive ? '#fff' : 'var(--charcoal)',
                fontFamily: 'var(--font-heading)', fontSize: '0.75rem', fontWeight: 600,
                letterSpacing: '0.05em', padding: '0.2rem 0.6rem', borderRadius: 20,
                transition: 'all 0.2s',
              }}>
                🏏 {count}
              </span>
              {photos.length > 0 && (
                <div style={{ display: 'flex' }}>
                  {photos.map((url, idx) => (
                    <img
                      key={idx} src={photoSrc(url)} alt=""
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      style={{
                        width: 22, height: 22, borderRadius: '50%', objectFit: 'cover',
                        border: '2px solid var(--white)', marginLeft: idx === 0 ? 0 : -7,
                        zIndex: photos.length - idx, position: 'relative',
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
  );
}

// ── Photo badge cell ─────────────────────────────────────────────────
function PhotoBadge({ url, name, onClick }: { url?: string | null; name: string; onClick: (s: { src: string; name: string }) => void }) {
  if (url && url !== 'Not Uploaded') {
    return (
      <span
        onClick={() => onClick({ src: photoSrc(url), name })}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
        title={url}
      >
        <span style={{
          fontSize: '0.72rem', fontWeight: 700, color: '#1a7a3c',
          background: '#eafaf1', border: '1px solid #a9dfbf',
          borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap',
        }}>✓ Uploaded</span>
        <span style={{
          fontSize: '0.7rem', color: 'var(--charcoal-light)',
          maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', fontFamily: 'monospace',
        }}>{url}</span>
      </span>
    );
  }
  return (
    <span style={{
      fontSize: '0.72rem', fontWeight: 700, color: '#c0392b',
      background: '#fff0ee', border: '1px solid #e8a09a',
      borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap',
    }}>✗ None</span>
  );
}

// ── Date formatter ───────────────────────────────────────────────────
const fmt = (s: string) =>
  new Date(s).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ── Client-side Excel builder ────────────────────────────────────────
function buildExcel(rows: Record<string, unknown>[], filename: string, sheet: string) {
  if (!rows.length) { toast.error('No data to export.'); return; }
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').length)) + 2,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet.slice(0, 31));
  XLSX.writeFile(wb, filename);
}

// ════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const [players, setPlayers] = useState<Registration[]>([]);
  const [oneToOne, setOneToOne] = useState<OneToOneRegistration[]>([]);
  const [family, setFamily] = useState<FamilyRegistration[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('players');
  const [search, setSearch] = useState('');
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchRegistrations(),
      fetchOneToOneRegistrations(),
      fetchFamilyRegistrations(),
      fetchTeams(),
    ])
      .then(([p, o, f, t]) => {
        setPlayers(p);
        setOneToOne(o);
        setFamily(f);
        setAllTeams(t);
      })
      .catch(() => {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/admin/login');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  // Reset search/team filter on tab change
  const switchTab = (t: Tab) => { setTab(t); setSearch(''); setActiveTeam(null); };

  // ── Derived data maps for teams grid ──────────────────────────────
  const buildMap = (rows: Array<{ team_name: string | null; photo_url?: string | null }>) =>
    rows.reduce<Record<string, { count: number; photos: string[] }>>((acc, r) => {
      const key = r.team_name ?? 'Unknown';
      if (!acc[key]) acc[key] = { count: 0, photos: [] };
      acc[key].count += 1;
      if (r.photo_url && acc[key].photos.length < 3) acc[key].photos.push(r.photo_url);
      return acc;
    }, {});

  const playerMap = buildMap(players);
  const oToOneMap = buildMap(oneToOne);
  const familyMap = buildMap(family);

  // ── Stats ──────────────────────────────────────────────────────────
  const withPhoto = players.filter((r) => r.photo_url).length;

  // ── Filtered rows ─────────────────────────────────────────────────
  const matchesSearch = (vals: string[]) =>
    vals.some((v) => v.toLowerCase().includes(search.toLowerCase()));

  const filteredPlayers = players.filter((r) => {
    const s = matchesSearch([r.player_name, r.team_name, r.phone_number, r.jersey_name]);
    const t = activeTeam ? r.team_name === activeTeam : true;
    return s && t;
  });

  const filteredOTO = oneToOne.filter((r) => {
    const s = matchesSearch([r.name, r.team_name ?? '', r.phone_number, r.business_name ?? '']);
    const t = activeTeam ? r.team_name === activeTeam : true;
    return s && t;
  });

  const filteredFamily = family.filter((r) => {
    const s = matchesSearch([r.name, r.team_name ?? '', r.phone_number, r.member_name ?? '', r.spouse_kids_name ?? '']);
    const t = activeTeam ? r.team_name === activeTeam : true;
    return s && t;
  });

  // ── Export helpers ─────────────────────────────────────────────────
  const exportPlayers = (rows: Registration[], label: string) => {
    buildExcel(
      rows.map((r, i) => ({
        '#': i + 1,
        'Chapter': r.team_name,
        'Player Name': r.player_name,
        'Phone': r.phone_number,
        'Jersey Name': r.jersey_name,
        'Jersey #': r.jersey_number,
        'Jersey Size': r.jersey_size,
        'Lower Size': r.lower_size,
        'Photo': r.photo_url ?? 'Not Uploaded',
        'Registered': fmt(r.registered_at),
      })),
      `BNI_TPL_${label}.xlsx`,
      label.slice(0, 31),
    );
    toast.success(`Exported ${label}!`);
  };

  const exportOTO = (rows: OneToOneRegistration[], label: string) => {
    buildExcel(
      rows.map((r, i) => ({
        '#': i + 1,
        'Chapter': r.team_name ?? '',
        'Name': r.name,
        'Phone': r.phone_number,
        'Business Name': r.business_name ?? '',
        'Business Category': r.business_category ?? '',
        'Photo': r.photo_url ?? 'Not Uploaded',
        'Registered': fmt(r.registered_at),
      })),
      `BNI_TPL_${label}.xlsx`,
      label.slice(0, 31),
    );
    toast.success(`Exported ${label}!`);
  };

  const exportFam = (rows: FamilyRegistration[], label: string) => {
    buildExcel(
      rows.map((r, i) => ({
        '#': i + 1,
        'Chapter': r.team_name ?? '',
        'Member Name': r.member_name ?? '',
        'Spouse / Kids Name': r.spouse_kids_name ?? '',
        'Name': r.name,
        'Phone': r.phone_number,
        'Age Category': r.age_category ?? '',
        'Selected Game': r.selected_game ?? '',
        'Photo': r.photo_url ?? 'Not Uploaded',
        'Registered': fmt(r.registered_at),
      })),
      `BNI_TPL_${label}.xlsx`,
      label.slice(0, 31),
    );
    toast.success(`Exported ${label}!`);
  };

  const handleExport = () => {
    const suffix = activeTeam ? activeTeam.replace(/\s+/g, '_') : 'All';
    if (tab === 'players') exportPlayers(filteredPlayers, `Players_${suffix}`);
    else if (tab === 'one-to-one') exportOTO(filteredOTO, `OneToOne_${suffix}`);
    else exportFam(filteredFamily, `Family_${suffix}`);
  };

  const exportLabel = activeTeam ? `⬇ Export ${activeTeam}` : '⬇ Export All';
  const currentMap = tab === 'players' ? playerMap : tab === 'one-to-one' ? oToOneMap : familyMap;

  const TAB_STYLES = (t: Tab): React.CSSProperties => ({
    fontFamily: 'var(--font-heading)',
    fontSize: '0.9rem',
    letterSpacing: '0.06em',
    fontWeight: 600,
    padding: '0.6rem 1.4rem',
    border: 'none',
    borderBottom: tab === t ? '3px solid var(--gold)' : '3px solid transparent',
    background: 'transparent',
    color: tab === t ? 'var(--gold-dark)' : 'var(--charcoal-light)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  });

  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <div className="admin-header">
        <h1>🏏 BNI-TPL 2026 | Admin Dashboard</h1>
        <button className="btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-content">
        {/* ── Stats ── */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{players.length}</div>
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
          <div className="stat-card">
            <div className="stat-value">{oneToOne.length}</div>
            <div className="stat-label">One-to-One</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{family.length}</div>
            <div className="stat-label">Spouse &amp; Kids</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 0, borderBottom: '1px solid var(--border)',
          marginBottom: '1.5rem', overflowX: 'auto',
        }}>
          <button style={TAB_STYLES('players')} onClick={() => switchTab('players')}>
            🏏 Players ({players.length})
          </button>
          <button style={TAB_STYLES('one-to-one')} onClick={() => switchTab('one-to-one')}>
            👤 One-to-One ({oneToOne.length})
          </button>
          <button style={TAB_STYLES('family')} onClick={() => switchTab('family')}>
            👨‍👩‍👧‍👦 Spouse &amp; Kids ({family.length})
          </button>
        </div>

        {/* ── Teams Overview ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.2rem',
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
                  borderRadius: 6, padding: '0.3rem 0.8rem', cursor: 'pointer',
                }}
              >
                ✕ Clear filter
              </button>
            )}
          </div>
          <TeamsGrid
            allTeams={allTeams}
            dataMap={currentMap}
            activeTeam={activeTeam}
            onSelect={(n) => { setActiveTeam(n); setSearch(''); }}
            loading={loading}
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="admin-toolbar">
          <h2>
            {activeTeam
              ? `${activeTeam.toUpperCase()} — ${tab === 'players' ? 'PLAYERS' : tab === 'one-to-one' ? 'ONE-TO-ONE' : 'SPOUSE & KIDS'}`
              : tab === 'players' ? 'PLAYER REGISTRATIONS'
              : tab === 'one-to-one' ? 'ONE-TO-ONE REGISTRATIONS'
              : 'SPOUSE & KIDS REGISTRATIONS'}
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search name, team, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: 230, padding: '0.55rem 0.9rem', borderRadius: 6,
                border: '1px solid var(--border)', fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
              }}
            />
            <button
              className="btn-primary"
              style={{ width: 'auto', padding: '0.6rem 1.5rem', marginTop: 0 }}
              onClick={handleExport}
            >
              {exportLabel}
            </button>
          </div>
        </div>

        {/* ── Tables ── */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
            Loading registrations...
          </p>
        ) : (
          <>
            {/* Players Table */}
            {tab === 'players' && (
              filteredPlayers.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
                  {search || activeTeam ? 'No results found.' : 'No registrations yet.'}
                </p>
              ) : (
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-lg)' }}>
                  <table className="data-table" style={{ minWidth: 1050 }}>
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
                      {filteredPlayers.map((r, i) => (
                        <tr key={r.id}>
                          <td className="table-rank">{i + 1}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <PhotoBadge url={r.photo_url} name={r.player_name} onClick={setLightbox} />
                          </td>
                          <td>{r.team_name}</td>
                          <td style={{ fontWeight: 600 }}>{r.player_name}</td>
                          <td>{r.phone_number}</td>
                          <td>{r.jersey_name}</td>
                          <td style={{ textAlign: 'center' }}>{r.jersey_number}</td>
                          <td style={{ textAlign: 'center' }}>{r.jersey_size}</td>
                          <td style={{ textAlign: 'center' }}>{r.lower_size}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--charcoal-light)' }}>{fmt(r.registered_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* One-to-One Table */}
            {tab === 'one-to-one' && (
              filteredOTO.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
                  {search || activeTeam ? 'No results found.' : 'No one-to-one registrations yet.'}
                </p>
              ) : (
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-lg)' }}>
                  <table className="data-table" style={{ minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Photo</th>
                        <th>Chapter</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Business Name</th>
                        <th>Business Category</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOTO.map((r, i) => (
                        <tr key={r.id}>
                          <td className="table-rank">{i + 1}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <PhotoBadge url={r.photo_url} name={r.name} onClick={setLightbox} />
                          </td>
                          <td>{r.team_name ?? '—'}</td>
                          <td style={{ fontWeight: 600 }}>{r.name}</td>
                          <td>{r.phone_number}</td>
                          <td>{r.business_name ?? '—'}</td>
                          <td>{r.business_category ?? '—'}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--charcoal-light)' }}>{fmt(r.registered_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Family Table */}
            {tab === 'family' && (
              filteredFamily.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--charcoal-light)' }}>
                  {search || activeTeam ? 'No results found.' : 'No family registrations yet.'}
                </p>
              ) : (
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius-lg)' }}>
                  <table className="data-table" style={{ minWidth: 1100 }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Photo</th>
                        <th>Chapter</th>
                        <th>Member Name</th>
                        <th>Spouse / Kids Name</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Age Category</th>
                        <th>Selected Game</th>
                        <th>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFamily.map((r, i) => (
                        <tr key={r.id}>
                          <td className="table-rank">{i + 1}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <PhotoBadge url={r.photo_url} name={r.name} onClick={setLightbox} />
                          </td>
                          <td>{r.team_name ?? '—'}</td>
                          <td style={{ fontWeight: 600 }}>{r.member_name ?? '—'}</td>
                          <td>{r.spouse_kids_name ?? '—'}</td>
                          <td>{r.name}</td>
                          <td>{r.phone_number}</td>
                          <td>{r.age_category ?? '—'}</td>
                          <td>{r.selected_game ?? '—'}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--charcoal-light)' }}>{fmt(r.registered_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
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
            src={lightbox.src} alt={lightbox.name}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '80vh',
              borderRadius: 10, boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
          <p style={{
            marginTop: '1rem', color: '#fff',
            fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.06em',
          }}>
            {lightbox.name}
          </p>
          <button
            onClick={() => setLightbox(null)}
            style={{
              marginTop: '0.75rem', background: 'var(--red)', color: '#fff',
              border: 'none', borderRadius: 6,
              padding: '0.5rem 1.5rem', cursor: 'pointer',
              fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '0.06em',
            }}
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}
