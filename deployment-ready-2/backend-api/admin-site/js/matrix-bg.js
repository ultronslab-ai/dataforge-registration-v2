(() => {
  const canvas = document.createElement('canvas');
  canvas.className = 'matrix-bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const glyphs = '01 DATA FORGE SRM <> {} [] /\\';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let columns = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastFrameTime = 0;
  const MIN_FALL_SPEED = 1.2;
  const FALL_SPEED_RANGE = 2.4;
  const TARGET_FRAME_MS = 1000 / 60;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const columnWidth = width < 700 ? 22 : 18;
    const count = Math.ceil(width / columnWidth);
    columns = Array.from({ length: count }, (_, index) => ({
      x: index * columnWidth,
      y: Math.random() * -height,
      speed: MIN_FALL_SPEED + Math.random() * FALL_SPEED_RANGE,
      length: 8 + Math.floor(Math.random() * 18),
      size: width < 700 ? 13 : 15
    }));
  }

  function draw(timestamp = 0) {
    const elapsed = lastFrameTime ? timestamp - lastFrameTime : TARGET_FRAME_MS;
    lastFrameTime = timestamp;
    const frameScale = Math.min(Math.max(elapsed / TARGET_FRAME_MS, 0.5), 2);

    frame += 1;
    const trailAlpha = 1 - Math.pow(1 - 0.13, frameScale);
    ctx.fillStyle = `rgba(4, 8, 4, ${trailAlpha})`;
    ctx.fillRect(0, 0, width, height);

    ctx.font = '600 15px "Space Grotesk", Consolas, monospace';
    ctx.textAlign = 'center';

    columns.forEach(column => {
      for (let i = 0; i < column.length; i += 1) {
        const y = column.y - i * column.size;
        if (y < -30 || y > height + 30) continue;

        const charIndex = Math.floor((frame + column.x + y + i * 17) % glyphs.length);
        const alpha = Math.max(0, 0.62 - i / column.length);
        ctx.fillStyle = i === 0
          ? `rgba(210, 255, 108, ${Math.min(0.72, alpha + 0.18)})`
          : `rgba(0, 255, 136, ${alpha})`;
        ctx.fillText(glyphs[charIndex], column.x, y);
      }

      column.y += column.speed * frameScale;
      if (column.y - column.length * column.size > height) {
        column.y = Math.random() * -height * 0.35;
        column.speed = MIN_FALL_SPEED + Math.random() * FALL_SPEED_RANGE;
        column.length = 8 + Math.floor(Math.random() * 18);
      }
    });

    if (!prefersReducedMotion.matches) {
      window.requestAnimationFrame(draw);
    }
  }

  resize();
  if (prefersReducedMotion.matches) {
    draw();
  } else {
    window.requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
})();
