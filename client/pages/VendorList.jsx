import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function VendorDetail() {
  const { id } = useParams();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:3001/api/vendors/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch vendor");
        }

        return response.json();
      })
      .then((data) => {
        setVendor(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching vendor:", error);
        setError("Could not load vendor details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p>Loading vendor details...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!vendor) {
    return <p>Vendor not found.</p>;
  }

  return (
    <section>
      <Link className="back-link" to="/vendors">
        Back to vendors
      </Link>

      <div className="vendor-detail">
        <h1>{vendor.business_name}</h1>
        <p><strong>Location:</strong> {vendor.location}</p>
        <p><strong>Contact:</strong> {vendor.contact_number}</p>
        <p><strong>Price Range:</strong> {vendor.price_range}</p>
        <p><strong>Description:</strong> {vendor.description}</p>
      </div>
    </section>
  );
}

export default VendorDetail;