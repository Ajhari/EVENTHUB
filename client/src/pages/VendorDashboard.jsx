import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function VendorDashboard() {
  const [vendorProfile, setVendorProfile] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [eventType, setEventType] = useState("");
  const [foodType, setFoodType] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [manualBookedDates, setManualBookedDates] = useState([]);
  const [inquiryBookedDates, setInquiryBookedDates] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilitySuccess, setAvailabilitySuccess] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [success, setSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBookedDates, setSavingBookedDates] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

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

  function toUppercaseText(value) {
    return value.toUpperCase();
  }

  function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function makeDateFromInput(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function handleAvailableDateChange(dateValue) {
    setAvailableDate(dateValue);
    setShowAvailabilityCalendar(true);

    if (dateValue) {
      setCalendarMonth(makeDateFromInput(dateValue));
    }
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
    if (!user || user.role !== "vendor") {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/vendors/user/${user.id}`)
      .then((response) => {
        if (response.status === 404) {
          return null;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch vendor profile");
        }

        return response.json();
      })
      .then((profile) => {
        if (!profile) {
          setLoading(false);
          return;
        }

        setVendorProfile(profile);
        setBusinessName(toUppercaseText(profile.business_name || ""));
        setLocation(toUppercaseText(profile.location || ""));
        setContactNumber(profile.contact_number || "");
        setDescription(toUppercaseText(profile.description || ""));
        setPriceRange(toUppercaseText(profile.price_range || ""));
        setFoodType(toUppercaseText(profile.food_type || ""));
        setEventType(toUppercaseText(profile.event_type || ""));
        setAvailableDate(toDateInputValue(profile.available_date));

        return Promise.all([
          fetch(`http://localhost:3001/api/inquiries/vendor/${profile.id}`),
          fetch(`http://localhost:3001/api/vendor-booked-dates/${profile.id}`),
        ]);
      })
      .then((responses) => {
        if (!responses) {
          return null;
        }

        const [inquiriesResponse, bookedDatesResponse] = responses;

        if (!inquiriesResponse.ok) {
          throw new Error("Failed to fetch inquiries");
        }

        if (!bookedDatesResponse.ok) {
          throw new Error("Failed to fetch booked dates");
        }

        return Promise.all([inquiriesResponse.json(), bookedDatesResponse.json()]);
      })
      .then((data) => {
        if (data) {
          const [inquiryData, bookedDateData] = data;
          setInquiries(inquiryData);
          setManualBookedDates(
            bookedDateData.manual_booked_dates.map((date) =>
              toDateInputValue(date)
            )
          );
          setInquiryBookedDates(
            bookedDateData.inquiry_booked_dates.map((date) =>
              toDateInputValue(date)
            )
          );
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading vendor dashboard:", error);
        setDashboardError("Could not load vendor dashboard.");
        setLoading(false);
      });
  }, [savedUser]);

  function handleProfileSubmit(event) {
    event.preventDefault();

    setProfileError("");
    setSuccess("");

    const digitsOnlyContact = contactNumber.replace(/\D/g, "");

    if (contactNumber && digitsOnlyContact.length < 10) {
      setProfileError("Contact number should have at least 10 digits.");
      return;
    }

    const profileData = {
      user_id: user.id,
      business_name: toUppercaseText(businessName),
      location: toUppercaseText(location),
      contact_number: contactNumber,
      description: toUppercaseText(description),
      price_range: toUppercaseText(priceRange),
      food_type: toUppercaseText(foodType),
      event_type: toUppercaseText(eventType),
      available_date: availableDate || null,
    };

    const url = vendorProfile
      ? `http://localhost:3001/api/vendors/${vendorProfile.id}`
      : "http://localhost:3001/api/vendors";

    const method = vendorProfile ? "PUT" : "POST";

    setSavingProfile(true);

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save vendor profile");
        }

        return data;
      })
      .then((profile) => {
        setVendorProfile(profile);
        setSuccess("Vendor profile saved successfully.");
        setSavingProfile(false);
      })
      .catch((error) => {
        console.error("Error saving vendor profile:", error);
        setProfileError(error.message);
        setSavingProfile(false);
      });
  }

  function clearProfileForm() {
    setVendorProfile(null);
    setBusinessName("");
    setLocation("");
    setContactNumber("");
    setDescription("");
    setPriceRange("");
    setInquiries([]);
    setEventType("");
    setFoodType("");
    setAvailableDate("");
    setManualBookedDates([]);
    setInquiryBookedDates([]);
    setCalendarMonth(new Date());
    setShowAvailabilityCalendar(false);
    setStatusFilter("all");
    setShowDeleteConfirm(false);
  }

  function handleDeleteProfile() {
    if (!vendorProfile) {
      return;
    }

    setProfileError("");
    setSuccess("");
    setDeletingProfile(true);

    fetch(`http://localhost:3001/api/vendors/${vendorProfile.id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete vendor profile");
        }

        return data;
      })
      .then(() => {
        clearProfileForm();
        setSuccess("Your vendor profile was deleted. You can create a new profile anytime.");
        setDeletingProfile(false);
      })
      .catch((error) => {
        console.error("Error deleting vendor profile:", error);
        setProfileError(error.message);
        setDeletingProfile(false);
      });
  }

  if (!user) {
    return (
      <section>
        <p>Please login to view vendor dashboard.</p>
        <Link className="action-link" to="/login">Go to Login</Link>
      </section>
    );
  }

  if (user.role !== "vendor") {
    return <p>Only vendors can view this dashboard.</p>;
  }

  function handleStatusChange(inquiryId, status) {
    setStatusError("");
    setStatusSuccess("");

    fetch(`http://localhost:3001/api/inquiries/${inquiryId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update status");
        }

        return response.json();
      })
      .then((updatedInquiry) => {
        setInquiries((currentInquiries) =>
          currentInquiries.map((inquiry) =>
            inquiry.id === updatedInquiry.id ? updatedInquiry : inquiry
          )
        );
        setStatusSuccess("Inquiry status updated.");
      })
      .catch((error) => {
        console.error("Error updating inquiry status:", error);
        setStatusError("Could not update inquiry status.");
      });
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (statusFilter === "all") {
      return true;
    }

    return inquiry.status === statusFilter;
  });

  const bookedDateSet = new Set([...manualBookedDates, ...inquiryBookedDates]);
  const inquiryBookedDateSet = new Set(inquiryBookedDates);
  const calendarDays = getCalendarDays();
  const calendarTitle = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  function handleBookedDateToggle(dateValue) {
    setAvailabilityError("");
    setAvailabilitySuccess("");

    if (!vendorProfile) {
      setAvailabilityError("Create your profile first, then mark booked dates.");
      return;
    }

    if (inquiryBookedDateSet.has(dateValue)) {
      setAvailabilityError("Customer inquiry dates cannot be unbooked from here.");
      return;
    }

    setManualBookedDates((currentDates) => {
      if (currentDates.includes(dateValue)) {
        return currentDates.filter((date) => date !== dateValue);
      }

      return [...currentDates, dateValue].sort();
    });
  }

  function handleBookedDatesSubmit(event) {
    event.preventDefault();

    if (!vendorProfile) {
      setAvailabilityError("Create your profile first, then save booked dates.");
      return;
    }

    setAvailabilityError("");
    setAvailabilitySuccess("");
    setSavingBookedDates(true);

    fetch(`http://localhost:3001/api/vendor-booked-dates/${vendorProfile.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booked_dates: manualBookedDates,
      }),
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save booked dates");
        }

        return data;
      })
      .then((data) => {
        const savedDates = data.manual_booked_dates.map((date) =>
          toDateInputValue(date)
        );

        setManualBookedDates(savedDates);
        setAvailabilitySuccess(data.message);
        setSavingBookedDates(false);
      })
      .catch((error) => {
        console.error("Error saving booked dates:", error);
        setAvailabilityError(error.message);
        setSavingBookedDates(false);
      });
  }

  return (
    <section>
      <h1>Vendor Dashboard</h1>
      <p>Create or update your vendor profile.</p>

      {loading && <p>Loading dashboard...</p>}

      {dashboardError && <p className="error-message">{dashboardError}</p>}
      {success && <p className="success-message">{success}</p>}

      {!loading && (
        <>
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <label>
              Business Name
              <input
                type="text"
                value={businessName}
                onChange={(event) =>
                  setBusinessName(toUppercaseText(event.target.value))
                }
                required
              />
            </label>

            <label>
              Location
              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(toUppercaseText(event.target.value))
                }
                required
              />
            </label>

            <label>
              Contact Number
              <input
                type="text"
                value={contactNumber}
                onChange={(event) => setContactNumber(event.target.value)}
              />
            </label>

            <label>
              Price Range
              <input
                type="text"
                value={priceRange}
                onChange={(event) =>
                  setPriceRange(toUppercaseText(event.target.value))
                }
              />
            </label>

            <label>
              Food Type
              <select
                value={foodType}
                onChange={(event) => setFoodType(event.target.value)}
              >
                <option value="">SELECT FOOD TYPE</option>
                <option value="VEG">VEG</option>
                <option value="NON-VEG">NON-VEG</option>
                <option value="VEG AND NON-VEG">VEG AND NON-VEG</option>
                <option value="VEGAN">VEGAN</option>
                <option value="JAIN FOOD">JAIN FOOD</option>
                <option value="SOUTH INDIAN">SOUTH INDIAN</option>
                <option value="NORTH INDIAN">NORTH INDIAN</option>
                <option value="CHINESE">CHINESE</option>
                <option value="CONTINENTAL">CONTINENTAL</option>
                <option value="SNACKS AND SWEETS">SNACKS AND SWEETS</option>
                <option value="CUSTOM MENU">CUSTOM MENU</option>
              </select>
            </label>

            <label>
              Event Type
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
              >
                <option value="">SELECT EVENT TYPE</option>
                <option value="WEDDING">WEDDING</option>
                <option value="RECEPTION">RECEPTION</option>
                <option value="ENGAGEMENT">ENGAGEMENT</option>
                <option value="BIRTHDAY">BIRTHDAY</option>
                <option value="EAR PIERCING">EAR PIERCING</option>
                <option value="BABY SHOWER">BABY SHOWER</option>
                <option value="NAMING CEREMONY">NAMING CEREMONY</option>
                <option value="HOUSE WARMING">HOUSE WARMING</option>
                <option value="CORPORATE EVENT">CORPORATE EVENT</option>
                <option value="COLLEGE EVENT">COLLEGE EVENT</option>
                <option value="FAMILY FUNCTION">FAMILY FUNCTION</option>
                <option value="TEMPLE FUNCTION">TEMPLE FUNCTION</option>
                <option value="CUSTOM EVENT">CUSTOM EVENT</option>
              </select>
            </label>

            <label>
              Available Date
              <input
                type="date"
                value={availableDate}
                onChange={(event) => handleAvailableDateChange(event.target.value)}
                onClick={() => setShowAvailabilityCalendar(true)}
                onFocus={() => setShowAvailabilityCalendar(true)}
              />
            </label>

            {showAvailabilityCalendar && (
              <section className="availability-calendar">
                <div className="availability-calendar-header">
                  <h3>{calendarTitle}</h3>
                  <p>
                    Green dates are available. Click booked dates to turn them
                    red. Customer date filter will hide red booked vendors.
                  </p>
                </div>

                <div className="calendar-month-controls">
                  <button type="button" onClick={() => changeCalendarMonth(-1)}>
                    Previous
                  </button>
                  <strong>{calendarTitle}</strong>
                  <button type="button" onClick={() => changeCalendarMonth(1)}>
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
                    const classNames = [
                      "calendar-day",
                      isBooked ? "calendar-day-booked" : "calendar-day-available",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        className={classNames}
                        type="button"
                        key={dateValue}
                        onClick={() => handleBookedDateToggle(dateValue)}
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

                <button
                  type="button"
                  disabled={savingBookedDates}
                  onClick={handleBookedDatesSubmit}
                >
                  {savingBookedDates ? "Saving..." : "Save Booked Dates"}
                </button>

                {availabilityError && (
                  <p className="error-message">{availabilityError}</p>
                )}
                {availabilitySuccess && (
                  <p className="success-message">{availabilitySuccess}</p>
                )}
              </section>
            )}

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(toUppercaseText(event.target.value))
                }
              />
            </label>

            <button type="submit" disabled={savingProfile}>
              {savingProfile
                ? "Saving..."
                : vendorProfile
                  ? "Update Profile"
                  : "Create Profile"}
            </button>

            {vendorProfile && (
              <button
                className="delete-profile-button"
                type="button"
                disabled={deletingProfile}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Profile
              </button>
            )}

            {showDeleteConfirm && (
              <section className="delete-confirm-box">
                <h3>Delete vendor profile?</h3>
                <p>
                  This will remove your vendor profile and its received
                  inquiries.
                </p>
                <div className="delete-confirm-actions">
                  <button
                    className="cancel-delete-button"
                    type="button"
                    disabled={deletingProfile}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-delete-button"
                    type="button"
                    disabled={deletingProfile}
                    onClick={handleDeleteProfile}
                  >
                    {deletingProfile ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </section>
            )}

            {profileError && <p className="error-message">{profileError}</p>}
          </form>

          <h2>Received Customer Inquiries</h2>

          {statusError && <p className="error-message">{statusError}</p>}
          {statusSuccess && <p className="success-message">{statusSuccess}</p>}

          {vendorProfile && inquiries.length > 0 && (
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

          {vendorProfile && inquiries.length > 0 && (
            <p className="result-count">
              Showing {filteredInquiries.length} of {inquiries.length} inquiries
              {statusFilter !== "all" ? ` for "${statusFilter}"` : ""}
            </p>
          )}

          {!vendorProfile && <p>Create your profile to receive inquiries.</p>}

          {vendorProfile && inquiries.length === 0 && (
            <p>No inquiries received yet.</p>
          )}

          {vendorProfile && inquiries.length > 0 && filteredInquiries.length === 0 && (
            <p>No inquiries match this status.</p>
          )}

          <section className="inquiry-list">
            {filteredInquiries.map((inquiry) => (
              <article className="inquiry-card" key={inquiry.id}>
                <h2>{inquiry.customer_name}</h2>
                <p>
                  <strong>Email:</strong> {inquiry.customer_email}
                </p>
                <p>
                  <strong>Event Date:</strong> {inquiry.event_date}
                </p>
                <p>
                  <strong>Message:</strong> {inquiry.message}
                </p>
                <label className="status-field">
                  Status
                <select
                  value={inquiry.status}
                  onChange={(event) => handleStatusChange(inquiry.id, event.target.value)}
                >
                  <option value="new">New</option>
                  <option value="viewed">Viewed</option>
                  <option value="replied">Replied</option>
                </select>
              </label>
              </article>
            ))}
          </section>
        </>
      )}
    </section>
  );
}

export default VendorDashboard;
