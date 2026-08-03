import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl, assetUrl } from "../utils/api";
import { authOptions } from "../utils/auth";

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

function imageForVendor(vendor) {
  return resolveImagePath(vendor.image_url) || vendorImages[vendor.id] || "/images/eventhub-hero.png";
}

function FavoriteVendors() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const savedUser = localStorage.getItem("eventhubUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setLoading(false);
      return;
    }

    fetch(apiUrl(`/api/favorites/${user.id}`), authOptions())
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        return response.json();
      })
      .then((data) => {
        setFavorites(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching favorites:", error);
        setPageError("Could not load your favorite vendors.");
        setLoading(false);
      });
  }, [savedUser]);

  if (!user) {
    return (
      <section>
        <p>Please login to view your favorite vendors.</p>
        <Link className="action-link" to="/login">Go to Login</Link>
      </section>
    );
  }

  if (user.role !== "customer") {
    return <p>Only customers can view favorite vendors.</p>;
  }

  return (
    <section>
      <h1>Favorites</h1>
      <p>Your saved event management vendors.</p>

      {loading && <p>Loading favorites...</p>}

      {pageError && <p className="error-message">{pageError}</p>}

      {!loading && !pageError && favorites.length === 0 && (
        <p>No favorite vendors yet.</p>
      )}

      {!loading && !pageError && favorites.length > 0 && (
        <section className="vendor-list">
          {favorites.map((vendor) => (
            <Link
              className="vendor-card"
              key={vendor.id}
              to={`/vendors/${vendor.id}`}
            >
              <div className="vendor-card-top">
                <span className="vendor-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="img">
                    <path d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.08 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5 22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
                  </svg>
                </span>
                <span className="vendor-card-link">Saved</span>
              </div>

              <div className="vendor-card-visual">
                <img
                  src={imageForVendor(vendor)}
                  alt={`${vendor.business_name} event setup`}
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
                  <strong>Food Type</strong>
                  <span>{vendor.food_type || "Not added"}</span>
                </p>
                <p>
                  <strong>Event Type</strong>
                  <span>{vendor.event_type || "Not added"}</span>
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </section>
  );
}

export default FavoriteVendors;
