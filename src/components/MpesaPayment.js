import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../constants';

function MpesaPayment({ adoptionId, animalName, onSuccess, onCancel }) {
  const [phone, setPhone] = useState('');
  const [amount] = useState(5); // KES 5 adoption fee (test)
  const [step, setStep] = useState('form'); // form | waiting | success | failed
  const [paymentId, setPaymentId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const pollRef = useRef(null);
  const countRef = useRef(null);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    return () => {
      clearInterval(pollRef.current);
      clearInterval(countRef.current);
    };
  }, []);

  const startPolling = (pid) => {
    setCountdown(120);
    countRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countRef.current);
          clearInterval(pollRef.current);
          setStep('failed');
          setError('Payment timed out. Please try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/pay/status/${pid}`);
        const data = await res.json();
        if (data.status === 'completed') {
          clearInterval(pollRef.current);
          clearInterval(countRef.current);
          setReceipt(data.mpesa_receipt);
          setStep('success');
          if (onSuccess) onSuccess(data);
        }
        // Only mark failed if explicitly failed - NOT on pending/processing
        // We let the countdown handle timeout
      } catch (e) { console.error(e); }
    }, 5000); // Poll every 5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/pay/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          adoption_id: adoptionId,
          phone: phone,
          amount: amount
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentId(data.payment_id);
        setStep('waiting');
        startPolling(data.payment_id);
      } else {
        setError(data.detail || 'Failed to initiate payment');
      }
    } catch (e) {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    modal: { background: 'white', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' },
    title: { fontSize: '1.5rem', fontWeight: 800, color: '#2d3748', marginBottom: '0.5rem' },
    subtitle: { color: '#718096', marginBottom: '2rem', fontSize: '0.95rem' },
    input: { width: '100%', padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    btn: { width: '100%', padding: '1rem', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' },
    cancelBtn: { width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '12px', background: 'transparent', color: '#718096', fontWeight: 600, cursor: 'pointer', marginTop: '0.75rem', fontSize: '1rem' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #00a651, #007a3d)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            📱
          </div>
          <div>
            <div style={styles.title}>M-PESA Payment</div>
            <div style={{ color: '#718096', fontSize: '0.9rem' }}>Adoption fee for <strong>{animalName}</strong></div>
          </div>
        </div>

        {/* FORM STEP */}
        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'linear-gradient(135deg, #f0fff4, #e6ffed)', border: '1px solid #9ae6b4', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#276749', fontWeight: 600 }}>Adoption Fee</span>
              <span style={{ color: '#276749', fontSize: '1.5rem', fontWeight: 800 }}>KES {amount}</span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#4a5568', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                M-PESA Phone Number
              </label>
              <input
                style={styles.input}
                type="tel"
                placeholder="e.g. 0712345678 or 254712345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                onFocus={e => e.target.style.borderColor = '#00a651'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <div style={{ color: '#a0aec0', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                🧪 Sandbox test number: 254708374149
              </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fbd38d', borderRadius: '10px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#92400e' }}>
              💡 You'll receive an M-PESA prompt on your phone. Enter your PIN to complete payment.
            </div>

            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', color: '#c53030', fontSize: '0.9rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} style={{ ...styles.btn, background: isLoading ? '#a0aec0' : 'linear-gradient(135deg, #00a651, #007a3d)', color: 'white' }}>
              {isLoading ? '⏳ Sending prompt...' : `💚 Pay KES ${amount} via M-PESA`}
            </button>
            <button type="button" onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
          </form>
        )}

        {/* WAITING STEP */}
        {step === 'waiting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>📱</div>
            <h3 style={{ color: '#2d3748', fontWeight: 700, marginBottom: '0.5rem' }}>Check Your Phone!</h3>
            <p style={{ color: '#718096', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              An M-PESA payment prompt has been sent to <strong>{phone}</strong>.<br />
              Enter your <strong>M-PESA PIN</strong> to complete the payment.
            </p>

            <div style={{ background: '#f8f9ff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#667eea', marginBottom: '0.25rem' }}>{countdown}s</div>
              <div style={{ color: '#718096', fontSize: '0.9rem' }}>Waiting for payment confirmation...</div>
              <div style={{ marginTop: '1rem', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '3px', width: `${(countdown / 120) * 100}%`, transition: 'width 1s linear' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#718096', textAlign: 'left', background: '#f8f9ff', borderRadius: '10px', padding: '1rem' }}>
              <div>1️⃣ Open M-PESA prompt on your phone</div>
              <div>2️⃣ Enter your M-PESA PIN</div>
              <div>3️⃣ Confirm the KES {amount} payment</div>
            </div>

            <button onClick={onCancel} style={{ ...styles.cancelBtn, marginTop: '1rem' }}>Cancel Payment</button>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #00a651, #007a3d)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>✅</div>
            <h3 style={{ color: '#2d3748', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payment Successful!</h3>
            <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Your adoption fee for <strong>{animalName}</strong> has been received.</p>

            {receipt && (
              <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '0.25rem' }}>M-PESA Receipt</div>
                <div style={{ color: '#276749', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>{receipt}</div>
              </div>
            )}

            <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#667eea' }}>
              🎉 Your adoption application has been <strong>automatically approved!</strong>
            </div>

            <button onClick={() => onSuccess && onSuccess()} style={{ ...styles.btn, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
              🐾 View My Applications
            </button>
          </div>
        )}

        {/* FAILED STEP */}
        {step === 'failed' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h3 style={{ color: '#2d3748', fontWeight: 700, marginBottom: '0.5rem' }}>Payment Failed</h3>
            <p style={{ color: '#718096', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={() => { setStep('form'); setError(''); }} style={{ ...styles.btn, background: 'linear-gradient(135deg, #00a651, #007a3d)', color: 'white', marginBottom: '0.75rem' }}>
              🔄 Try Again
            </button>
            <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MpesaPayment;
