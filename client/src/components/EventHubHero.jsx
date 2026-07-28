import { useEffect, useRef } from "react";

function EventHubHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let animationId;
    let time = 0;

    const waveData = Array.from({ length: 8 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function resizeCanvas() {
      const bounds = canvas.parentElement.getBoundingClientRect();
      canvas.width = bounds.width;
      canvas.height = bounds.height;
    }

    function updateWaveData() {
      waveData.forEach((data) => {
        if (Math.random() < 0.01) {
          data.targetValue = Math.random() * 0.7 + 0.1;
        }

        const difference = data.targetValue - data.value;
        data.value += difference * data.speed;
      });
    }

    function draw() {
      context.fillStyle = "#050816";
      context.fillRect(0, 0, canvas.width, canvas.height);

      waveData.forEach((data, index) => {
        const frequency = data.value * 7;
        context.beginPath();

        for (let x = 0; x < canvas.width; x += 1) {
          const normalizedX = (x / canvas.width) * 2 - 1;
          const phaseX = normalizedX + index * 0.04 + frequency * 0.03;
          const waveY =
            Math.sin(phaseX * 10 + time) *
            Math.cos(phaseX * 2) *
            frequency *
            0.1 *
            ((index + 1) / 8);
          const y = (waveY + 1) * (canvas.height / 2);

          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        const intensity = Math.min(1, frequency * 0.3);
        const red = 42 + intensity * 80;
        const green = 118 + intensity * 120;
        const blue = 180 + intensity * 60;

        context.lineWidth = 1 + index * 0.3;
        context.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.62)`;
        context.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.45)`;
        context.shadowBlur = 8;
        context.stroke();
        context.shadowBlur = 0;
      });
    }

    function animate() {
      time += 0.02;
      updateWaveData();
      draw();
      animationId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="home-hero">
      <canvas ref={canvasRef} className="home-hero-canvas" />
      <div className="home-hero-overlay" />

      <div className="home-hero-content">
        <span className="hero-kicker">Event Management Vendor Finder</span>
        <h1>EventHub</h1>
        <p>
          Find event teams, compare services, check availability, and send
          inquiries from one focused marketplace.
        </p>

        <div className="hero-actions">
          <a href="#vendor-filters">Find Vendors</a>
          <span>Live vendor directory</span>
        </div>
      </div>
    </section>
  );
}

export default EventHubHero;
