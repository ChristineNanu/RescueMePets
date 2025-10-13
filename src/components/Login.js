import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export const Login = (props) => {
    const [username, setUsername] = useState('');
    const [pass, setPass] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8002/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password: pass }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                // Store user_id in localStorage
                localStorage.setItem('user_id', data.user_id);
                // Notify parent component and redirect
                if (props.onLogin) {
                    props.onLogin();
                }
                setTimeout(() => navigate('/animals'), 1000);
            } else {
                setMessage(data.detail);
            }
        } catch (error) {
            setMessage('Error logging in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h1 className="auth-title">Welcome Back! 🐾</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            placeholder="Enter your username"
                            id="username"
                            name="username"
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
                            placeholder="Enter your password"
                            id="password"
                            name="password"
                            className="auth-input"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="loading"></span>
                                Logging In...
                            </>
                        ) : (
                            '🔐 Log In'
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
                    onClick={() => props.onFormSwitch('register')}
                >
                    Don't have an account? Register here.
                </button>
            </div>
        </div>
    )
}
export default Login;
