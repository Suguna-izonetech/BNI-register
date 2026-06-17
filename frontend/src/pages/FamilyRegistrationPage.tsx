import imageCompression from 'browser-image-compression';
import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchTeams, submitFamily, Team } from '../services/api';

const GAMES = [
  'Quiz',
  'Memory games - Words, images, numbers and cards',
  'Memory Tray Challenge - For KIDS',
  'Fashion show - Parents & Kids - Creative',
  'Drawing Competition',
  'Chess',
  'Carom Board',
  'Fun Game',
];

const MAX_GAMES = GAMES.length;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface Errors {
  [key: string]: string;
}

// ── Game Checklist Dropdown ──────────────────────────────────────────
interface GamePickerProps {
  selected: string[];
  onChange: (val: string[]) => void;
  error?: string;
}

function GamePicker({ selected, onChange, error }: GamePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (game: string) => {
    if (selected.includes(game)) {
      onChange(selected.filter((g) => g !== game));
    } else {
      if (selected.length >= MAX_GAMES) {
        toast.error(`You can select up to ${MAX_GAMES} games only`);
        return;
      }
      onChange([...selected, game]);
    }
  };

  const label =
    selected.length === 0
      ? `— Select up to ${MAX_GAMES} games —`
      : selected.join(', ');

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: '0.65rem 2.2rem 0.65rem 0.9rem',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          background: 'var(--white)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          color: selected.length === 0 ? '#999' : 'var(--charcoal)',
          cursor: 'pointer',
          textAlign: 'left',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          boxSizing: 'border-box',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
        }}>
          {label}
        </span>
        <span style={{ flexShrink: 0, fontSize: '0.75rem', color: 'var(--charcoal-light)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {/* Badge showing count */}
      {selected.length > 0 && (
        <span style={{
          position: 'absolute', top: -8, right: -8,
          background: 'var(--gold)', color: 'var(--white)',
          fontFamily: 'var(--font-heading)', fontSize: '0.7rem', fontWeight: 700,
          borderRadius: '50%', width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 2,
        }}>
          {selected.length}
        </span>
      )}

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 500,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '0.5rem 0.9rem',
            background: 'var(--cream-dark)',
            borderBottom: '1px solid var(--border)',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            color: 'var(--charcoal-light)',
          }}>
            SELECT UP TO {MAX_GAMES} GAMES &nbsp;·&nbsp; {selected.length}/{MAX_GAMES} chosen
          </div>

          {GAMES.map((game) => {
            const checked = selected.includes(game);
            const disabled = !checked && selected.length >= MAX_GAMES;
            return (
              <label
                key={game}
                role="option"
                aria-selected={checked}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.9rem',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  background: checked ? 'rgba(201,168,76,0.1)' : 'var(--white)',
                  borderBottom: '1px solid var(--cream-dark)',
                  opacity: disabled ? 0.45 : 1,
                  transition: 'background 0.15s',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!disabled) (e.currentTarget as HTMLLabelElement).style.background = checked ? 'rgba(201,168,76,0.18)' : 'var(--cream)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.background = checked ? 'rgba(201,168,76,0.1)' : 'var(--white)';
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(game)}
                  style={{ accentColor: 'var(--gold)', width: 16, height: 16, flexShrink: 0 }}
                  aria-label={game}
                />
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: checked ? 'var(--gold-dark)' : 'var(--charcoal)',
                  fontWeight: checked ? 700 : 400,
                  lineHeight: 1.35,
                }}>
                  {game}
                </span>
                {checked && (
                  <span style={{
                    marginLeft: 'auto', flexShrink: 0,
                    color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700,
                  }}>✓</span>
                )}
              </label>
            );
          })}

          {/* Done button */}
          <div style={{ padding: '0.6rem 0.9rem', background: 'var(--cream-dark)', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                fontFamily: 'var(--font-heading)', fontSize: '0.8rem',
                letterSpacing: '0.06em', fontWeight: 600,
                background: 'var(--gold)', color: 'var(--white)',
                border: 'none', borderRadius: 6,
                padding: '0.4rem 1.2rem', cursor: 'pointer',
              }}
            >
              DONE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FamilyRegistrationPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);

  // form fields
  const [teamName, setTeamName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [spouseKidsName, setSpouseKidsName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchTeams().then(setTeams).catch(() => toast.error('Failed to load chapters'));
  }, []);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1024, useWebWorker: true });
      setPhotoFile(compressed as File);
      setPhotoPreview(await fileToDataUrl(compressed as File));
      toast.success('Photo ready');
      setErrors((prev) => ({ ...prev, photo: '' }));
    } catch {
      toast.error('Failed to process photo');
    }
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!teamName) e.teamName = 'Chapter is required';
    if (!memberName.trim()) e.memberName = 'Member name is required';
    if (!spouseKidsName.trim()) e.spouseKidsName = 'Spouse / Kids name is required';
    if (!name.trim()) e.name = 'Name is required';
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) e.phone = 'Enter valid 10-digit mobile number';
    if (!ageCategory) e.ageCategory = 'Age category is required';
    if (!selectedGames.length) e.selectedGame = 'Please select at least 1 game';
    if (!photoFile) e.photo = 'Photo is required';
    return e;
  };

  const resetForm = () => {
    setTeamName(''); setMemberName(''); setSpouseKidsName('');
    setName(''); setPhone(''); setAgeCategory(''); setSelectedGames([]);
    setPhotoFile(null); setPhotoPreview(null); setErrors({});
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadPDF = () => {
    if (!submittedData) return;
    const html = `
      <!doctype html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #c9a84c; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #2d2d2d; border-bottom: 2px solid #c9a84c; padding-bottom: 5px; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; color: #333; }
            .value { color: #666; margin-left: 10px; }
            .admit-details { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 20px; }
            .admit-photo { width: 140px; height: 170px; object-fit: cover; border: 2px solid #c9a84c; border-radius: 8px; }
            .admit-fields { flex: 1; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BNI - TPL 2026</h1>
            <p>Spouse &amp; Kids Registration Confirmation</p>
          </div>
          <div class="admit-details">
            ${submittedData.photo_url ? `<img class="admit-photo" src="${submittedData.photo_url}" alt="Registered photo" />` : ''}
            <div class="admit-fields">
              <div class="section">
                <h3>Personal Details</h3>
                <div class="field"><span class="label">Chapter:</span><span class="value">${submittedData.team_name}</span></div>
                <div class="field"><span class="label">Member Name:</span><span class="value">${submittedData.member_name}</span></div>
                <div class="field"><span class="label">Spouse / Kids Name:</span><span class="value">${submittedData.spouse_kids_name}</span></div>
                <div class="field"><span class="label">Name:</span><span class="value">${submittedData.name}</span></div>
                <div class="field"><span class="label">Phone Number:</span><span class="value">${submittedData.phone_number}</span></div>
                <div class="field"><span class="label">Age Category:</span><span class="value">${submittedData.age_category}</span></div>
              </div>
              <div class="section">
                <h3>Game Selection</h3>
                <div class="field"><span class="label">Selected Game:</span><span class="value">${submittedData.selected_game}</span></div>              </div>
            </div>
          </div>
          <div class="footer"><p>Registration submitted successfully!</p><p>Date: ${new Date().toLocaleString()}</p></div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'height=700,width=900');
    if (!printWindow) { toast.error('Please allow pop-ups to download the admit card'); return; }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    let printed = false;
    const printWhenReady = () => {
      if (printed) return;
      printed = true;
      setTimeout(() => printWindow.print(), 300);
    };
    printWindow.onload = printWhenReady;
    setTimeout(printWhenReady, 800);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the errors below');
      return;
    }
    setLoading(true);
    try {
      await submitFamily({
        team_name: teamName,
        name: name.trim(),
        phone_number: `+91${phone}`,
        age_category: ageCategory,
        member_name: memberName.trim(),
        spouse_kids_name: spouseKidsName.trim(),
        selected_game: selectedGames.join(', '),
        photo: photoFile,
      });
      setSubmittedData({
        team_name: teamName,
        member_name: memberName.trim(),
        spouse_kids_name: spouseKidsName.trim(),
        name: name.trim(),
        phone_number: `+91${phone}`,
        age_category: ageCategory,
        selected_game: selectedGames.join(', '),
        photo_url: photoPreview,
      });
      setSubmitted(true);
      toast.success('Family registration successful! 🎉');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Submission failed';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="page-header">
          <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '0.75rem', color: 'var(--white)', borderColor: 'var(--white)' }}>
            ← Back to Home
          </button>
          <h1>REGISTRATION</h1>
        </div>
        <div className="form-container">
          <div className="form-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👨‍👩‍👧‍👦</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--gold-dark)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
              REGISTRATION SUCCESSFUL!
            </h2>
            <p style={{ color: 'var(--charcoal-light)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Welcome to <strong>BNI – TPL 2026</strong>! Your family registration has been submitted. 🎉
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem' }} onClick={downloadPDF}>
                DOWNLOAD AS PDF
              </button>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem' }} onClick={() => { resetForm(); setSubmitted(false); setSubmittedData(null); }}>
                ➕ REGISTER ANOTHER
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <div className="page-header">
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '0.75rem', color: 'var(--white)', borderColor: 'var(--white)' }}>
          ← Back to Home
        </button>
        <h1>SPOUSE &amp; KIDS REGISTRATION</h1>
      </div>
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">Spouse &amp; Kids Registration</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">

              {/* Chapter */}
              <div className="form-group full-width">
                <label>Chapter <span className="required-star">*</span></label>
                <div className="select-wrapper">
                  <select
                    value={teamName}
                    onChange={(e) => { setTeamName(e.target.value); setErrors((p) => ({ ...p, teamName: '' })); }}
                    className={errors.teamName ? 'error' : ''}
                  >
                    <option value="">— Select Chapter —</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                {errors.teamName && <span className="error-msg">{errors.teamName}</span>}
              </div>

              {/* Member Name */}
              <div className="form-group full-width">
                <label>Member Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="BNI member's full name"
                  value={memberName}
                  onChange={(e) => { setMemberName(e.target.value); setErrors((p) => ({ ...p, memberName: '' })); }}
                  className={errors.memberName ? 'error' : ''}
                />
                {errors.memberName && <span className="error-msg">{errors.memberName}</span>}
              </div>

              {/* Spouse / Kids Name */}
              <div className="form-group full-width">
                <label>Spouse / Kids Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="Spouse or child's full name"
                  value={spouseKidsName}
                  onChange={(e) => { setSpouseKidsName(e.target.value); setErrors((p) => ({ ...p, spouseKidsName: '' })); }}
                  className={errors.spouseKidsName ? 'error' : ''}
                />
                {errors.spouseKidsName && <span className="error-msg">{errors.spouseKidsName}</span>}
              </div>

              {/* Name (registrant) */}
              <div className="form-group full-width">
                <label>Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  placeholder="Registrant's full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              {/* Phone */}
              <div className="form-group full-width">
                <label>Phone Number <span className="required-star">*</span></label>
                <div className={`phone-input-wrapper${errors.phone ? ' error' : ''}`}>
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, phone: '' })); }}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              {/* Age Category */}
              <div className="form-group full-width">
                <label>Age Category <span className="required-star">*</span></label>
                <div className="select-wrapper">
                  <select
                    value={ageCategory}
                    onChange={(e) => { setAgeCategory(e.target.value); setErrors((p) => ({ ...p, ageCategory: '' })); }}
                    className={errors.ageCategory ? 'error' : ''}
                  >
                    <option value="">— Select —</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Kid (5-12)">Kid (5-12)</option>
                    <option value="Kid (13-17)">Kid (13-17)</option>
                  </select>
                </div>
                {errors.ageCategory && <span className="error-msg">{errors.ageCategory}</span>}
              </div>

              {/* Select Game */}
              <div className="form-group full-width">
                <label>Select Game <span className="required-star">*</span> <span style={{ color: 'var(--charcoal-light)', fontWeight: 400, fontSize: '0.8rem' }}>(max {MAX_GAMES})</span></label>
                <GamePicker
                  selected={selectedGames}
                  onChange={(val) => { setSelectedGames(val); setErrors((p) => ({ ...p, selectedGame: '' })); }}
                  error={errors.selectedGame}
                />
                {errors.selectedGame && <span className="error-msg">{errors.selectedGame}</span>}
              </div>

              {/* Photo */}
              <div className="form-group full-width">
                <label>Photo <span className="required-star">*</span></label>
                <div
                  className={`photo-upload-zone${errors.photo ? ' error' : ''}${photoPreview ? ' has-file' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                  aria-label="Upload photo"
                >
                  {photoPreview ? (
                    <div className="photo-preview-wrapper">
                      <img src={photoPreview} alt="preview" className="photo-preview-img" />
                      <button
                        type="button"
                        className="photo-clear-btn"
                        onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                        aria-label="Remove photo"
                      >✕</button>
                    </div>
                  ) : (
                    <div className="photo-upload-placeholder">
                      <span className="photo-upload-icon">📷</span>
                      <span>Click to upload photo</span>
                      <span className="photo-upload-hint">JPEG / PNG / WebP, max 5 MB</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handlePhoto} style={{ display: 'none' }} aria-hidden="true" />
                {errors.photo && <span className="error-msg">{errors.photo}</span>}
              </div>

            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'SUBMITTING...' : 'REGISTER NOW'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
