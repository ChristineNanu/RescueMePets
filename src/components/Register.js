import React, { useState } from "react";

export const Register = (props) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8002/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password: pass }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                // Optionally switch to login after successful registration
                setTimeout(() => props.onFormSwitch('login'), 2000);
            } else {
                setMessage(data.detail);
            }
        } catch (error) {
            setMessage('Error registering');
        }
    }

    return (
        <div className="auth-form-container">
            <h2>Register</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input value={username} name="username" onChange={(e) => setUsername(e.target.value)} id="username" placeholder="username" required />
                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)}type="email" placeholder="youremail@gmail.com" id="email" name="email" required />
                <label htmlFor="password">Password</label>
                <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder="********" id="password" name="password" required />
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
            <button className="link-btn" onClick={() => props.onFormSwitch('login')}>Already have an account? Login here.</button>
        </div>
    )
}
export default Register;
