import { useEffect, useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import FavoriteVendors from "./pages/FavoriteVendors";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MyInquiries from "./pages/MyInquiries";
import Register from "./pages/Register";
import VendorDashboard from "./pages/VendorDashboard";
import VendorDetail from "./pages/VendorDetail";
import VendorList from "./pages/VendorList";
import { apiUrl } from "./utils/api";
import { clearSavedAuth } from "./utils/auth";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    function loadSavedUser() {
      const savedUser = localStorage.getItem("eventhubUser");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.removeItem("eventhubUser");
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
    fetch(apiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    }).catch((error) => {
      console.error("Error clearing login cookie:", error);
    });

    clearSavedAuth();
    setUser(null);
    window.location.href = "/vendors";
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <main className="app">
        <nav className="navbar">
          <Link className="brand-link" to="/" aria-label="EventHub home">
            <span className="brand-mark" aria-hidden="true">
              <img className="brand-logo-image" src="/favicon.svg" alt="" />
            </span>
            <span>Event<span>Hub</span></span>
          </Link>

          <div className="nav-links">
            <NavLink to="/" end>Home</NavLink>
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
                <img className="brand-logo-image" src="/favicon.svg" alt="" />
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
