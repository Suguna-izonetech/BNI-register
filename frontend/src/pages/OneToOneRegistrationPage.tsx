import imageCompression from 'browser-image-compression';
import { FormEvent, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchTeams, submitOneToOne, Team } from '../services/api';

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function OneToOneRegistrationPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
    } catch {
      toast.error('Failed to process photo');
    }
  };

  const validate = () => {
    if (!teamName) return 'Chapter is required';
    if (!name.trim()) return 'Name is required';
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter valid 10-digit mobile number';
    if (!businessName.trim()) return 'Business name is required';
    if (!businessCategory.trim()) return 'Business category is required';
    if (!photoFile) return 'Photo is required';
    return null;
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
            <h1>BNI – TPL 2026</h1>
            <p>One-to-One Registration Confirmation</p>
          </div>
          <div class="admit-details">
            ${submittedData.photo_url ? `<img class="admit-photo" src="${submittedData.photo_url}" alt="Registered photo" />` : ''}
            <div class="admit-fields">
              <div class="section">
                <h3>Personal Details</h3>
                <div class="field"><span class="label">Chapter:</span><span class="value">${submittedData.team_name}</span></div>
                <div class="field"><span class="label">Name:</span><span class="value">${submittedData.name}</span></div>
                <div class="field"><span class="label">Phone Number:</span><span class="value">${submittedData.phone_number}</span></div>
              </div>
              <div class="section">
                <h3>Business Details</h3>
                <div class="field"><span class="label">Business Name:</span><span class="value">${submittedData.business_name || 'N/A'}</span></div>
                <div class="field"><span class="label">Business Category:</span><span class="value">${submittedData.business_category || 'N/A'}</span></div>
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return toast.error(v);
    setLoading(true);
    try {
      await submitOneToOne({ team_name: teamName, name: name.trim(), phone_number: `+91${phone}`, business_name: businessName.trim(), business_category: businessCategory.trim(), photo: photoFile });
      setSubmittedData({
        team_name: teamName,
        name: name.trim(),
        phone_number: `+91${phone}`,
        business_name: businessName.trim(),
        business_category: businessCategory.trim(),
        photo_url: photoPreview,
      });
      setSubmitted(true);
      toast.success('One-to-one registration successful! 🎉');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Submission failed';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="page-header"><button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '0.75rem', color: 'var(--white)', borderColor: 'var(--white)' }}>← Back to Home</button><h1>REGISTRATION</h1></div>
        <div className="form-container">
          <div className="form-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👤</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--gold-dark)', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
              REGISTRATION SUCCESSFUL!
            </h2>
            <p style={{ color: 'var(--charcoal-light)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Welcome to <strong>BNI – TPL 2026</strong>! Your one-to-one registration has been submitted. 🎉
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem' }} onClick={downloadPDF}>
                📥 DOWNLOAD AS PDF
              </button>
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2.5rem', backgroundColor: 'var(--charcoal-light)' }} onClick={() => { setTeamName(''); setName(''); setPhone(''); setBusinessName(''); setBusinessCategory(''); setPhotoFile(null); setPhotoPreview(null); setSubmitted(false); setSubmittedData(null); }}>
                ➕ REGISTER ANOTHER
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
      <div className="page-header"><button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '0.75rem', color: 'var(--white)', borderColor: 'var(--white)' }}>← Back to Home</button><h1>ONE-TO-ONE REGISTRATION</h1></div>
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">One-to-one Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Chapter *</label>
                <div className="select-wrapper">
                  <select value={teamName} onChange={(e) => setTeamName(e.target.value)} required>
                    <option value="">Select Chapter</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group full-width">
                <label>Phone Number *</label>
                <div className="phone-input-wrapper"><span className="phone-prefix">+91</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} maxLength={10} required />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Business Name *</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
              </div>
              <div className="form-group full-width">
                <label>Business Category *</label>
                <input value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} required />
              </div>

              <div className="form-group full-width">
                <label>Photo *</label>
                <div className={`photo-upload-zone${photoPreview ? ' has-file' : ''}`} onClick={() => fileRef.current?.click()} role="button">
                  {photoPreview ? (
                    <div className="photo-preview-wrapper">
                      <img src={photoPreview} alt="preview" className="photo-preview-img" />
                    </div>
                  ) : (
                    <div className="photo-upload-placeholder">📷 Click to upload</div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handlePhoto} style={{ display: 'none' }} />
              </div>

            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'SUBMITTING...' : 'REGISTER & DOWNLOAD ADMIT'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
