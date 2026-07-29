import { useState } from "react";
import { Link } from "react-router-dom";
import EventHubHero from "../components/EventHubHero";

const features = [
  {
    title: "Discover trusted teams",
    text: "Browse a curated directory of event professionals across Tamil Nadu, with clear service and pricing details.",
    path: "M4 19.5V9.8L12 4l8 5.8v9.7M8 20v-6h8v6M9 9h.01M15 9h.01",
  },
  {
    title: "Compare with confidence",
    text: "Filter by district, cuisine, event type, and date so every option matches what your celebration needs.",
    path: "M8 6h12M4 6h.01M8 12h12M4 12h.01M8 18h12M4 18h.01",
  },
  {
    title: "Connect in one place",
    text: "Send inquiries directly, keep track of responses, and move from inspiration to a confirmed event team.",
    path: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z M8 9h8M8 13h5",
  },
];

const categories = [
  { title: "Weddings", image: "/images/vendor-wedding.png", detail: "Ceremonies, receptions & catering" },
  { title: "Corporate", image: "/images/vendor-corporate.png", detail: "Conferences, launches & team events" },
  { title: "Celebrations", image: "/images/vendor-family.png", detail: "Birthdays, showers & family moments" },
];

const aboutGalleryPhotos = [
  { id: 1, image: "/images/vendor-wedding.png", title: "Wedding setup" },
  { id: 2, image: "/images/vendor-corporate.png", title: "Corporate event" },
  { id: 3, image: "/images/vendor-family.png", title: "Family celebration" },
  { id: 4, image: "/images/vendor-chennai-v2.jpg", title: "Reception decor" },
  { id: 5, image: "/images/vendor-madurai-v2.jpg", title: "Traditional moments" },
];

function Home() {
  const [isAboutGalleryOpen, setIsAboutGalleryOpen] = useState(false);

  return (
    <div className="home-page">
      <EventHubHero />

      <section className="category-section" aria-labelledby="category-heading">
        <div className="category-heading-row">
          <div><span className="section-eyebrow">Browse by occasion</span><h2 id="category-heading">Whatever you are celebrating.</h2></div>
          <Link className="text-link" to="/vendors">View directory <span aria-hidden="true">{"->"}</span></Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" to="/vendors" key={category.title}>
              <img src={category.image} alt="" width="1536" height="1024" loading="lazy" />
              <span className="category-overlay" aria-hidden="true" />
              <span className="category-content"><strong>{category.title}</strong><small>{category.detail}</small></span>
              <span className="category-arrow" aria-hidden="true">{"->"}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="site-intro about-gallery-section" aria-labelledby="about-eventhub">
        <div className="intro-copy">
          <span className="section-eyebrow">Everything your event needs</span>
          <h2 id="about-eventhub">Planning should feel exciting, not overwhelming.</h2>
          <p>
            EventHub brings customers and local event professionals together in
            one trusted marketplace. Explore services, understand your options,
            and find the right people without searching across dozens of sites.
          </p>
          <Link className="text-link" to="/vendors">Browse all vendors <span aria-hidden="true">{"->"}</span></Link>
        </div>
        <div className={`about-folder-gallery ${isAboutGalleryOpen ? "is-open" : ""}`} aria-label="EventHub visual gallery">
          <div className="about-folder-stage">
            <button
              className="about-folder-cover"
              type="button"
              onClick={() => setIsAboutGalleryOpen((current) => !current)}
              aria-expanded={isAboutGalleryOpen}
            >
              <span className="folder-tab" aria-hidden="true" />
              <span className="folder-front" aria-hidden="true" />
              <span className="folder-label">{isAboutGalleryOpen ? "Close gallery" : "EventHub.gallery"}</span>
            </button>

            <div className="about-photo-stack" aria-hidden={!isAboutGalleryOpen}>
              {aboutGalleryPhotos.map((photo, index) => (
                <article className={`about-gallery-photo photo-${index + 1}`} key={photo.id}>
                  <img src={photo.image} alt={photo.title} loading="lazy" />
                </article>
              ))}
            </div>
          </div>

          <div className="about-gallery-caption">
            <span>{isAboutGalleryOpen ? "Click folder to close" : "Click folder to view moments"}</span>
          </div>

          <div className="intro-stats compact-stats" aria-label="EventHub highlights">
            <div><strong>38</strong><span>Tamil Nadu districts</span></div>
            <div><strong>12+</strong><span>Event categories</span></div>
            <div><strong>1</strong><span>Simple marketplace</span></div>
          </div>
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="how-heading">
        <div className="section-heading-centered">
          <span className="section-eyebrow">Simple from start to finish</span>
          <h2 id="how-heading">How EventHub works</h2>
          <p>Three clear steps from the first idea to the right event partner.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-number">0{index + 1}</span>
              <span className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d={feature.path} /></svg>
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="section-eyebrow">Your celebration starts here</span>
          <h2>Ready to find your perfect team?</h2>
          <p>Explore local professionals and make your next event unforgettable.</p>
        </div>
        <Link to="/vendors">Explore vendors <span aria-hidden="true">{"->"}</span></Link>
      </section>
    </div>
  );
}

export default Home;
