import { useEffect, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import FavoriteVendors from "./pages/FavoriteVendors";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MyInquiries from "./pages/MyInquiries";
import Register from "./pages/Register";
import VendorDashboard from "./pages/VendorDashboard";
import VendorDetail from "./pages/VendorDetail";
import VendorList from "./pages/VendorList";
import { clearSavedAuth } from "./utils/auth";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    function loadSavedUser() {
      const savedUser = localStorage.getItem("eventhubUser");
      const savedToken = localStorage.getItem("eventhubToken");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.removeItem("eventhubUser");
        localStorage.removeItem("eventhubToken");
        setUser(null);
      }
    }

    loadSavedUser();
    window.addEventListener("eventhub-auth-change", loadSavedUser);

    return () => {
      window.removeEventListener("eventhub-auth-change", loadSavedUser);
    };
  }, []);

  function handleLogout() {
    clearSavedAuth();
    setUser(null);
    window.location.href = "/vendors";
  }

  return (
    <BrowserRouter>
      <main className="app">
        <nav className="navbar">
          <Link className="brand-link" to="/" aria-label="EventHub home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="m8 14 2.2 2L16 11"/></svg>
            </span>
            <span>Event<span>Hub</span></span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end>About</NavLink>
            <NavLink to="/vendors">Explore vendors</NavLink>

            {user?.role === "customer" && (
              <>
                <NavLink to="/favorites">Favorites</NavLink>
                <NavLink to="/my-inquiries">My Inquiries</NavLink>
              </>
            )}

            {user?.role === "vendor" && (
              <NavLink to="/vendor/dashboard">Vendor Dashboard</NavLink>
            )}

            {!user && (
              <>
                <Link to="/login">Login</Link>
                <Link className="nav-cta" to="/register">Join EventHub</Link>
              </>
            )}

            {user && (
              <>
                <span className="user-name">Hi, {user.name}</span>
                <button className="logout-button" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendors/:id" element={<VendorDetail />} />
          <Route path="/favorites" element={<FavoriteVendors />} />
          <Route path="/my-inquiries" element={<MyInquiries />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>

        <footer className="site-footer">
          <div className="footer-brand">
            <Link className="brand-link" to="/" aria-label="EventHub home">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="m8 14 2.2 2L16 11"/></svg>
              </span>
              <span>Event<span>Hub</span></span>
            </Link>
            <p>Bringing trusted event professionals and unforgettable celebrations together across Tamil Nadu.</p>
          </div>
          <div className="footer-links">
            <div><strong>Explore</strong><Link to="/vendors">All vendors</Link><Link to="/register">Join EventHub</Link></div>
            <div><strong>Account</strong><Link to="/login">Sign in</Link><Link to="/favorites">Favorites</Link><Link to="/my-inquiries">My inquiries</Link></div>
          </div>
          <div className="footer-bottom"><span>© 2026 EventHub</span><span>Made for memorable moments.</span></div>
        </footer>
      </main>
    </BrowserRouter>
  );
}

export default App;
