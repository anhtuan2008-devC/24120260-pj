import { useState } from 'react';
import { verifyAdmin, generateOTP, verifyOTP } from '../../api/auth';
import type { AdminUser } from '../../types/auth';
import './Login.css';

interface LoginProps {
  onLoginSuccess: (adminData: AdminUser) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1: Credentials, 2: OTP
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempAdmin, setTempAdmin] = useState<AdminUser | null>(null);

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const admin = await verifyAdmin(email, password);
      console.log('[DEBUG] Admin login attempt:', { email, two_factor: admin.two_factor_enabled });
      
      if (admin.two_factor_enabled === true) {
        setTempAdmin(admin);
        const code = await generateOTP(email);
        console.log('[DEV] OTP Code sent to email:', code);
        setStep(2);
      } else {
        onLoginSuccess(admin);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyOTP(email, otp);
      if (isValid && tempAdmin) {
        onLoginSuccess(tempAdmin);
      } else {
        setError('Invalid or expired verification code.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      
      <div className="login-card blur-fade-in">
        <div className="login-header">
          <div className="login-logo">E</div>
          <h1>EmpSys Admin</h1>
          <p>{step === 1 ? 'Sign in to manage system' : 'Two-Factor Authentication'}</p>
        </div>

        {step === 1 ? (
          <form className="login-form" onSubmit={handleSubmitCredentials}>
            {error && <div className="login-error">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? <div className="spinner"></div> : 'Continue'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmitOTP}>
            {error && <div className="login-error">{error}</div>}
            
            <div className="otp-info">
              A verification code has been sent to <strong>{email}</strong>. Please enter it below.
            </div>

            <div className="form-group">
              <label htmlFor="otp">Verification Code (OTP)</label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="otp-input"
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="login-submit" disabled={isLoading}>
              {isLoading ? <div className="spinner"></div> : 'Verify'}
            </button>
            
            <button 
              type="button" 
              className="back-to-login" 
              onClick={() => { setStep(1); setError(null); setOtp(''); }}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>© 2026 Employee Management System</p>
        </div>
      </div>
    </div>
  );
}
