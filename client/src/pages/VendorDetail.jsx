import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function VendorDetail() {
  const { id } = useParams();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const savedUser = localStorage.getItem("eventhubUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  function toDateInputValue(dateValue) {
    if (!dateValue) {
      return "";
    }

    if (typeof dateValue === "string") {
      return dateValue.split("T")[0];
    }

    return new Date(dateValue).toISOString().split("T")[0];
  }

  function makeDateFromInput(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getCalendarDays() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function changeCalendarMonth(direction) {
    setCalendarMonth((currentMonth) => {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + direction);
      return nextMonth;
    });
  }

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:3001/api/vendors/${id}`),
      fetch(`http://localhost:3001/api/vendor-availability/${id}`),
    ])
      .then(async ([vendorResponse, availabilityResponse]) => {
        if (!vendorResponse.ok) {
          throw new Error("Failed to fetch vendor");
        }

        if (!availabilityResponse.ok) {
          throw new Error("Failed to fetch availability");
        }

        const vendorData = await vendorResponse.json();
        const availabilityData = await availabilityResponse.json();

        return { vendorData, availabilityData };
      })
      .then(({ vendorData, availabilityData }) => {
        setVendor(vendorData);
        setBookedDates(
          availabilityData.booked_dates.map((date) => toDateInputValue(date))
        );

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching vendor:", error);
        setPageError("Could not load vendor details.");
        setLoading(false);
      });
  }, [id]);

  function handleInquirySubmit(event) {
    event.preventDefault();
    setSuccess("");
    setFormError("");

    if (!user) {
      setFormError("Please login before sending inquiry.");
      return;
    }

    if (user.role !== "customer") {
      setFormError("Only customers can send inquiries.");
      return;
    }

    if (message.trim().length < 10) {
      setFormError("Message should be at least 10 characters.");
      return;
    }

    if (!eventDate) {
      setFormError("Please select an available event date.");
      return;
    }

    if (bookedDates.includes(eventDate)) {
      setFormError("Please select a non-booked available date.");
      return;
    }

    setSubmitting(true);

    fetch("http://localhost:3001/api/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: user.id,
        vendor_id: Number(id),
        event_date: eventDate,
        message: message,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to send inquiry");
        }

        return data;
      })
      .then(() => {
        setSuccess("Inquiry sent successfully.");
        setBookedDates((currentDates) => [...currentDates, eventDate]);
        setEventDate("");
        setMessage("");
        setSubmitting(false);
      })
      .catch((error) => {
        console.error("Error sending inquiry:", error);
        setFormError(error.message);
        setSubmitting(false);
      });
  }

  if (loading) {
    return <p>Loading vendor details...</p>;
  }

  if (pageError) {
    return <p className="error-message">{pageError}</p>;
  }

  if (!vendor) {
    return <p>Vendor not found.</p>;
  }

  const bookedDateSet = new Set(bookedDates);
  const calendarDays = getCalendarDays();
  const calendarTitle = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <section>
      <Link className="back-link" to="/vendors">
        Back to vendors
      </Link>

      <div className="vendor-detail">
        <h1>{vendor.business_name}</h1>
        <p>
          <strong>Location:</strong> {vendor.location}
        </p>
        <p>
          <strong>Contact:</strong> {vendor.contact_number}
        </p>
        <p>
          <strong>Price Range:</strong> {vendor.price_range}
        </p>
        <p>
          <strong>Food Type:</strong> {vendor.food_type || "Not added"}
        </p>
        <p>
          <strong>Event Type:</strong> {vendor.event_type || "Not added"}
        </p>
        <p>
          <strong>Available Date:</strong>{" "}
          {vendor.available_date
            ? new Date(vendor.available_date).toLocaleDateString("en-IN")
            : "Not added"}
        </p>
        <p>
          <strong>Description:</strong> {vendor.description}
        </p>
        <form className="inquiry-form" onSubmit={handleInquirySubmit}>
          <h2>Send Inquiry</h2>

          <section className="availability-calendar customer-calendar">
            <div className="availability-calendar-header">
              <h3>Select Event Date</h3>
              <p>
                Green dates are available. Red dates are already booked and
                cannot be selected.
              </p>
            </div>

            <div className="calendar-month-controls">
              <button
                type="button"
                onClick={() => changeCalendarMonth(-1)}
              >
                Previous
              </button>
              <strong>{calendarTitle}</strong>
              <button
                type="button"
                onClick={() => changeCalendarMonth(1)}
              >
                Next
              </button>
            </div>

            <div className="availability-weekdays">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="availability-calendar-grid">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <span
                      className="calendar-day calendar-day-empty"
                      key={`empty-${index}`}
                    />
                  );
                }

                const dateValue = formatDateInput(date);
                const isBooked = bookedDateSet.has(dateValue);

                if (isBooked) {
                  return (
                    <button
                      className="calendar-day calendar-day-booked"
                      type="button"
                      key={dateValue}
                      disabled
                      aria-label={`${dateValue} is booked`}
                    >
                      {date.getDate()}
                    </button>
                  );
                }

                return (
                  <button
                    className={
                      eventDate === dateValue
                        ? "calendar-day calendar-day-selected"
                        : "calendar-day calendar-day-available"
                    }
                    type="button"
                    key={dateValue}
                    onClick={() => setEventDate(dateValue)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span className="legend-available">Available</span>
              <span className="legend-booked">Booked</span>
              <span className="legend-saved">Saved</span>
            </div>

            {eventDate && (
              <p className="selected-date-message">
                Selected date: {makeDateFromInput(eventDate).toLocaleDateString("en-IN")}
              </p>
            )}

          </section>

          <label>
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
           />
         </label>

         <button type="submit" disabled={submitting}>
           {submitting ? "Sending..." : "Send Inquiry"}
         </button>

         {success && <p className="success-message">{success}</p>}
         {formError && <p className="error-message">{formError}</p>}
       </form>
      </div>
    </section>
  );
}

export default VendorDetail;
