import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';

function App() {
  return (
    // BrowserRouter is the wrapper that enables page-to-page navigation
    <BrowserRouter>
      <Routes>
        {/* If the URL is /login, show the Auth screen */}
        <Route path="/login" element={<Login />} />
        
        {/* If the URL is the root (/), show the main Search app */}
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;