/* Fig. 1 on the home page: a wireframe globe drawn as ink line work on a
   plain 2D canvas — an orthographic projection of a graticule, hatched on
   the shadow side, with a few great-circle arcs in the spot colour.
   No WebGL and no libraries. The arcs are decoration, not data. */
(function inkGlobe() {
  const canvas = document.getElementById("globe-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const css = getComputedStyle(document.documentElement);
  const INK = css.getPropertyValue("--ink").trim() || "#1c1a16";
  const RUBRIC = css.getPropertyValue("--rubric").trim() || "#a8281c";
  const PAPER = css.getPropertyValue("--paper").trim() || "#f5f0e6";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const RAD = Math.PI / 180;
  const TAU = Math.PI * 2;

  let W = 0, cx = 0, cy = 0, R = 0;
  let rot = -0.7;    // spin about the polar axis
  let tilt = 0.38;   // pole tipped toward the viewer

  /* ---- geometry, computed once as unit vectors ---- */
  function vec(latDeg, lonDeg) {
    const lat = latDeg * RAD, lon = lonDeg * RAD, cl = Math.cos(lat);
    return [cl * Math.sin(lon), Math.sin(lat), cl * Math.cos(lon)];
  }

  const meridians = [];
  for (let lon = 0; lon < 360; lon += 20) {
    const line = [];
    for (let lat = -90; lat <= 90; lat += 3) line.push(vec(lat, lon));
    meridians.push(line);
  }
  const parallels = [];
  for (let lat = -60; lat <= 60; lat += 20) {
    const line = [];
    for (let lon = 0; lon <= 360; lon += 3) line.push(vec(lat, lon));
    parallels.push({ line, equator: lat === 0 });
  }

  // Arbitrary points, picked for spacing. They don't mark anything.
  const nodes = [
    [52, -8], [38, -77], [-12, -52], [61, 44], [24, 88],
    [-31, 131], [8, 12], [44, 141], [-42, -160], [71, -128],
  ].map(([la, lo]) => vec(la, lo));

  const arcs = [
    [1, 0], [0, 3], [3, 4], [4, 7], [6, 2], [1, 6], [5, 4], [7, 9], [8, 5], [9, 1],
  ].map(([a, b], i) => {
    const A = nodes[a], B = nodes[b];
    const omega = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
    const so = Math.sin(omega);
    const pts = [];
    const N = 56;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const wa = Math.sin((1 - t) * omega) / so, wb = Math.sin(t * omega) / so;
      // lifted off the surface in the middle, so it reads as an arc over the globe
      const lift = 1 + 0.16 * Math.sin(Math.PI * t) * Math.min(1, omega / 1.2);
      pts.push([A[0] * wa + B[0] * wb, A[1] * wa + B[1] * wb, A[2] * wa + B[2] * wb, lift]);
    }
    return { pts, offset: i * 1.37 };
  });

  /* ---- projection ---- */
  function project(v) {
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const x = v[0] * cr + v[2] * sr;
    const z = -v[0] * sr + v[2] * cr;
    const y2 = v[1] * ct - z * st;
    const z2 = v[1] * st + z * ct;
    const k = R * (v[3] || 1);
    return [cx + x * k, cy - y2 * k, z2];
  }

  // Stroke the runs of a projected polyline that are on the requested side.
  function strokeSide(points, front) {
    ctx.beginPath();
    let pen = false;
    for (const p of points) {
      if ((p[2] >= 0) === front) {
        if (pen) ctx.lineTo(p[0], p[1]);
        else { ctx.moveTo(p[0], p[1]); pen = true; }
      } else {
        pen = false;
      }
    }
    ctx.stroke();
  }

  function hatch() {
    // Shadow crescent, lower right: the disc minus a disc shifted up-left.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.clip();
    ctx.beginPath();
    ctx.rect(0, 0, W, W);
    ctx.arc(cx - R * 0.2, cy - R * 0.2, R * 1.03, 0, TAU);
    ctx.clip("evenodd");
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let d = 0; d < W * 2; d += 4.5) {
      ctx.moveTo(d, 0);
      ctx.lineTo(d - W, W);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 0..1 drawn fraction and an opacity for an arc at time t (seconds).
  function arcState(t, offset) {
    if (reduceMotion) return [1, 1];
    const c = (t + offset) % 11;
    if (c < 2.4) return [c / 2.4, 1];
    if (c < 6) return [1, 1];
    if (c < 7.4) return [1, 1 - (c - 6) / 1.4];
    return [0, 0];
  }

  function draw(t) {
    if (!W) return;
    ctx.clearRect(0, 0, W, W);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;

    const mer = meridians.map((l) => l.map(project));
    const par = parallels.map((p) => ({ pts: p.line.map(project), equator: p.equator }));

    // far side, seen through the globe
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 0.6;
    mer.forEach((l) => strokeSide(l, false));
    par.forEach((p) => strokeSide(p.pts, false));

    hatch();

    // near side
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 0.7;
    mer.forEach((l) => strokeSide(l, true));
    par.forEach((p) => { if (!p.equator) strokeSide(p.pts, true); });
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.1;
    par.forEach((p) => { if (p.equator) strokeSide(p.pts, true); });

    // limb
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();

    // arcs
    ctx.strokeStyle = RUBRIC;
    ctx.fillStyle = RUBRIC;
    for (const arc of arcs) {
      const [frac, alpha] = arcState(t, arc.offset);
      if (alpha <= 0) continue;
      const n = Math.max(1, Math.round(frac * (arc.pts.length - 1)));
      const pts = arc.pts.slice(0, n + 1).map(project);
      // a lifted point is still visible past the horizon if it clears the limb
      const shown = (p) => p[2] >= 0 || Math.hypot(p[0] - cx, p[1] - cy) > R;
      for (const pass of [false, true]) {
        ctx.globalAlpha = alpha * (pass ? 0.95 : 0.16);
        ctx.lineWidth = pass ? 1.25 : 0.8;
        ctx.beginPath();
        let pen = false;
        for (const p of pts) {
          if (shown(p) === pass) {
            if (pen) ctx.lineTo(p[0], p[1]);
            else { ctx.moveTo(p[0], p[1]); pen = true; }
          } else {
            pen = false;
          }
        }
        ctx.stroke();
      }
      const head = pts[pts.length - 1];
      if (shown(head)) {
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(head[0], head[1], 2.1, 0, TAU);
        ctx.fill();
      }
    }

    // nodes: small open circles, near side only
    ctx.globalAlpha = 1;
    ctx.strokeStyle = INK;
    ctx.fillStyle = PAPER;
    ctx.lineWidth = 0.9;
    for (const v of nodes) {
      const p = project(v);
      if (p[2] < 0.05) continue;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 2.6, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }

  /* ---- sizing ---- */
  function resize() {
    const w = canvas.clientWidth;
    if (!w) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(w * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = w;
    cx = cy = w / 2;
    R = w * 0.42;
    draw(performance.now() / 1000);
  }

  /* ---- animation: runs only while on screen and the tab is visible ---- */
  let running = false, onScreen = true, dragging = false, last = 0;

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!dragging) rot += dt * 0.085;   // about one turn every 74 seconds
    draw(now / 1000);
    requestAnimationFrame(frame);
  }
  function sync() {
    const should = !reduceMotion && onScreen && !document.hidden;
    if (should && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    } else if (!should) {
      running = false;
    }
  }

  /* ---- drag to turn ---- */
  let px = 0, py = 0;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    px = e.clientX;
    py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    rot += (e.clientX - px) * 0.008;
    tilt = Math.max(-1.2, Math.min(1.2, tilt + (e.clientY - py) * 0.006));
    px = e.clientX;
    py = e.clientY;
    if (!running) draw(performance.now() / 1000);
  });
  function release() {
    dragging = false;
    canvas.style.cursor = "";
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting;
      sync();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", sync);

  resize();
  sync();
})();
