import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authHeaders } from "../utils/auth";

function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const savedUser = localStorage.getItem("eventhubUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  function formatDate(dateValue) {
    return new Date(dateValue).toLocaleDateString("en-IN");
  }

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/inquiries/customer/${user.id}`, {
      headers: authHeaders(),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch customer inquiries");
        }

        return response.json();
      })
      .then((data) => {
        setInquiries(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customer inquiries:", error);
        setPageError("Could not load your inquiries.");
        setLoading(false);
      });
  }, [savedUser]);

  if (!user) {
    return (
      <section>
        <p>Please login to view your inquiries.</p>
        <Link className="action-link" to="/login">Go to Login</Link>
      </section>
    );
  }

  if (user.role !== "customer") {
    return <p>Only customers can view this page.</p>;
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (statusFilter === "all") {
      return true;
    }

    return inquiry.status === statusFilter;
  });

  return (
    <section>
      <h1>My Inquiries</h1>
      <p>Track the inquiries you sent to vendors.</p>

      {loading && <p>Loading inquiries...</p>}

      {pageError && <p className="error-message">{pageError}</p>}

      {!loading && !pageError && inquiries.length === 0 && (
        <p>You have not sent any inquiries yet.</p>
      )}

      {!loading && !pageError && inquiries.length > 0 && (
        <p className="result-count">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
          {statusFilter !== "all" ? ` for "${statusFilter}"` : ""}
        </p>
      )}

      {!loading && !pageError && inquiries.length > 0 && (
        <label className="dashboard-filter">
          Filter by status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="viewed">Viewed</option>
            <option value="replied">Replied</option>
          </select>
        </label>
      )}

      {!loading && !pageError && inquiries.length > 0 && filteredInquiries.length === 0 && (
        <p>No inquiries match this status.</p>
      )}

      <section className="inquiry-list">
        {filteredInquiries.map((inquiry) => (
          <article className="inquiry-card" key={inquiry.id}>
            <h2>{inquiry.business_name}</h2>
            <p>
              <strong>Location:</strong> {inquiry.location}
            </p>
            <p>
              <strong>Event Date:</strong> {formatDate(inquiry.event_date)}
            </p>
            <p>
              <strong>Message:</strong> {inquiry.message}
            </p>
            <span className={`status-badge status-${inquiry.status}`}>
              {inquiry.status}
            </span>
            <Link to={`/vendors/${inquiry.vendor_id}`}>View Vendor</Link>
          </article>
        ))}
      </section>
    </section>
  );
}

export default MyInquiries;
