import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../utils/api";
import { authOptions } from "../utils/auth";

function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyInputs, setReplyInputs] = useState({});
  const [replySavingId, setReplySavingId] = useState(null);

  const savedUser = localStorage.getItem("eventhubUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  function formatDate(dateValue) {
    return new Date(dateValue).toLocaleDateString("en-IN");
  }

  function messageStatusText(status) {
    if (status === "replied") {
      return "Replied";
    }

    if (status === "viewed") {
      return "Viewed";
    }

    return "Sent";
  }

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setLoading(false);
      return;
    }

    fetch(apiUrl(`/api/inquiries/customer/${user.id}`), authOptions())
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch customer inquiries");
        }

        return response.json();
      })
      .then((data) => {
        setInquiries(data);
        setReplyInputs(
          data.reduce((inputs, inquiry) => ({
            ...inputs,
            [inquiry.id]: inquiry.customer_reply || "",
          }), {})
        );
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

  function handleReplyChange(inquiryId, value) {
    setReplyInputs((currentInputs) => ({
      ...currentInputs,
      [inquiryId]: value,
    }));
  }

  function handleReplySubmit(inquiryId) {
    const reply = String(replyInputs[inquiryId] || "").trim();

    setPageError("");
    setPageSuccess("");

    if (reply.length < 3) {
      setPageError("Reply should be at least 3 characters.");
      return;
    }

    setReplySavingId(inquiryId);

    fetch(apiUrl(`/api/inquiries/${inquiryId}/customer-reply`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ reply }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to send reply");
        }

        return data;
      })
      .then((updatedInquiry) => {
        setInquiries((currentInquiries) =>
          currentInquiries.map((inquiry) =>
            inquiry.id === updatedInquiry.id ? updatedInquiry : inquiry
          )
        );
        setReplyInputs((currentInputs) => ({
          ...currentInputs,
          [updatedInquiry.id]: "",
        }));
        setPageSuccess("Reply sent to vendor.");
        setReplySavingId(null);
      })
      .catch((error) => {
        console.error("Error sending customer reply:", error);
        setPageError(error.message);
        setReplySavingId(null);
      });
  }

  return (
    <section className="my-inquiries-page">
      <h1>My Inquiries</h1>
      <p>Track the inquiries you sent to vendors.</p>

      {loading && <p>Loading inquiries...</p>}

      {pageError && <p className="error-message">{pageError}</p>}
      {pageSuccess && <p className="success-message">{pageSuccess}</p>}

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
          <article className="inquiry-card chat-inquiry-card" key={inquiry.id}>
            <div className="chat-inquiry-header">
              <div>
                <h2>{inquiry.business_name}</h2>
                <p>{inquiry.location}</p>
              </div>
              <span className={`status-badge status-${inquiry.status}`}>
                {inquiry.status}
              </span>
            </div>

            <p className="chat-event-date">
              Event Date: {formatDate(inquiry.event_date)}
            </p>

            <div className="chat-thread">
              <div className="chat-bubble chat-bubble-customer">
                <span>You</span>
                <p>{inquiry.message}</p>
                <small>{messageStatusText(inquiry.status)}</small>
              </div>

              {inquiry.vendor_reply ? (
                <div className="chat-bubble chat-bubble-vendor">
                  <span>Vendor</span>
                  <p>{inquiry.vendor_reply}</p>
                  <small>Viewed</small>
                </div>
              ) : (
                <div className="chat-bubble chat-bubble-empty">
                  <span>Vendor</span>
                  <p>No reply yet.</p>
                  <small>Waiting</small>
                </div>
              )}

              {inquiry.customer_reply && (
                <div className="chat-bubble chat-bubble-customer">
                  <span>You replied</span>
                  <p>{inquiry.customer_reply}</p>
                  <small>Sent</small>
                </div>
              )}
            </div>

            {inquiry.vendor_reply && (
              <>
                <label className="reply-field">
                  Reply to vendor
                  <textarea
                    value={replyInputs[inquiry.id] || ""}
                    onChange={(event) =>
                      handleReplyChange(inquiry.id, event.target.value)
                    }
                    placeholder="Type your reply..."
                  />
                </label>

                <button
                  className="send-reply-button"
                  type="button"
                  disabled={replySavingId === inquiry.id}
                  onClick={() => handleReplySubmit(inquiry.id)}
                >
                  {replySavingId === inquiry.id ? "Sending..." : "Send Reply"}
                </button>
              </>
            )}

            <Link to={`/vendors/${inquiry.vendor_id}`}>View Vendor</Link>
          </article>
        ))}
      </section>
    </section>
  );
}

export default MyInquiries;
