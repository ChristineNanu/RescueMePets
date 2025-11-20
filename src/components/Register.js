import React, { useState } from "react";
import { API_BASE_URL } from '../constants';

export const Register = (props) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (pass !== confirmPass) {
            setMessage('Passwords do not match');
            return;
        }

        if (pass.length < 6) {
            setMessage('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password: pass }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                // Switch to login after successful registration
                setTimeout(() => props.onFormSwitch('login'), 2000);
            } else {
                setMessage(data.detail);
            }
        } catch (error) {
            setMessage('Error registering. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h1 className="auth-title">Join Our Community 🐾</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            value={username}
                            name="username"
                            onChange={(e) => setUsername(e.target.value)}
                            id="username"
                            placeholder="Choose a username"
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="your.email@example.com"
                            id="email"
                            name="email"
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            id="password"
                            name="password"
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                            type="password"
                            placeholder="Confirm your password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="auth-input"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="loading"></span>
                                Creating Account...
                            </>
                        ) : (
                            '📝 Register'
                        )}
                    </button>
                </form>
                {message && (
                    <div className={message.includes('successful') ? 'success-message' : 'error-message'}>
                        {message}
                    </div>
                )}
                <button
                    className="link-btn"
                    onClick={() => props.onFormSwitch('login')}
                >
                    Already have an account? Login here.
                </button>
            </div>
        </div>
    )
}
export default Register;
