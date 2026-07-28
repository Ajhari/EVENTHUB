import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import VendorList from "./pages/VendorList";
import VendorDetail from "./pages/VendorDetail";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <main className="app">
        <nav>
          <Link to="/vendors">Vendors</Link>
        </nav>

        <Routes>
          <Route path="/" element={<VendorList />} />
          <Route path="/vendors" element={<VendorList />} />
          <Route path="/vendors/:id" element={<VendorDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;