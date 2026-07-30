import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiUrl, assetUrl } from "../utils/auth";

const vendorImages = {
  1: "/images/vendor-chennai-v2.jpg",
  2: "/images/vendor-madurai-v2.jpg",
  3: "/images/vendor-kovai-v2.jpg",
  4: "/images/vendor-trichy-v2.jpg",
  5: "/images/vendor-salem-v2.jpg",
  6: "/images/vendor-nellai-v2.jpg",
};

function resolveImagePath(imagePath) {
  return assetUrl(imagePath);
}

function DetailIcon({ name }) {
  const paths = {
    arrow: <><path d="M19 12H5M11 18l-6-6 6-6" /></>,
    calendar: <><path d="M5 4v3M19 4v3M4 9h16" /><rect x="4" y="6" width="16" height="14" rx="2" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-4-1-1.2 2a15.7 15.7 0 0 1-9.8-9.8L8 7 7 3Z" />,
    shield: <path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4" />,
    sparkle: <><path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" /><path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" /></>,
  };
  return <svg className="vendor-detail-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

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
      fetch(apiUrl(`/api/vendors/${id}`)),
      fetch(apiUrl(`/api/vendor-availability/${id}`)),
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

    fetch(apiUrl("/api/inquiries"), {
      method: "POST",
      credentials: "include",
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
    return <div className="vendor-profile-loading" aria-busy="true"><span /><i /><i /></div>;
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

  const heroImage = resolveImagePath(vendor.image_url) || vendorImages[vendor.id] || "/images/eventhub-hero.png";

  return (
    <section className="vendor-profile-page">
      <Link className="vendor-profile-back" to="/vendors"><DetailIcon name="arrow" /> Back to all vendors</Link>

      <header className="vendor-profile-hero">
        <img src={heroImage} alt={`${vendor.business_name} event setup`} width="1536" height="1024" fetchPriority="high" />
        <div className="vendor-profile-scrim" aria-hidden="true" />
        <div className="vendor-profile-hero-content">
          <p className="vendor-profile-verified"><DetailIcon name="shield" /> EventHub verified professional</p>
          <h1>{vendor.business_name}</h1>
          <p className="vendor-profile-location"><DetailIcon name="map" /> {vendor.location}</p>
          <div className="vendor-profile-hero-tags">
            <span>{vendor.event_type || "Custom events"}</span>
            <span>{vendor.food_type || "Flexible catering"}</span>
          </div>
        </div>
      </header>

      <div className="vendor-profile-layout">
        <main className="vendor-profile-main">
          <section className="vendor-profile-overview">
            <p className="section-eyebrow">About this team</p>
            <h2>Celebrations planned with care.</h2>
            <p>{vendor.description || `${vendor.business_name} provides professional event services across ${vendor.location}.`}</p>
          </section>

          <div className="vendor-profile-facts">
            <article><DetailIcon name="sparkle" /><span>Speciality</span><strong>{vendor.event_type || "Custom events"}</strong></article>
            <article><DetailIcon name="map" /><span>Service area</span><strong>{vendor.location}</strong></article>
            <article><DetailIcon name="calendar" /><span>Next availability</span><strong>{vendor.available_date ? new Date(vendor.available_date).toLocaleDateString("en-IN") : "Ask vendor"}</strong></article>
            <article><DetailIcon name="phone" /><span>Direct contact</span><strong>{vendor.contact_number || "On request"}</strong></article>
          </div>

          <section className="vendor-profile-price">
            <div><p className="section-eyebrow">Typical investment</p><h2>{vendor.price_range || "Request a custom quote"}</h2></div>
            <p>Final pricing depends on your date, guest count, venue, and selected services.</p>
          </section>
        </main>

        <aside className="vendor-booking-panel" aria-labelledby="inquiry-title">
          <form className="inquiry-form vendor-profile-inquiry" onSubmit={handleInquirySubmit}>
            <div className="vendor-inquiry-heading">
              <p className="section-eyebrow">Check availability</p>
              <h2 id="inquiry-title">Start your inquiry</h2>
              <p>Choose an open date and tell the team what you are planning.</p>
            </div>

          <section className="availability-calendar customer-calendar">
            <div className="availability-calendar-header">
              <h3>Select event date</h3>
              <p>Available dates can be selected. Booked dates are unavailable.</p>
            </div>

            <div className="calendar-month-controls">
              <button
                className="calendar-nav-button"
                type="button"
                onClick={() => changeCalendarMonth(-1)}
                aria-label="Show previous month"
              >
                <DetailIcon name="arrow" />
              </button>
              <strong>{calendarTitle}</strong>
              <button
                className="calendar-nav-button"
                type="button"
                onClick={() => changeCalendarMonth(1)}
                aria-label="Show next month"
              >
                <span className="calendar-next-icon"><DetailIcon name="arrow" /></span>
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
                    aria-label={`Select ${date.toLocaleDateString("en-IN")}`}
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
            Tell us about your event
            <textarea
              placeholder="Event type, venue, guest count, and the services you need..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
           />
         </label>

         <button type="submit" disabled={submitting}>
           {submitting ? "Sending inquiry..." : "Send inquiry"}
         </button>

         {success && <p className="success-message">{success}</p>}
         {formError && <p className="error-message">{formError}</p>}
          </form>
          <p className="vendor-booking-note"><DetailIcon name="shield" /> Your inquiry is sent securely through EventHub.</p>
        </aside>
      </div>
    </section>
  );
}

export default VendorDetail;
