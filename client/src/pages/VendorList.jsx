import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authOptions } from "../utils/auth";

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

const vendorImages = {
  1: "/images/vendor-chennai-v2.jpg",
  2: "/images/vendor-madurai-v2.jpg",
  3: "/images/vendor-kovai-v2.jpg",
  4: "/images/vendor-trichy-v2.jpg",
  5: "/images/vendor-salem-v2.jpg",
  6: "/images/vendor-nellai-v2.jpg",
};

function titleCase(value) {
  if (!value) return value;
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveImagePath(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("/uploads")) return `http://localhost:3001${imagePath}`;
  return imagePath;
}

function imageForVendor(vendor) {
  return resolveImagePath(vendor.image_url) || vendorImages[vendor.id] || "/images/eventhub-hero.png";
}

function CardIcon({ name }) {
  const paths = {
    arrow: <><path d="M7 17 17 7" /><path d="M7 7h10v10" /></>,
    calendar: <><path d="M5 4v3M19 4v3M4 9h16" /><rect x="4" y="6" width="16" height="14" rx="2" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    service: <><path d="M12 3v18M5.5 6.5h10a3.5 3.5 0 0 1 0 7h-7a3.5 3.5 0 0 0 0 7h10" /></>,
  };

  return <svg className="vendor-inline-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function VendorCard({ vendor, isFavorite, isSavingFavorite, onFavoriteToggle }) {
  const eventType = titleCase(vendor.event_type) || "Custom Events";
  const availableDate = vendor.available_date
    ? new Date(vendor.available_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Contact for availability";

  return (
    <Link className="vendor-card vendor-destination-card" to={`/vendors/${vendor.id}`}>
      <div className="vendor-destination-image-wrap">
        <img
          className="vendor-destination-image"
          src={imageForVendor(vendor)}
          alt={`${titleCase(vendor.business_name)} event setup`}
          loading="lazy"
          sizes="(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 34vw"
          width="1536"
          height="1024"
        />
        <span className="vendor-service-badge"><CardIcon name="calendar" /> {eventType}</span>
        <span className="vendor-destination-arrow"><CardIcon name="arrow" /></span>
      </div>

      <div className="vendor-destination-content">
        <button
          className={isFavorite ? "card-save-button card-save-button-active" : "card-save-button"}
          type="button"
          disabled={isSavingFavorite}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onFavoriteToggle(vendor.id);
          }}
        >
          {isSavingFavorite ? "Saving..." : isFavorite ? "Saved" : "Save"}
        </button>

        <div className="vendor-destination-meta">
          <span>EventHub verified</span>
          <span>{titleCase(vendor.food_type) || "Flexible catering"}</span>
        </div>
        <h2>{titleCase(vendor.business_name)}</h2>
        <p className="vendor-destination-location"><CardIcon name="map" /> Serving · {titleCase(vendor.location)}</p>
        <p className="vendor-destination-description">
          {vendor.description ? titleCase(vendor.description) : `Professional support for ${eventType.toLowerCase()} in ${titleCase(vendor.location)}.`}
        </p>

        <div className="vendor-service-estimate">
          <span><CardIcon name="service" /> {eventType}</span>
          <strong>{vendor.price_range || "Custom quote"}</strong>
          <small>{availableDate} · {vendor.contact_number || "Contact details available"}</small>
        </div>
      </div>
    </Link>
  );
}

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
  const [favoriteVendorIds, setFavoriteVendorIds] = useState([]);
  const [savingFavoriteId, setSavingFavoriteId] = useState(null);
  const [favoriteError, setFavoriteError] = useState("");
  const savedUser = localStorage.getItem("eventhubUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

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

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setFavoriteVendorIds([]);
      return;
    }

    fetch(`http://localhost:3001/api/favorites/${user.id}`, authOptions())
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        return response.json();
      })
      .then((data) => {
        setFavoriteVendorIds(data.map((vendor) => vendor.id));
      })
      .catch((error) => {
        console.error("Error fetching favorites:", error);
      });
  }, [savedUser]);

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

  function handleFavoriteToggle(vendorId) {
    setFavoriteError("");

    if (!user) {
      setFavoriteError("Please login as customer to save vendors.");
      return;
    }

    if (user.role !== "customer") {
      setFavoriteError("Only customers can save favorite vendors.");
      return;
    }

    const isFavorite = favoriteVendorIds.includes(vendorId);
    const url = isFavorite
      ? `http://localhost:3001/api/favorites/${user.id}/${vendorId}`
      : "http://localhost:3001/api/favorites";

    const requestOptions = isFavorite
      ? {
          method: "DELETE",
          credentials: "include",
        }
      : {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: user.id,
            vendor_id: vendorId,
          }),
        };

    setSavingFavoriteId(vendorId);

    fetch(url, requestOptions)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update favorite");
        }

        return data;
      })
      .then(() => {
        setFavoriteVendorIds((currentIds) => {
          if (isFavorite) {
            return currentIds.filter((id) => id !== vendorId);
          }

          return [...currentIds, vendorId];
        });
        setSavingFavoriteId(null);
      })
      .catch((error) => {
        console.error("Error updating favorite:", error);
        setFavoriteError(error.message);
        setSavingFavoriteId(null);
      });
  }

  return (
    <section className="vendor-directory-page">
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

      {loading && (
        <div className="vendor-list vendor-skeleton-list" aria-label="Loading vendors" aria-busy="true">
          {[1, 2, 3].map((item) => <div className="vendor-skeleton" key={item}><span /><i /><i /><i /></div>)}
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
      {favoriteError && <p className="error-message">{favoriteError}</p>}

      {!loading && !error && !hasActiveFilter && vendors.length === 0 && (
        <p>No vendors available yet.</p>
      )}

      {!loading && !error && hasActiveFilter && vendors.length === 0 && (
        <p>No vendors found for selected filters.</p>
      )}

      {!loading && !error && (
        <section className="vendor-list">
          {vendors.map((vendor) => (
            <VendorCard
              vendor={vendor}
              key={vendor.id}
              isFavorite={favoriteVendorIds.includes(vendor.id)}
              isSavingFavorite={savingFavoriteId === vendor.id}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </section>
      )}
    </section>
  );
}

export default VendorList;
