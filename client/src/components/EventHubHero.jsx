import { Link } from "react-router-dom";

function EventHubHero() {
  return (
    <section className="home-hero">
      <div className="home-hero-content">
        <span className="hero-kicker"><span aria-hidden="true" /> Tamil Nadu's curated event marketplace</span>
        <h1>Your perfect event starts with the <em>right team.</em></h1>
        <p>
          Discover trusted planners, caterers, and celebration experts. Compare
          services, check dates, and connect—all in one beautiful place.
        </p>

        <div className="hero-actions">
          <Link to="/vendors">Explore vendors <span aria-hidden="true">→</span></Link>
          <span><strong>6+</strong> curated professionals</span>
        </div>
      </div>
      <div className="hero-showcase" aria-hidden="true">
        <div className="showcase-card showcase-main">
          <span className="showcase-label">Featured in Chennai</span>
          <img
            className="showcase-image"
            src="/images/eventhub-hero.png"
            alt=""
            width="1536"
            height="1024"
          />
          <strong>Chennai Celebrations</strong>
          <small>Weddings · Receptions · Catering</small>
          <div className="showcase-rating">★ 4.9 <span>Top rated</span></div>
        </div>
        <div className="showcase-card showcase-float"><span>Verified</span><strong>Trusted local teams</strong></div>
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
      </div>
    </section>
  );
}

export default EventHubHero;
