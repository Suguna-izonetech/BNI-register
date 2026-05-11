import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLogin } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { LOGO_DATA_URL } from '../assets/logo';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter credentials');
      return;
    }
    setLoading(true);
    try {
      const data = await adminLogin(username, password);
      login(data.access_token);
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src={LOGO_DATA_URL} alt="BNI-TPL 2026" style={{ height: 72, width: 'auto' }} />
          <h2>ADMIN PORTAL</h2>
          <p>BNI – TPL 2026</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Username <span className="required-star">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              autoComplete="username"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Password <span className="required-star">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
