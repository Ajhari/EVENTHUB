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

function Home() {
  return (
    <div className="home-page">
      <EventHubHero />

      <section className="site-intro" aria-labelledby="about-eventhub">
        <div className="intro-copy">
          <span className="section-eyebrow">Everything your event needs</span>
          <h2 id="about-eventhub">Planning should feel exciting, not overwhelming.</h2>
          <p>
            EventHub brings customers and local event professionals together in
            one trusted marketplace. Explore services, understand your options,
            and find the right people without searching across dozens of sites.
          </p>
          <Link className="text-link" to="/vendors">Browse all vendors <span aria-hidden="true">→</span></Link>
        </div>
        <div className="intro-stats" aria-label="EventHub highlights">
          <div><strong>38</strong><span>Tamil Nadu districts</span></div>
          <div><strong>12+</strong><span>Event categories</span></div>
          <div><strong>1</strong><span>Simple marketplace</span></div>
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
        <Link to="/vendors">Explore vendors <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}

export default Home;
