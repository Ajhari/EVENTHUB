import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const tamilNaduDistricts = [
  "Ariyalur",
  "Chengalpattu",
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kallakurichi",
  "Kancheepuram",
  "Kanniyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Mayiladuthurai",
  "Nagapattinam",
  "Namakkal",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Ranipet",
  "Salem",
  "Sivaganga",
  "Tenkasi",
  "Thanjavur",
  "Theni",
  "Thiruvallur",
  "Thiruvarur",
  "Thoothukudi",
  "Tiruchirappalli",
  "Tirunelveli",
  "Tirupathur",
  "Tiruppur",
  "Tiruvannamalai",
  "The Nilgiris",
  "Vellore",
  "Villupuram",
  "Virudhunagar",
];

const districtOptions = [
  { label: "ALL DISTRICTS", value: "" },
  ...tamilNaduDistricts.map((district) => ({
    label: district.toUpperCase(),
    value: district.toUpperCase(),
  })),
];

const foodTypeOptions = [
  { label: "ALL FOOD TYPES", value: "" },
  { label: "VEG", value: "VEG" },
  { label: "NON-VEG", value: "NON-VEG" },
  { label: "VEG AND NON-VEG", value: "VEG AND NON-VEG" },
  { label: "VEGAN", value: "VEGAN" },
  { label: "JAIN FOOD", value: "JAIN FOOD" },
  { label: "SOUTH INDIAN", value: "SOUTH INDIAN" },
  { label: "NORTH INDIAN", value: "NORTH INDIAN" },
  { label: "CHINESE", value: "CHINESE" },
  { label: "CONTINENTAL", value: "CONTINENTAL" },
  { label: "SNACKS AND SWEETS", value: "SNACKS AND SWEETS" },
  { label: "CUSTOM MENU", value: "CUSTOM MENU" },
];

const eventTypeOptions = [
  { label: "ALL EVENT TYPES", value: "" },
  { label: "WEDDING", value: "WEDDING" },
  { label: "RECEPTION", value: "RECEPTION" },
  { label: "ENGAGEMENT", value: "ENGAGEMENT" },
  { label: "BIRTHDAY", value: "BIRTHDAY" },
  { label: "EAR PIERCING", value: "EAR PIERCING" },
  { label: "BABY SHOWER", value: "BABY SHOWER" },
  { label: "NAMING CEREMONY", value: "NAMING CEREMONY" },
  { label: "HOUSE WARMING", value: "HOUSE WARMING" },
  { label: "CORPORATE EVENT", value: "CORPORATE EVENT" },
  { label: "COLLEGE EVENT", value: "COLLEGE EVENT" },
  { label: "FAMILY FUNCTION", value: "FAMILY FUNCTION" },
  { label: "TEMPLE FUNCTION", value: "TEMPLE FUNCTION" },
  { label: "CUSTOM EVENT", value: "CUSTOM EVENT" },
];

const vendorImages = [
  "/images/vendor-wedding.png",
  "/images/vendor-corporate.png",
  "/images/vendor-family.png",
];

function FilterDropdown({ label, options, value, isOpen, onToggle, onChange }) {
  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  return (
    <div className="custom-filter">
      <button
        className="custom-filter-button"
        type="button"
        aria-expanded={isOpen}
        aria-label={label}
        onClick={onToggle}
      >
        <span>{selectedOption.label}</span>
        <svg className="filter-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
      </button>

      {isOpen && (
        <div className="custom-filter-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              className={
                option.value === value
                  ? "custom-filter-option custom-filter-option-active"
                  : "custom-filter-option"
              }
              type="button"
              key={option.label}
              role="option"
              aria-selected={option.value === value}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [foodTypeFilter, setFoodTypeFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [availableDateFilter, setAvailableDateFilter] = useState("");
  const [openFilter, setOpenFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const queryParams = new URLSearchParams();

    if (locationFilter) {
      queryParams.set("location", locationFilter);
    }

    if (foodTypeFilter) {
      queryParams.set("foodType", foodTypeFilter);
    }

    if (eventTypeFilter) {
      queryParams.set("eventType", eventTypeFilter);
    }

    if (availableDateFilter) {
      queryParams.set("availableDate", availableDateFilter);
    }

    const url = `http://localhost:3001/api/vendors?${queryParams.toString()}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }

        return response.json();
      })
      .then((data) => {
        setVendors(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching vendors:", error);
        setError("Could not load vendors. Please try again.");
        setLoading(false);
      });
  }, [locationFilter, foodTypeFilter, eventTypeFilter, availableDateFilter]);

  const hasActiveFilter =
    locationFilter || foodTypeFilter || eventTypeFilter || availableDateFilter;

  function clearAllFilters() {
    setLocationFilter("");
    setFoodTypeFilter("");
    setEventTypeFilter("");
    setAvailableDateFilter("");
    setOpenFilter("");
  }

  function handleDropdownChange(setFilter, value) {
    setFilter(value);
    setOpenFilter("");
  }

  return (
    <section>
      <header className="directory-page-header">
        <span className="section-eyebrow">EventHub directory</span>
        <h1>Find professionals for your celebration.</h1>
        <p>Explore trusted event teams and narrow the results to exactly what you need.</p>
      </header>

      <div className="directory-heading" id="vendor-filters">
        <div>
          <span className="section-eyebrow">Handpicked for every celebration</span>
          <h2>Find your event team</h2>
        </div>
        <p>Filter by location, cuisine, occasion, or availability.</p>
      </div>

      <section className="filter-controls" aria-label="Vendor filters">
        <FilterDropdown
          label="Filter vendors by district"
          options={districtOptions}
          value={locationFilter}
          isOpen={openFilter === "district"}
          onToggle={() =>
            setOpenFilter(openFilter === "district" ? "" : "district")
          }
          onChange={(value) => handleDropdownChange(setLocationFilter, value)}
        />

        <FilterDropdown
          label="Filter vendors by food type"
          options={foodTypeOptions}
          value={foodTypeFilter}
          isOpen={openFilter === "food"}
          onToggle={() => setOpenFilter(openFilter === "food" ? "" : "food")}
          onChange={(value) => handleDropdownChange(setFoodTypeFilter, value)}
        />

        <FilterDropdown
          label="Filter vendors by event type"
          options={eventTypeOptions}
          value={eventTypeFilter}
          isOpen={openFilter === "event"}
          onToggle={() => setOpenFilter(openFilter === "event" ? "" : "event")}
          onChange={(value) => handleDropdownChange(setEventTypeFilter, value)}
        />

        <label className="date-filter-label">
          <span className="sr-only">Available date</span>
          <input
            className="date-filter-input"
            type="date"
            aria-label="Filter vendors by available date"
            value={availableDateFilter}
            onChange={(event) => setAvailableDateFilter(event.target.value)}
          />
        </label>
      </section>

      {hasActiveFilter && (
        <button
          className="clear-filter-button"
          type="button"
          onClick={clearAllFilters}
        >
          Clear Filters
        </button>
      )}

      {!loading && !error && vendors.length > 0 && (
        <p className="result-count" aria-live="polite">
          Showing {vendors.length} {vendors.length === 1 ? "vendor" : "vendors"}
          {hasActiveFilter ? " for selected filters" : ""}
        </p>
      )}

      {loading && <p>Loading vendors...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && !hasActiveFilter && vendors.length === 0 && (
        <p>No vendors available yet.</p>
      )}

      {!loading && !error && hasActiveFilter && vendors.length === 0 && (
        <p>No vendors found for selected filters.</p>
      )}

      {!loading && !error && (
        <section className="vendor-list">
          {vendors.map((vendor) => (
            <Link
              className="vendor-card"
              key={vendor.id}
              to={`/vendors/${vendor.id}`}
            >
              <div className="vendor-card-top">
                <span className="vendor-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img">
                    <path d="M4 10.4V4a1 1 0 0 1 1-1h5V1h4v2h5a1 1 0 0 1 1 1v6.4l1.086.326a1 1 0 0 1 .682 1.2l-1.516 6.068A4.992 4.992 0 0 1 16 16a4.992 4.992 0 0 1-4 2 4.992 4.992 0 0 1-4-2 4.992 4.992 0 0 1-4.252 1.994l-1.516-6.068a1 1 0 0 1 .682-1.2L4 10.4Zm2-.6L12 8l6 1.8V5H6v4.8ZM4 20a5.978 5.978 0 0 0 4-1.528A5.978 5.978 0 0 0 12 20a5.978 5.978 0 0 0 4-1.528A5.978 5.978 0 0 0 20 20h2v2h-2a7.963 7.963 0 0 1-4-1.07A7.963 7.963 0 0 1 12 22a7.963 7.963 0 0 1-4-1.07A7.963 7.963 0 0 1 4 22H2v-2h2Z" />
                  </svg>
                </span>
                <span className="vendor-card-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </span>
              </div>

              <div className="vendor-card-visual">
                <img
                  src={vendorImages[(vendor.id - 1) % vendorImages.length]}
                  alt={`${vendor.business_name} event setup`}
                  width="1536"
                  height="1024"
                  loading="lazy"
                />
                <span className="vendor-image-shade" aria-hidden="true" />
              </div>

              <h2>{vendor.business_name}</h2>

              <div className="vendor-card-details">
                <p>
                  <strong>Location</strong>
                  <span>{vendor.location}</span>
                </p>
                <p>
                  <strong>Contact</strong>
                  <span>{vendor.contact_number || "Not added"}</span>
                </p>
                <p>
                  <strong>Price Range</strong>
                  <span>{vendor.price_range || "Not added"}</span>
                </p>
                <p>
                  <strong>Food Type</strong>
                  <span>{vendor.food_type || "Not added"}</span>
                </p>
                <p>
                  <strong>Event Type</strong>
                  <span>{vendor.event_type || "Not added"}</span>
                </p>
                <p>
                  <strong>Available Date</strong>
                  <span>
                    {vendor.available_date
                      ? new Date(vendor.available_date).toLocaleDateString("en-IN")
                      : "Not added"}
                  </span>
                </p>
              </div>

              {vendor.description && (
                <p className="vendor-description">{vendor.description}</p>
              )}

              <div className="vendor-card-footer">
                <span className="vendor-tag">Available</span>
                <span className="vendor-card-link">View details</span>
              </div>
            </Link>
          ))}
        </section>
      )}
    </section>
  );
}

export default VendorList;
