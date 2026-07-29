import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const MOMENTS = [
  {
    id: "chennai",
    eyebrow: "Celebrate under open skies",
    title: "Let every detail feel effortless.",
    caption: "Chennai - outdoor receptions, thoughtful tables and warm evenings",
    image: "/images/vendor-chennai-v2.png",
  },
  {
    id: "madurai",
    eyebrow: "Keep tradition close",
    title: "Bring every generation together.",
    caption: "Madurai - timeless rituals, family celebrations and generous feasts",
    image: "/images/vendor-madurai-v2.png",
  },
  {
    id: "kovai",
    eyebrow: "Make an impression",
    title: "Turn a bold idea into an experience.",
    caption: "Kovai - polished launches, conferences and production-led events",
    image: "/images/vendor-kovai-v2.png",
  },
  {
    id: "trichy",
    eyebrow: "Hold onto the moment",
    title: "Let the ceremony feel entirely yours.",
    caption: "Trichy - meaningful weddings shaped by trusted local teams",
    image: "/images/vendor-trichy-v2.png",
  },
];

const MOMENT_DURATION = 6500;

export default function EventHubHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const scenes = useMemo(() => MOMENTS, []);

  useEffect(() => {
    if (!isPlaying || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setTimeout(
      () => setActiveIndex((current) => (current + 1) % scenes.length),
      MOMENT_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [activeIndex, isPlaying, scenes.length]);

  const activeScene = scenes[activeIndex];
  if (!activeScene) return null;

  return (
    <section className="moments-section" aria-labelledby="moments-title">
      <div className="moments-intro">
        <div>
          <p className="section-eyebrow">Picture your celebration</p>
          <h1 id="moments-title">Events should feel like a moment.</h1>
        </div>
        <p>Discover experienced local teams who can turn the event in your mind into one you will always remember.</p>
      </div>

      <div className="moments-player">
        <div className="moments-scenes" aria-live="polite">
          {scenes.map((scene, index) => (
            <div
              className={`moments-scene ${index === activeIndex ? "is-active" : ""}`}
              aria-hidden={index !== activeIndex}
              key={scene.id}
            >
              <img
                className="moments-media"
                src={scene.image}
                alt={index === activeIndex ? `Professionally organised event in ${scene.caption.split(" - ")[0]}` : ""}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                width="1536"
                height="1024"
              />
            </div>
          ))}
        </div>
        <div className="moments-shade" aria-hidden="true" />

        <div className="moments-content" key={activeScene.id}>
          <p className="moments-eyebrow">{activeScene.eyebrow}</p>
          <h2>{activeScene.title}</h2>
          <p>{activeScene.caption}</p>
          <Link className="moments-link" to="/vendors">
            Find a team for this moment
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>

        <div className="moments-controls">
          <button
            className="moments-play"
            type="button"
            onClick={() => setIsPlaying((playing) => !playing)}
            aria-label={isPlaying ? "Pause cinematic moments" : "Play cinematic moments"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7v10M15 7v10" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5Z" /></svg>
            )}
          </button>

          <div className="moments-timeline" role="tablist" aria-label="Event moments">
            {scenes.map((scene, index) => (
              <button
                className={index === activeIndex ? "is-active" : ""}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Show ${scene.caption.split(" - ")[0]}`}
                key={scene.id}
                onClick={() => setActiveIndex(index)}
              >
                <span
                  className="moments-progress"
                  style={{ "--moment-duration": `${MOMENT_DURATION}ms`, animationPlayState: isPlaying ? "running" : "paused" }}
                />
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{scene.caption.split(" - ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
