import imageCompression from 'browser-image-compression';
import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchTeams, submitRegistration, Team } from '../services/api';

const SIZES = ['38', '40', '42', '44', '46', '48'];

// Photo constraints
const PHOTO_MAX_MB = 5;          // hard reject above this
const PHOTO_TARGET_MB = 0.3;     // compress down to ~300 KB
const PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_ALLOWED_EXT = '.jpg, .jpeg, .png, .webp';

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface FormData {
  team_name: string;
  player_name: string;
  phone_number: string;
  jersey_name: string;
  jersey_number: string;
  jersey_size: string;
  lower_size: string;
}

interface Errors {
  [key: string]: string;
}

const INITIAL: FormData = {
  team_name: '',
  player_name: '',
  phone_number: '',
  jersey_name: '',
  jersey_number: '',
  jersey_size: '',
  lower_size: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTeams().then(setTeams).catch(() => toast.error('Failed to load teams'));
  }, []);

  // ── Photo handler ──────────────────────────────────────────────
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError('');
    setPhotoFile(null);
    setPhotoPreview(null);

    if (!file) return;

    // Type check
    if (!PHOTO_ALLOWED_TYPES.includes(file.type)) {
      setPhotoError('Only JPEG, PNG, or WebP images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Hard size limit before compression
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) {
      setPhotoError(`File is too large. Maximum allowed size is ${PHOTO_MAX_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Compress
    setCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: PHOTO_TARGET_MB,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      });

      setPhotoFile(compressed as File);
      setPhotoPreview(await fileToDataUrl(compressed as File));

      const originalKB = (file.size / 1024).toFixed(0);
      const compressedKB = (compressed.size / 1024).toFixed(0);
      toast.success(`Photo compressed: ${originalKB} KB → ${compressedKB} KB`);
    } catch {
      setPhotoError('Failed to compress image. Please try a different file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setCompressing(false);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Form validation ────────────────────────────────────────────
  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.team_name) e.team_name = 'Please select a team';
    if (!form.player_name.trim()) e.player_name = 'Player name is required';
    if (!form.jersey_name.trim()) e.jersey_name = 'Jersey name is required';
    if (!form.jersey_size) e.jersey_size = 'Please select jersey size';
    if (!form.lower_size) e.lower_size = 'Please select lower size';
    if (!photoFile) e.photo = 'Player photo is required';

    const jn = parseInt(form.jersey_number);
    if (form.jersey_number === '') e.jersey_number = 'Jersey number is required';
    else if (isNaN(jn) || jn < 0 || jn > 999) e.jersey_number = 'Must be a number between 0-999';

    const phone = form.phone_number.replace(/\s/g, '');
    if (!phone) {
      e.phone_number = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      e.phone_number = 'Enter valid 10-digit Indian mobile number (starting with 6-9)';
    }

    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
      await submitRegistration({
        team_name: form.team_name,
        player_name: form.player_name.trim(),
        phone_number: `+91${form.phone_number}`,
        jersey_name: form.jersey_name.trim(),
        jersey_number: parseInt(form.jersey_number),
        jersey_size: form.jersey_size,
        lower_size: form.lower_size,
        photo: photoFile,
      });
      setSubmittedData({
        team_name: form.team_name,
        player_name: form.player_name.trim(),
        phone_number: `+91${form.phone_number}`,
        jersey_name: form.jersey_name.trim(),
        jersey_number: form.jersey_number,
        jersey_size: form.jersey_size,
        lower_size: form.lower_size,
        photo_url: photoPreview,
      });
      setSubmitted(true);
      toast.success('Registration successful! Welcome to BNI-TPL 2026! 🏏');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
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
            <p>Player Registration Admit Card</p>
          </div>
          <div class="admit-details">
            ${submittedData.photo_url ? `<img class="admit-photo" src="${submittedData.photo_url}" alt="Registered photo" />` : ''}
            <div class="admit-fields">
              <div class="section">
                <h3>Player Details</h3>
                <div class="field"><span class="label">Chapter:</span><span class="value">${submittedData.team_name}</span></div>
                <div class="field"><span class="label">Player Name:</span><span class="value">${submittedData.player_name}</span></div>
                <div class="field"><span class="label">Phone Number:</span><span class="value">${submittedData.phone_number}</span></div>
              </div>
              <div class="section">
                <h3>Jersey Details</h3>
                <div class="field"><span class="label">Jersey Name:</span><span class="value">${submittedData.jersey_name}</span></div>
                <div class="field"><span class="label">Jersey Number:</span><span class="value">${submittedData.jersey_number}</span></div>
                <div class="field"><span class="label">Jersey Size:</span><span class="value">${submittedData.jersey_size}</span></div>
                <div class="field"><span class="label">Lower Size:</span><span class="value">${submittedData.lower_size}</span></div>
              </div>
            </div>
          </div>
          <div class="footer"><p>Registration submitted successfully!</p><p>Date: ${new Date().toLocaleString()}</p></div>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'height=700,width=900');
    if (!printWindow) {
      toast.error('Please allow pop-ups to download the admit card');
      return;
    }
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
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏏</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--gold-dark)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
              REGISTRATION SUCCESSFUL!
            </h2>
            <p style={{ color: 'var(--charcoal-light)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Welcome to <strong>BNI – TPL 2026</strong>! Your registration has been submitted. See you on the field! 🎉
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem' }} onClick={downloadPDF}>
                DOWNLOAD AS PDF
              </button>
              <button
              className="btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2.5rem' }}
              onClick={() => { setForm(INITIAL); setSubmitted(false); setSubmittedData(null); setErrors({}); clearPhoto(); }}
            >
              ➕ REGISTER ANOTHER PLAYER
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-header">
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '0.75rem', color: 'var(--white)', borderColor: 'var(--white)' }}>
          ← Back to Home
        </button>
        <h1>PLAYER REGISTRATION</h1>
      </div>

      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">BNI – TPL 2026 | Registration Form</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">

              {/* Team */}
              <div className="form-group full-width">
                <label>Team / Chapter Name <span className="required-star">*</span></label>
                <div className="select-wrapper">
                  <select
                    name="team_name"
                    value={form.team_name}
                    onChange={handleChange}
                    className={errors.team_name ? 'error' : ''}
                  >
                    <option value="">— Select Team —</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                {errors.team_name && <span className="error-msg">{errors.team_name}</span>}
              </div>

              {/* Player Name */}
              <div className="form-group full-width">
                <label>Player Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="player_name"
                  placeholder="Enter full name"
                  value={form.player_name}
                  onChange={handleChange}
                  className={errors.player_name ? 'error' : ''}
                />
                {errors.player_name && <span className="error-msg">{errors.player_name}</span>}
              </div>

              {/* Phone */}
              <div className="form-group full-width">
                <label>Phone Number <span className="required-star">*</span></label>
                <div className={`phone-input-wrapper${errors.phone_number ? ' error' : ''}`}>
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="10-digit mobile number"
                    value={form.phone_number}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                {errors.phone_number && <span className="error-msg">{errors.phone_number}</span>}
              </div>

              {/* Jersey Name */}
              <div className="form-group">
                <label>Jersey Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="jersey_name"
                  placeholder="Name on jersey"
                  value={form.jersey_name}
                  onChange={handleChange}
                  className={errors.jersey_name ? 'error' : ''}
                />
                {errors.jersey_name && <span className="error-msg">{errors.jersey_name}</span>}
              </div>

              {/* Jersey Number */}
              <div className="form-group">
                <label>Jersey Number <span className="required-star">*</span></label>
                <input
                  type="number"
                  name="jersey_number"
                  placeholder="e.g. 7"
                  value={form.jersey_number}
                  onChange={handleChange}
                  min={0}
                  max={999}
                  className={errors.jersey_number ? 'error' : ''}
                />
                {errors.jersey_number && <span className="error-msg">{errors.jersey_number}</span>}
              </div>

              {/* Jersey Size */}
              <div className="form-group">
                <label>Jersey Size <span className="required-star">*</span></label>
                <div className="select-wrapper">
                  <select
                    name="jersey_size"
                    value={form.jersey_size}
                    onChange={handleChange}
                    className={errors.jersey_size ? 'error' : ''}
                  >
                    <option value="">— Select Size —</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.jersey_size && <span className="error-msg">{errors.jersey_size}</span>}
              </div>

              {/* Lower Size */}
              <div className="form-group">
                <label>Lower Size <span className="required-star">*</span></label>
                <div className="select-wrapper">
                  <select
                    name="lower_size"
                    value={form.lower_size}
                    onChange={handleChange}
                    className={errors.lower_size ? 'error' : ''}
                  >
                    <option value="">— Select Size —</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.lower_size && <span className="error-msg">{errors.lower_size}</span>}
              </div>

              {/* Player Photo */}
              <div className="form-group full-width">
                <label>Player Photo <span className="required-star">*</span> <span style={{ color: 'var(--charcoal-light)', fontWeight: 400, fontSize: '0.8rem' }}>(JPEG / PNG / WebP, max 5 MB)</span></label>

                {/* Drop zone / file picker */}
                <div
                  className={`photo-upload-zone${(photoError || errors.photo) ? ' error' : ''}${photoFile ? ' has-file' : ''}`}
                  onClick={() => !compressing && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Upload player photo"
                >
                  {compressing ? (
                    <div className="photo-upload-placeholder">
                      <span className="photo-upload-icon">⏳</span>
                      <span>Compressing image…</span>
                    </div>
                  ) : photoPreview ? (
                    <div className="photo-preview-wrapper">
                      <img src={photoPreview} alt="Player preview" className="photo-preview-img" />
                      <button
                        type="button"
                        className="photo-clear-btn"
                        onClick={(e) => { e.stopPropagation(); clearPhoto(); }}
                        aria-label="Remove photo"
                      >
                        ✕
                      </button>
                      <span className="photo-preview-label">
                        {photoFile?.name} ({(photoFile!.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="photo-upload-placeholder">
                      <span className="photo-upload-icon">📷</span>
                      <span>Click to upload photo</span>
                      <span className="photo-upload-hint">Auto-compressed to ~300 KB for fast upload</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={PHOTO_ALLOWED_EXT}
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />

                {photoError && <span className="error-msg">{photoError}</span>}
                {!photoError && errors.photo && <span className="error-msg">{errors.photo}</span>}
              </div>

            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary" disabled={loading || compressing}>
                {loading ? 'SUBMITTING...' : 'REGISTER NOW'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
