import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

export const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pass !== confirmPass) { setMessage('Passwords do not match'); return; }
    if (pass.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: pass }),
      });
      const data = await res.json();
      if (res.ok) { setIsSuccess(true); setTimeout(() => navigate('/login'), 2000); }
      else setMessage(data.detail);
    } catch { setMessage('Connection error. Is the server running?'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 to-stone-50">

      {/* Left — Photo Panel */}
      <div className="hidden md:flex md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=900&q=80"
          alt="pets"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/85 via-orange-600/75 to-rose-700/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="text-6xl mb-6 animate-bounce">🏠</div>
          <h2 className="text-5xl font-black leading-tight mb-6">
            Give a pet a<br />forever home
          </h2>
          <p className="text-amber-50 text-lg leading-relaxed font-medium">
            Join our community of animal lovers and help rescue pets find the loving families they deserve.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            {['Browse 21+ animals available for adoption', 'Save your favorites with one click', 'Track your adoption applications'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-base text-white/90 font-medium">
                <div className="w-6 h-6 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-sm flex-shrink-0 font-bold">✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-10">
            <button onClick={() => navigate('/')}
              className="text-3xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent bg-transparent border-0 cursor-pointer mb-3 block w-full hover:scale-110 transition-transform">
              🐾 RescueMePets
            </button>
            <h1 className="text-3xl font-black text-gray-800 mb-2">Create your account</h1>
            <p className="text-gray-500 text-sm font-medium">Start your adoption journey today — it's free!</p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-amber-200/30 border border-white/50 p-8 hover:shadow-3xl transition-shadow duration-300">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-2xl font-black text-gray-800 mb-3">Account Created!</h3>
                <p className="text-gray-500 text-base font-medium">Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-gray-700 text-base bg-white/50 backdrop-blur-sm focus:bg-white transition-all font-medium placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-gray-700 text-base bg-white/50 backdrop-blur-sm focus:bg-white transition-all font-medium placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-gray-700 text-base bg-white/50 backdrop-blur-sm focus:bg-white transition-all font-medium placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-gray-700 text-base bg-white/50 backdrop-blur-sm focus:bg-white transition-all font-medium placeholder:text-gray-400 shadow-sm"
                  />
                </div>

                {message && (
                  <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-600 text-sm px-4 py-3.5 rounded-2xl font-medium shadow-sm">
                    ⚠️ {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all border-0 shadow-lg mt-2
                    ${isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white cursor-pointer hover:shadow-2xl hover:shadow-amber-300/40 hover:-translate-y-1 active:scale-95'}`}>
                  {isLoading ? '⏳ Creating account...' : '🐾 Create Account'}
                </button>
              </form>
            )}

            {!isSuccess && (
              <div className="text-center mt-8 text-sm text-gray-500 font-medium">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')}
                  className="text-amber-600 font-bold bg-transparent border-0 cursor-pointer hover:text-amber-700 hover:underline transition-colors">
                  Sign in
                </button>
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <button onClick={() => navigate('/')}
              className="text-gray-500 text-sm bg-transparent border-0 cursor-pointer hover:text-gray-700 transition-colors font-medium">
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
