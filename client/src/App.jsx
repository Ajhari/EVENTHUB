import { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MyInquiries from "./pages/MyInquiries";
import Register from "./pages/Register";
import VendorDashboard from "./pages/VendorDashboard";
import VendorDetail from "./pages/VendorDetail";
import VendorList from "./pages/VendorList";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    function loadSavedUser() {
      const savedUser = localStorage.getItem("eventhubUser");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
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
    localStorage.removeItem("eventhubUser");
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
            <Link to="/">About</Link>
            <Link to="/vendors">Explore vendors</Link>

            {user?.role === "customer" && (
              <Link to="/my-inquiries">My Inquiries</Link>
            )}

            {user?.role === "vendor" && (
              <Link to="/vendor/dashboard">Vendor Dashboard</Link>
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
          <Route path="/my-inquiries" element={<MyInquiries />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
