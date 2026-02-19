import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState(""); 
  const [pincode, setPincode] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  // THE BOUNCER: Check if the user has a VIP Token. If not, kick them to Login!
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); 
    } else {
      fetchProducts(); // If they have a token, load the deals!
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Shred the VIP Token
    navigate('/login'); // Send them back to the login page
  };

  const fetchProducts = (query = "", pin = "") => {
    setIsLoading(true); 
    let url = 'http://localhost:3000/api/search';
    if (query) url += `?q=${query}&pincode=${pin}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const sortedData = data.results.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 9999999; 
          const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 9999999;
          return priceA - priceB;
        });
        setProducts(sortedData);
        setIsLoading(false); 
      })
      .catch(error => { console.error("Error:", error); setIsLoading(false); });
  };

  const handleSearch = (e) => {
    e.preventDefault(); 
    if(searchInput.trim() !== "") fetchProducts(searchInput, pincode);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Helvetica Neue, sans-serif', backgroundColor: '#141414', color: 'white', minHeight: '100vh' }}>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .loader { border: 6px solid #333; border-top: 6px solid #E50914; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px auto; }`}
      </style>

      {/* HEADER WITH LOGOUT BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#E50914', fontSize: '2rem', margin: 0 }}>StreamPrices</h1>
        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Sign Out
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '30px' }}>Search. Compare. Save. Delivered.</p>
        <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <input type="text" placeholder="Delivery Pincode (e.g. 110001)" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength="6" style={{ padding: '15px 20px', width: '220px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#333', color: 'white', fontSize: '1.1rem' }} />
          <input type="text" placeholder="Search for TVs, Mobiles, PS5..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ padding: '15px 20px', width: '400px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#333', color: 'white', fontSize: '1.1rem' }} />
          <button type="submit" disabled={isLoading} style={{ padding: '15px 30px', backgroundColor: isLoading ? '#555' : '#E50914', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Compare</button>
        </form>
      </div>
      
      <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        {searchInput ? `Results for "${searchInput}" ${pincode ? `in ${pincode}` : ''}` : "Latest Deals"}
      </h2>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loader"></div><h3 style={{ color: 'white', fontSize: '1.5rem', margin: '0 0 10px 0' }}>Scraping Live Prices...</h3><p style={{ color: '#aaa', fontSize: '1rem' }}>Checking local availability. Please wait.</p></div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {products.length > 0 ? products.map((item, index) => (
            <div key={index} style={{ border: index === 0 ? '2px solid #4CAF50' : '1px solid #333', padding: '20px', borderRadius: '8px', width: '280px', backgroundColor: '#222', position: 'relative' }}>
              {index === 0 && <div style={{ position: 'absolute', top: '-12px', right: '-12px', backgroundColor: '#4CAF50', color: 'white', padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>⭐ Best Deal</div>}
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', lineHeight: '1.4', height: '50px', overflow: 'hidden' }}>{item.title}</h3>
              <p style={{ fontSize: '32px', fontWeight: 'bold', color: index === 0 ? '#4CAF50' : 'white', margin: '10px 0' }}>{item.price}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#aaa', backgroundColor: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{item.store}</span>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>{item.pincode ? `📍 ${item.pincode}` : new Date(item.dateScraped).toLocaleDateString()}</span>
              </div>
              <button onClick={() => item.link ? window.open(item.link, '_blank') : alert('No link available')} style={{ backgroundColor: index === 0 ? '#4CAF50' : 'white', color: index === 0 ? 'white' : 'black', border: 'none', padding: '12px', width: '100%', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>View on {item.store}</button>
            </div>
          )) : <p style={{ color: '#aaa', fontSize: '1.2rem' }}>No products found. Try a different search!</p>}
        </div>
      )}
    </div>
  )
}

export default Home;