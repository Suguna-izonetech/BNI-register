import imageCompression from 'browser-image-compression';
import { FormEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { submitOneToOne } from '../services/api';

export default function OneToOneRegistrationPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1024, useWebWorker: true });
      setPhotoFile(compressed as File);
      setPhotoPreview(URL.createObjectURL(compressed));
      toast.success('Photo ready');
    } catch {
      toast.error('Failed to process photo');
    }
  };

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!/^[6-9]\d{9}$/.test(phone)) return 'Enter valid 10-digit mobile number';
    if (!photoFile) return 'Photo is required';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) return toast.error(v);
    setLoading(true);
    try {
      await submitOneToOne({ name: name.trim(), phone_number: `+91${phone}`, business_name: businessName || undefined, business_category: businessCategory || undefined, photo: photoFile });
      toast.success('One-to-one registration successful');
      setName(''); setPhone(''); setBusinessName(''); setBusinessCategory(''); setPhotoFile(null); setPhotoPreview(null);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Submission failed';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="page-header"><h1>ONE-TO-ONE REGISTRATION</h1></div>
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">One-to-one Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group full-width">
                <label>Phone Number *</label>
                <div className="phone-input-wrapper"><span className="phone-prefix">+91</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))} maxLength={10} />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Business Name</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className="form-group full-width">
                <label>Business Category</label>
                <input value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} />
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
