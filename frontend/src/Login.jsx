import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // 🌟 ENVIRONMENT-AWARE API ROUTING 🌟
  // If running locally (npm run dev), use localhost. If on Vercel, use Render!
  const API_URL = import.meta.env.DEV 
    ? "http://localhost:3000" 
    : "https://streamprices.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isLoginView && password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setIsLoading(true);

    const endpoint = isLoginView ? '/api/login' : '/api/signup';
    
    try {
      // 🔄 Updated to use the dynamic API_URL
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      localStorage.setItem('token', data.token);
      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Helvetica Neue, sans-serif' }}>
      
      {/* LEFT SIDE: The Login Form */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#141414' }}>
        <div style={{ backgroundColor: '#222', padding: '50px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          
          <h1 style={{ color: '#E50914', textAlign: 'center', margin: '0 0 10px 0', fontSize: '2.5rem' }}>StreamPrices</h1>
          <h2 style={{ color: 'white', textAlign: 'center', margin: '0 0 30px 0', fontSize: '1.2rem', fontWeight: 'normal' }}>
            {isLoginView ? "Sign In to your account" : "Create a new account"}
          </h2>

          {error && <div style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '15px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: 'white', fontSize: '1rem' }}
            />
            
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '15px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: 'white', fontSize: '1rem' }}
            />
            
            {!isLoginView && (
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ padding: '15px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: 'white', fontSize: '1rem' }}
              />
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-5px' }}>
              <input 
                type="checkbox" 
                id="showPassword" 
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="showPassword" style={{ color: '#aaa', fontSize: '0.9rem', cursor: 'pointer' }}>
                Show Password
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ padding: '15px', backgroundColor: '#E50914', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
            >
              {isLoading ? "Please wait..." : (isLoginView ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <p style={{ color: '#aaa', textAlign: 'center', marginTop: '30px', fontSize: '0.9rem' }}>
            {isLoginView ? "New to StreamPrices? " : "Already have an account? "}
            <span 
              onClick={() => { 
                setIsLoginView(!isLoginView); 
                setError("");
                setPassword(""); 
                setConfirmPassword("");
                setShowPassword(false);
               }} 
              style={{ color: 'white', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              {isLoginView ? "Sign up now." : "Sign in."}
            </span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Branding Showcase with LOGO */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #141414 0%, #E50914 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', color: 'white' }}>
        
        <img 
          src="/logo.png" 
          alt="StreamPrices Logo" 
          style={{ width: '100%', maxWidth: '350px', marginBottom: '40px', filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))' }}
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://placehold.co/600x300/111/E50914?text=StreamPrices+Logo&font=Montserrat";
          }}
        />
        
        <h2 style={{ fontSize: '3rem', margin: '0 0 20px 0', textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Stop overpaying.</h2>
        <p style={{ fontSize: '1.2rem', color: '#f0f0f0', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6', textShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
          StreamPrices is a real-time aggregator. We try to find you the absolute best deals across the web.
        </p>
        
      </div>
    </div>
  );
}

export default Login;