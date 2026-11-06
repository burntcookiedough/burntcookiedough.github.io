(() => {
  "use strict";

  // ───────────────────────── helpers ─────────────────────────
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 250 }) : setTimeout(r, 16)));
  // run fn(0..n-1) in slices that fit inside idle time, so scrolling never stalls
  function sliced(n, fn) {
    let i = 0;
    return new Promise((done) => {
      const run = (deadline) => {
        const end = performance.now() + (deadline && !deadline.didTimeout ? Math.min(deadline.timeRemaining(), 8) : 5);
        do { fn(i++); } while (i < n && performance.now() < end);
        if (i < n) schedule(); else done();
      };
      const schedule = () => (window.requestIdleCallback ? requestIdleCallback(run, { timeout: 400 }) : setTimeout(run, 16));
      schedule();
    });
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // weaker devices get a lighter render path; the look stays the same
  const LOW = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const DPR = Math.min(devicePixelRatio || 1, LOW ? 1 : finePointer ? 1.5 : 1.25);
  const TAU = Math.PI * 2;
  const SVGNS = "http://www.w3.org/2000/svg";
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16);
  const root = document.documentElement;
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(",")})`; };

  // only touch the style system when a value actually changes
  const varCache = new WeakMap();
  function setVar(el, k, v) {
    let c = varCache.get(el);
    if (!c) varCache.set(el, (c = {}));
    if (c[k] !== v) { c[k] = v; el.style.setProperty(k, v); }
  }

  // fade children in without a forced reflow
  function swapIn(el, dx, dy) {
    if (reduced || !el.animate) return;
    for (const c of el.children) c.animate([{ opacity: 0, transform: `translate(${dx}px,${dy}px)` }, { opacity: 1, transform: "none" }], { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" });
  }
  const ARROW = '<svg class="ico" aria-hidden="true"><use href="#ne"/></svg>';
  const SITE = window.SITE, PROJ = window.PROJECTS, SIG = window.SIGNALS, CRED = window.CREDENTIALS;
  const st = { W: innerWidth, H: innerHeight, sy: scrollY, mx: 0, my: 0, tmx: 0, tmy: 0, t0: Infinity, born: performance.now() };

  // section geometry is measured once (and on resize), never per frame
  const IDS = ["city", "orbit", "work", "hallway", "sky"];
  const M = {};
  function measure() {
    for (const id of IDS) { const el = document.getElementById(id); M[id] = { el, top: el.offsetTop, h: el.offsetHeight }; }
  }
  function pin(id) {
    const m = M[id], y = st.sy;
    return { p: clamp((y - m.top) / Math.max(1, m.h - st.H)), visible: y + st.H > m.top && y < m.top + m.h };
  }
  const visible = (id) => { const m = M[id]; return st.sy + st.H > m.top && st.sy < m.top + m.h; };

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!LOW && finePointer && !reduced) root.classList.add("hq");

  function sprinkle(box, n, seed, sparkles = 0) {
    const r = rng(seed);
    let html = "";
    for (let i = 0; i < n; i++) {
      const s = r() < 0.15 ? 3 : 2;
      html += `<i style="left:${(r() * 100).toFixed(2)}%;top:${(r() * 100).toFixed(2)}%;width:${s}px;height:${s}px;--t:${(2 + r() * 4).toFixed(1)}s;--d:${(-r() * 5).toFixed(1)}s"></i>`;
    }
    for (let i = 0; i < sparkles; i++) {
      const s = 8 + r() * 18;
      html += `<svg style="left:${(r() * 96).toFixed(1)}%;top:${(r() * 90).toFixed(1)}%;width:${s}px;height:${s}px;animation-delay:${(-r() * 3).toFixed(1)}s"><use href="#spark"/></svg>`;
    }
    box.innerHTML = html;
  }

  // riso speckle punched out of a canvas so the blue shows through
  function makeNoise(ctx, seed, cut, soft = 60) {
    const c = document.createElement("canvas"); c.width = c.height = 192;
    const g = c.getContext("2d"), id = g.createImageData(192, 192), rr = rng(seed);
    for (let k = 0; k < id.data.length; k += 4) {
      const v = rr();
      id.data[k + 3] = v > cut ? 150 + rr() * 105 : v > 0.55 ? rr() * soft : 0;
    }
    g.putImageData(id, 0, 0);
    return ctx.createPattern(c, "repeat");
  }

  // ───────────────────────── loader ─────────────────────────
  const Loader = (() => {
    const el = $(".loader"), num = $("[data-load-num]"), step = $("[data-load-step]");
    let target = 0, shown = 0, raf = 0;
    const loop = () => {
      shown += (target - shown) * (reduced ? 1 : 0.28);
      if (Math.abs(target - shown) < 0.6) shown = target;
      num.textContent = String(Math.round(shown)).padStart(3, "0");
      raf = requestAnimationFrame(loop);
    };
    loop();
    return {
      set(v, label) { target = Math.max(target, v); if (label) step.textContent = label; },
      async finish() {
        target = 100;
        while (shown < 99.5) await nextFrame();
        cancelAnimationFrame(raf);
        num.textContent = "100";
        el.classList.add("out");
        root.classList.remove("loading");
        setTimeout(() => el.remove(), 900);
      },
    };
  })();

  // ───────────────────────── scroll: inertia + spring snap ─────────────────────────
  // Desktop wheel gets eased inertia; when you stop near a "beat" (a tower, a room,
  // a section start) the page settles onto it. Touch keeps native scrolling and uses
  // CSS proximity snapping on invisible markers at the same beats.
  function makeScroller() {
    const smoothWheel = finePointer && !reduced;
    let target = scrollY, cur = scrollY, active = false, settled = true, lastInput = 0, held = false, from = scrollY;
    let snaps = [];
    const maxY = () => root.scrollHeight - innerHeight;
    if (smoothWheel) {
      addEventListener("wheel", (e) => {
        if (e.ctrlKey || root.classList.contains("loading")) return;
        e.preventDefault();
        let d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1);
        d = Math.sign(d) * Math.min(Math.abs(d), 150) * 0.9;
        if (!active) target = cur = scrollY;
        target = clamp(target + d, 0, maxY());
        active = true; settled = false; lastInput = performance.now();
      }, { passive: false });
    }
    addEventListener("scroll", () => {
      if (!active) { target = cur = scrollY; settled = false; lastInput = performance.now(); }
    }, { passive: true });
    addEventListener("pointerdown", () => (held = true));
    addEventListener("pointerup", () => { held = false; lastInput = performance.now(); });
    addEventListener("keydown", () => { lastInput = performance.now(); settled = false; });

    function to(y) {
      if (!smoothWheel) { scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" }); return; }
      if (!active) cur = scrollY;
      target = clamp(y, 0, maxY()); active = true; settled = true; from = target;
    }
    function setSnaps(points) {
      snaps = points.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
      if (finePointer) return;
      $$(".snap").forEach((n) => n.remove());
      for (const y of snaps) {
        const id = IDS.slice().reverse().find((k) => M[k].top <= y + 1);
        if (!id) continue;
        const mk = document.createElement("i");
        mk.className = "snap"; mk.style.top = `${Math.round(y - M[id].top)}px`;
        M[id].el.appendChild(mk);
      }
    }
    let lastT = performance.now();
    function tick(now) {
      const dt = Math.min(64, now - lastT); lastT = now;
      if (active) {
        cur += (target - cur) * (1 - Math.pow(0.88, dt / 16.67));
        if (Math.abs(target - cur) < 0.6) { cur = target; active = false; lastInput = now; }
        scrollTo(0, cur);
      } else if (smoothWheel && !settled && !held && now - lastInput > 170) {
        settled = true;
        const y = scrollY, moved = y - from, dir = Math.abs(moved) > 40 ? Math.sign(moved) : 0;
        let best = null, bd = innerHeight * (dir ? 0.62 : 0.4);
        for (const s of snaps) {
          if (dir && Math.sign(s - from) !== dir) continue;
          if (dir && Math.abs(s - from) < 8) continue;
          const d = Math.abs(s - y);
          if (d < bd) { bd = d; best = s; }
        }
        if (best !== null && Math.abs(best - y) > 2) to(best); else from = y;
      }
    }
    // in-page links go through the same easing
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      to(t.offsetTop);
    });
    return { tick, to, setSnaps };
  }

  // ───────────────────────── content ─────────────────────────
  function fillContent() {
    $$("[data-name]").forEach((el) => {
      const k = +el.dataset.name;
      el.innerHTML = [...SITE.name[k]].map((c, i) => `<span class="ch" style="--i:${i + k * 6}">${c}</span>`).join("");
    });
    $("[data-role]").textContent = SITE.role;
    $$("[data-resume]").forEach((a) => (a.href = SITE.resume));
    $$("[data-email]").forEach((a) => (a.href = "mailto:" + SITE.email));
    $$("[data-email-text]").forEach((a) => (a.textContent = SITE.email));
    $$("[data-linkedin]").forEach((a) => (a.href = SITE.linkedin));
    $$("[data-github]").forEach((a) => (a.href = SITE.github));
    $("[data-now]").textContent = SITE.nowBuilding;
  }

  // ───────────────────────── cursor ─────────────────────────
  function makeCursor() {
    addEventListener("pointermove", (e) => {
      st.tmx = (e.clientX / st.W) * 2 - 1;
      st.tmy = (e.clientY / st.H) * 2 - 1;
    }, { passive: true });
    if (!finePointer) return { tick() {} };
    root.classList.add("has-cursor");
    const el = $(".cursor"), label = $(".cursor-label");
    let x = -100, y = -100, tx = -100, ty = -100;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener("pointerover", (e) => {
      const h = e.target.closest("[data-hover], a, button");
      el.classList.toggle("is-hover", !!h);
      label.textContent = h ? h.getAttribute("data-hover") || "" : "";
    });
    addEventListener("pointerdown", () => el.classList.add("is-down"));
    addEventListener("pointerup", () => el.classList.remove("is-down"));
    document.addEventListener("pointerleave", () => (el.style.opacity = 0));
    document.addEventListener("pointerenter", () => (el.style.opacity = 1));
    return {
      tick() {
        if (Math.abs(tx - x) + Math.abs(ty - y) < 0.1) return;
        x += (tx - x) * 0.32; y += (ty - y) * 0.32;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      },
    };
  }

  // ───────────────────────── 01 CITY ─────────────────────────
  // A perspective camera looking straight up between box towers.
  function makeCity() {
    const stage = $(".city-stage");
    const cv = $(".city-canvas"), ctx = cv.getContext("2d");
    sprinkle($(".city-stars"), LOW ? 80 : 160, 5);
    if (!reduced) $(".walker-hero").classList.add("walking");

    const r = rng(20261106);
    const GAP = 40, towers = [];
    for (const [qx, qy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const anchor = i === 0 && j === 0;
        if (!anchor && ((i + j > 2 && r() < 0.45) || r() < 0.1)) continue;
        const a = GAP + i * 80 + r() * 14, w = 48 + r() * 26;
        const b = GAP + j * 80 + r() * 14, d = 48 + r() * 26;
        const xs = [qx * a, qx * (a + w)].sort((m, n) => m - n);
        const ys = [qy * b, qy * (b + d)].sort((m, n) => m - n);
        towers.push({ x1: xs[0], x2: xs[1], y1: ys[0], y2: ys[1], h: anchor ? 420 + r() * 160 : 200 + r() * 360 - (i + j) * 30, dist: Math.hypot(a, b), tone: r() });
      }
    }
    towers.sort((p, q) => q.dist - p.dist);
    const noise = makeNoise(ctx, 3, 0.84);

    let W, H, f, lastKey = "";
    function resize() {
      W = stage.clientWidth; H = stage.clientHeight;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      f = Math.max(W, H * 1.15);
      lastKey = "";
    }
    const cam = { x: 0, y: 0, z: 0, roll: 0 };
    const CREAM = ["#efe4cc", "#e7d9b9"], SIDE = ["#dccaa3", "#d2be93"], WIN = "#1a30c2";
    let zlo, cr, sr;
    const P = (x, y, z) => {
      const k = f / (z - cam.z), X = (x - cam.x) * k, Y = (y - cam.y) * k;
      return [W / 2 + X * cr - Y * sr, H / 2 + X * sr + Y * cr];
    };
    function face(T, axis, c, a0, a1, fill) {
      const pt = axis === "x" ? (s, z) => P(c, s, z) : (s, z) => P(s, c, z);
      const quad = (s0, s1, z0, z1, path) => {
        const A = pt(s0, z0), B = pt(s1, z0), C = pt(s1, z1), D = pt(s0, z1);
        path.moveTo(A[0], A[1]); path.lineTo(B[0], B[1]); path.lineTo(C[0], C[1]); path.lineTo(D[0], D[1]); path.closePath();
      };
      const body = new Path2D(); quad(a0, a1, zlo, T.h, body);
      ctx.fillStyle = fill; ctx.fill(body);
      const FLOOR = 7.2, m = 3.6, win = new Path2D();
      for (let z = Math.floor(zlo / FLOOR) * FLOOR; z < T.h - 7; z += FLOOR) {
        const z0 = Math.max(z + 1.9, zlo), z1 = z + 5.6;
        if (z1 > z0) quad(a0 + m, a1 - m, z0, z1, win);
      }
      ctx.fillStyle = WIN; ctx.fill(win);
      const span = a1 - a0 - 2 * m, cols = Math.max(3, Math.round(span / 5.6)), step = span / cols, mull = new Path2D();
      for (let k = 1; k < cols; k++) { const s = a0 + m + k * step; quad(s - 0.75, s + 0.75, zlo, T.h - 7, mull); }
      ctx.fillStyle = fill; ctx.fill(mull);
    }
    function render() {
      cr = Math.cos(cam.roll); sr = Math.sin(cam.roll);
      zlo = cam.z + 2.5;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const T of towers) {
        if (T.h <= zlo + 4) continue;
        const ci = T.tone > 0.5 ? 1 : 0;
        if (cam.x < T.x1) face(T, "x", T.x1, T.y1, T.y2, CREAM[ci]);
        if (cam.x > T.x2) face(T, "x", T.x2, T.y1, T.y2, CREAM[ci]);
        if (cam.y < T.y1) face(T, "y", T.y1, T.x1, T.x2, SIDE[ci]);
        if (cam.y > T.y2) face(T, "y", T.y2, T.x1, T.x2, SIDE[ci]);
      }
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = noise; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    function tick(now) {
      const { p, visible } = pin("city");
      if (!visible) return;
      const it = reduced ? 1 : clamp((now - st.t0) / 2400);
      cam.x = st.mx * 6; cam.y = st.my * 6;
      cam.z = 720 * Math.pow(1 - it, 3) + Math.pow(p, 1.35) * 780;
      cam.roll = (reduced ? 0 : p * 0.85) + st.mx * 0.035;
      const key = `${cam.x.toFixed(2)}|${cam.y.toFixed(2)}|${cam.z.toFixed(1)}|${cam.roll.toFixed(4)}`;
      if (key !== lastKey) { lastKey = key; render(); }
      setVar(stage, "--sky", mixHex("#1d36d6", "#05061a", smooth(0.35, 0.92, p)));
      setVar(stage, "--stars", (0.22 + 0.78 * smooth(0.25, 0.85, p)).toFixed(2));
      const twinkle = reduced || LOW ? 1 : 1 + Math.sin(now / 260) * 0.06;
      setVar(stage, "--ss", ((1 - Math.pow(1 - it, 4)) * (1 + p * 2.4) * twinkle).toFixed(3));
      setVar(stage, "--sr", `${(p * 135 + cam.roll * 57).toFixed(1)}deg`);
      setVar(stage, "--name-s", (1 + p * 0.4).toFixed(3));
      setVar(stage, "--name-o", (1 - smooth(0.06, 0.42, p)).toFixed(3));
      setVar(stage, "--spread", (p * 0.28).toFixed(3));
      setVar(stage, "--runway-y", `${(p * 150).toFixed(1)}%`);
      setVar(stage, "--runway-o", (1 - smooth(0, 0.3, p)).toFixed(3));
      setVar(stage, "--flash", smooth(0.88, 1, p).toFixed(3));
      setVar(stage, "--copy-o", (1 - smooth(0.02, 0.2, p)).toFixed(3));
    }
    return { resize, tick };
  }

  // ───────────────────────── 02 ORBIT ─────────────────────────
  // The planet texture is built in idle slices so it never blocks the first paint.
  function makeOrbit() {
    sprinkle($(".orbit-stars"), LOW ? 70 : 150, 77, 9);
    const ex = $("[data-extrude]"), N = LOW ? 10 : 18;
    for (let i = N; i >= 1; i--) {
      const u = document.createElementNS(SVGNS, "use");
      u.setAttribute("href", "#wm");
      u.setAttribute("transform", `translate(${((i * 1.3 * 18) / N).toFixed(1)} ${((i * 1.9 * 18) / N).toFixed(1)})`);
      u.setAttribute("fill", mixHex("#281d9c", "#050418", i / N));
      ex.appendChild(u);
    }
    const tc = $("[data-timecode]");
    let lastSec = -1, ready = false;

    const cv = $(".planet"), g = cv.getContext("2d"), S = cv.width, R = S / 2 - 6;
    const TW = 256, TH = 128, land = new Uint8Array(TW * TH), cloud = new Uint8Array(TW * TH);
    const perm = new Uint8Array(512);
    {
      const pr = rng(42), p0 = [...Array(256).keys()];
      for (let i = 255; i > 0; i--) { const j = Math.floor(pr() * (i + 1)); [p0[i], p0[j]] = [p0[j], p0[i]]; }
      for (let i = 0; i < 512; i++) perm[i] = p0[i & 255];
    }
    const hash = (x, y, z) => perm[(perm[(perm[x & 255] + y) & 255] + z) & 255] / 255;
    const fade = (t) => t * t * (3 - 2 * t);
    function vnoise(x, y, z) {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
      const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
      const c = (a, b, d) => hash(xi + a, yi + b, zi + d);
      return lerp(
        lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
        lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v), w);
    }
    const fbm = (x, y, z, o) => { let a = 0.5, s = 0, q = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * q + 31, y * q + 17, z * q + 7); q *= 2; a *= 0.5; } return s; };
    const PAL = [
      ["#070b3a", "#101c86", "#1f3bd1", "#4a6bff"],
      ["#1d1a08", "#4b4818", "#86803a", "#c4b65e"],
      ["#2a0f06", "#7a2e12", "#c4622a", "#f2a64c"],
      ["#2f3478", "#9aa0e6", "#e2e4ff", "#ffffff"],
    ].map((p) => p.map(hex));
    const CLOUD = PAL[3];
    const L = (() => { const v = [-0.55, -0.5, 0.67], l = Math.hypot(...v); return v.map((c) => c / l); })();
    const img = g.createImageData(S, S), data = img.data;
    let rot = 0, vel = 0, frame = 0;
    function draw() {
      for (let py = 0; py < S; py++) {
        for (let px = 0; px < S; px++) {
          const k = (py * S + px) * 4, nx = (px + 0.5 - S / 2) / R, ny = (py + 0.5 - S / 2) / R, r2 = nx * nx + ny * ny;
          const b = BAYER[(py & 3) * 4 + (px & 3)];
          if (r2 > 1) {
            const rim = (1.09 - r2) / 0.09;
            if (rim > b) { data[k] = 70; data[k + 1] = 90; data[k + 2] = 255; data[k + 3] = 255; } else data[k + 3] = 0;
            continue;
          }
          const nz = Math.sqrt(1 - r2), lat = Math.asin(-ny), base = Math.atan2(nx, nz);
          const tv = Math.round((lat / Math.PI + 0.5) * (TH - 1)) * TW;
          const u1 = Math.floor(((((base + rot) / TAU) % 1) + 1) % 1 * TW);
          const u2 = Math.floor(((((base + rot * 1.3 + 0.5) / TAU) % 1) + 1) % 1 * TW);
          const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]) * 0.92 + 0.08;
          const lvl = Math.min(3, Math.max(0, Math.floor(lam * 3.7 + b - 0.35)));
          const cl = cloud[tv + u2];
          const c = (cl === 2 || (cl === 1 && b < 0.5) ? CLOUD : PAL[land[tv + u1]])[lvl];
          data[k] = c[0]; data[k + 1] = c[1]; data[k + 2] = c[2]; data[k + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    }
    sliced(TH, (v) => {
        const lat = (v / (TH - 1) - 0.5) * Math.PI;
        for (let u = 0; u < TW; u++) {
          const lon = (u / TW) * TAU, x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
          const n = fbm(x * 1.7, y * 1.7, z * 1.7, 5), m = fbm(x * 2.8 + 4, y * 2.8, z * 2.8, 3);
          const i = v * TW + u;
          land[i] = n > 0.53 ? (m > 0.5 ? 2 : 1) : 0;
          if (Math.abs(lat) > 1.28 + (m - 0.5) * 0.4) land[i] = 3;
          const warp = fbm(x * 2, y * 2, z * 2, 2) * 2.4;
          const c = fbm(x * 3 + warp, y * 4, z * 3 - warp, 4);
          cloud[i] = c > 0.6 ? 2 : c > 0.54 ? 1 : 0;
        }
    }).then(() => { ready = true; draw(); });

    const wrap = $(".planet-wrap");
    let drag = null;
    wrap.addEventListener("pointerdown", (e) => { drag = e.clientX; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener("pointermove", (e) => { if (drag === null) return; vel += (e.clientX - drag) * 0.0016; drag = e.clientX; });
    const end = () => (drag = null);
    wrap.addEventListener("pointerup", end); wrap.addEventListener("pointercancel", end);

    function tick(now) {
      if (!visible("orbit")) return;
      const sec = Math.floor((now - st.born) / 1000);
      if (sec !== lastSec) {
        lastSec = sec;
        tc.textContent = `SP ${Math.floor(sec / 3600)}:${String(Math.floor(sec / 60) % 60).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
      }
      if (!ready) return;
      rot += (reduced ? 0 : 0.0035) + vel; vel *= 0.94;
      if (frame++ % (LOW ? 3 : 2) === 0 || Math.abs(vel) > 0.002) draw();
    }
    return { tick };
  }

  // ───────────────────────── 03 WORK ─────────────────────────
  function makeWork(scroller) {
    const stage = $(".work-stage"), track = $("[data-track]");
    const hud = $(".hud"), walker = $(".walker-street");
    const HUD = {
      index: $("[data-hud-index]", hud), total: $("[data-hud-total]", hud), track: $("[data-hud-track]", hud),
      title: $("[data-hud-title]", hud), blurb: $("[data-hud-blurb]", hud), why: $("[data-hud-why]", hud),
      stack: $("[data-hud-stack]", hud), links: $("[data-hud-links]", hud),
    };
    const moreCount = 31 - PROJ.length;
    const entries = [
      ...PROJ,
      {
        name: `+${moreCount}`, full: `+${moreCount} more on GitHub`, track: "The rest of the city",
        blurb: "Visual explainers, a QR security system on Lambda, a YouTube auto-reload extension, a Next.js telemetry dashboard, a CUDA edge detector and more.",
        why: "Most of these started as small fixes for something that annoyed me.",
        stack: ["Python", "TypeScript", "C++", "CUDA"],
        links: [{ label: "Browse all repos", href: SITE.github + "?tab=repositories" }],
        more: true,
      },
    ];
    HUD.total.textContent = String(entries.length).padStart(2, "0");
    const linkFor = (p) => (p.links[0] ? p.links[0].href : `mailto:${SITE.email}?subject=${encodeURIComponent(p.full + " — repo access")}`);
    const towers = entries.map((p, i) => {
      const a = document.createElement("a");
      a.className = "tower" + (p.more ? " tower-more" : "");
      a.style.setProperty("--h", p.more ? 0.5 : p.height);
      a.href = linkFor(p);
      if (p.links[0]) { a.target = "_blank"; a.rel = "noopener"; }
      a.dataset.hover = "OPEN";
      a.setAttribute("aria-label", `${p.full}. ${p.track}`);
      a.innerHTML = p.more
        ? `<div class="t-crown crown-flat"><i></i><i></i><i></i></div><div class="t-body"><span>${p.name}<br>MORE</span></div><div class="t-base">GitHub ${ARROW}</div>`
        : `<div class="t-crown crown-${p.crown}"><i></i><i></i><i></i></div>
           <div class="t-body"><div class="t-windows"></div><div class="t-side"></div><div class="t-lit"></div>
           <div class="t-band"><span class="t-name">${p.name}</span></div><span class="t-num">${String(i + 1).padStart(2, "0")}</span></div>
           <div class="t-base">${p.stat}</div>`;
      track.appendChild(a);
      return a;
    });
    const skyline = (seed, color, windows) => {
      const r = rng(seed);
      let x = 0, rects = "";
      while (x < 3000) {
        const w = 40 + r() * 120, h = 220 + r() * 740;
        rects += `<rect x="${x.toFixed(1)}" y="${(1000 - h).toFixed(1)}" width="${(w + 0.6).toFixed(1)}" height="${h.toFixed(1)}"/>`;
        if (r() < 0.22) rects += `<rect x="${(x + w / 2 - 2).toFixed(1)}" y="${(1000 - h - 70 - r() * 90).toFixed(1)}" width="4" height="200"/>`;
        x += w + (r() < 0.35 ? 6 + r() * 30 : 0);
      }
      const pat = windows ? `<defs><pattern id="win${seed}" width="18" height="26" patternUnits="userSpaceOnUse"><rect x="5" y="6" width="7" height="11" fill="${windows}"/></pattern></defs>` : "";
      return `<svg viewBox="0 0 3000 1000" preserveAspectRatio="none">${pat}<g fill="${color}">${rects}</g>${windows ? `<g fill="url(#win${seed})">${rects}</g>` : ""}</svg>`;
    };
    $(".skyline-far").innerHTML = skyline(12, "#152ab6");
    $(".skyline-mid").innerHTML = skyline(34, "#2944e2", "#3c5cf4");

    let centers = [], D = 1, W = innerWidth, H = innerHeight, cur = -1;
    const measureCtx = document.createElement("canvas").getContext("2d");
    function layout() {
      W = innerWidth; H = stage.clientHeight;
      measureCtx.font = '900 100px "Big Shoulders Display"';
      // read every size first, then write, so the browser lays out once
      const dims = towers.map((t, i) => {
        if (entries[i].more) return null;
        const band = $(".t-band", t), lit = $(".t-lit", t);
        return { band: [band.clientWidth, band.clientHeight], lit: [lit.clientWidth, lit.clientHeight] };
      });
      towers.forEach((t, i) => {
        if (!dims[i]) return;
        const tw = measureCtx.measureText(entries[i].name).width || 300;
        const fs = Math.min(dims[i].band[0] * 1.08, ((dims[i].band[1] - 14) / tw) * 100);
        $(".t-name", t).style.setProperty("--fs", `${Math.max(14, fs).toFixed(1)}px`);
      });
      litDims = dims;
      centers = towers.map((t) => t.offsetLeft + t.offsetWidth / 2);
      D = Math.max(1, centers[centers.length - 1] - centers[0]);
      M.work.el.style.height = `${Math.round(D * 1.25 + H)}px`;
    }
    // lit windows are only seen on the street, so they're built after the page opens
    let litDims = [];
    function lightWindows() {
      return sliced(towers.length, (i) => {
        const d = litDims[i];
        if (!d) return;
        const r = rng(i * 97 + 5), cols = Math.floor(d.lit[0] / 16), rows = Math.floor(d.lit[1] / 14);
        let html = "";
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          if (r() < (LOW ? 0.2 : 0.33)) html += `<b style="left:${x * 16 + 4}px;top:${y * 14 + 5}px;--d:${Math.floor(r() * 650)}ms"></b>`;
        }
        $(".t-lit", towers[i]).innerHTML = html;
      });
    }
    const towerY = (i) => M.work.top + ((centers[i] - centers[0]) / D) * (M.work.h - st.H);
    function show(i) {
      if (i === cur) return;
      if (cur >= 0) towers[cur].classList.remove("is-active");
      towers[i].classList.add("is-active");
      cur = i;
      const p = entries[i];
      HUD.index.textContent = String(i + 1).padStart(2, "0");
      HUD.track.textContent = p.track;
      HUD.title.textContent = p.full;
      HUD.blurb.textContent = p.blurb;
      HUD.why.textContent = p.why;
      HUD.stack.innerHTML = p.stack.join("<i>/</i>");
      HUD.links.innerHTML = p.links.length
        ? p.links.map((l) => `<a href="${l.href}" target="_blank" rel="noopener" data-hover="OPEN">${l.label} ${ARROW}</a>`).join("")
        : `<span>${p.note || "Private"}</span><a href="${linkFor(p)}" data-hover="ASK">Request access →</a>`;
      swapIn(hud, -10, 0);
    }
    track.addEventListener("click", (e) => {
      const t = e.target.closest(".tower");
      if (!t) return;
      const i = towers.indexOf(t);
      if (i !== cur) { e.preventDefault(); scroller.to(towerY(i)); }
    });
    track.addEventListener("focusin", (e) => {
      const i = towers.indexOf(e.target.closest(".tower"));
      if (i >= 0 && i !== cur) scroller.to(towerY(i));
    });
    let lastY = 0, stillSince = 0;
    function tick(now) {
      const { p, visible } = pin("work");
      if (!visible) { lastY = st.sy; return; }
      const tx = (-(centers[0] - W / 2) - p * D).toFixed(1);
      setVar(track, "--tx", `${tx}px`);
      setVar(stage, "--tx", `${tx}px`);
      setVar(stage, "--tx-far", `${(tx * 0.22).toFixed(1)}px`);
      setVar(stage, "--tx-mid", `${(tx * 0.48).toFixed(1)}px`);
      setVar(stage, "--p", p.toFixed(3));
      if (!reduced && finePointer) {
        setVar(stage, "--mx1", `${(-st.mx * 12).toFixed(1)}px`); setVar(stage, "--my1", `${(-st.my * 6).toFixed(1)}px`);
        setVar(stage, "--mx2", `${(-st.mx * 26).toFixed(1)}px`); setVar(stage, "--my2", `${(-st.my * 10).toFixed(1)}px`);
        setVar(stage, "--mx3", `${(st.mx * 40).toFixed(1)}px`); setVar(stage, "--my3", `${(st.my * 24).toFixed(1)}px`);
      }
      let best = 0, bd = Infinity;
      centers.forEach((c, i) => { const d = Math.abs(c + +tx - W / 2); if (d < bd) { bd = d; best = i; } });
      show(best);
      const dy = st.sy - lastY;
      lastY = st.sy;
      if (Math.abs(dy) > 0.4) { stillSince = now; walker.classList.toggle("flip", dy < 0); }
      walker.classList.toggle("walking", !reduced && now - stillSince < 160);
    }
    return { layout, lightWindows, tick, snaps: () => towers.map((_, i) => towerY(i)) };
  }

  // ───────────────────────── 04 HALLWAY ─────────────────────────
  // An enfilade of rooms joined by arched doorways, drawn in true perspective.
  // You arrive half-asleep and come to your senses as you walk. The haze is the
  // scene rendered at low resolution and scaled up, so being blurry is cheaper, not dearer.
  function makeHallway() {
    const stage = $(".hall-stage");
    const cv = $(".hall-canvas"), ctx = cv.getContext("2d");
    const read = $(".hall-read");
    const R = {
      idx: $("[data-hall-idx]", read), kick: $("[data-hall-kick]", read), big: $("[data-hall-big]", read),
      label: $("[data-hall-label]", read), sub: $("[data-hall-sub]", read), steps: $("[data-hall-steps]", read),
    };
    const items = [
      ...SIG.map((s) => ({ big: s.big, label: s.label, sub: s.sub })),
      { big: String(CRED.length).padStart(2, "0"), label: "Certifications", sub: CRED.join(" · ") },
    ];
    const intro = { big: "Keep walking.", label: "", sub: "Patents, a hackathon, an internship and a shipped product, one room at a time." };
    R.steps.innerHTML = items.map(() => "<li></li>").join("");
    const stepEls = [...R.steps.children];

    const SP = 6.4, T = 0.8, HW = 1.2, SPRING = 2.45, RW = 7.6, RH = 5.4, EYE = 1.62, NEAR = 0.2, AHEAD = LOW ? 8 : 11;
    const LEN = (items.length + 1.2) * SP;
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const CREAM = [239, 228, 204], COB = [29, 54, 214], FOG = [236, 239, 255], LAMP = [255, 251, 232];
    const C = {
      face: CREAM, reveal: mix(CREAM, COB, 0.52), side: mix(CREAM, COB, 0.2), ceil: mix(CREAM, COB, 0.34),
      floor: mix(CREAM, COB, 0.09), line: mix(CREAM, COB, 0.5), hole: mix(CREAM, COB, 0.8), num: mix(COB, [10, 20, 102], 0.25),
    };
    const col = (c, d) => { const m = mix(c, FOG, 1 - Math.exp(-Math.max(0, d) * 0.038)); return `rgb(${m[0] | 0},${m[1] | 0},${m[2] | 0})`; };
    const noise = makeNoise(ctx, 8, 0.975, 14);
    const BASE = Math.min(DPR, 1.25);
    let W, H, f, vignette, scale = 0, lastKey = "";
    const cam = { x: 0, y: EYE, z: 0 };
    function resize() {
      W = cv.clientWidth; H = cv.clientHeight;
      f = Math.min(W * 0.72, H * 0.92);
      scale = 0; lastKey = "";
    }
    function setScale(s) {
      if (s === scale) return;
      scale = s;
      cv.width = Math.max(2, Math.round(W * s)); cv.height = Math.max(2, Math.round(H * s));
      vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
      vignette.addColorStop(0, "rgba(29,54,214,0)"); vignette.addColorStop(1, "rgba(29,54,214,.42)");
      lastKey = "";
    }
    const P = (x, y, z) => { const k = f / (z - cam.z); return [W / 2 + (x - cam.x) * k, H / 2 - (y - cam.y) * k]; };
    function poly(pts, fill) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    }
    // a wall only needs painting inside its room's cross-section; the room in front covers the rest
    function wallMinusDoor(z, fill) {
      const k = f / (z - cam.z);
      const xl = W / 2 + (-HW - cam.x) * k, xr = W / 2 + (HW - cam.x) * k;
      const yb = H / 2 + cam.y * k, ys = H / 2 - (SPRING - cam.y) * k;
      const rx0 = Math.max(-2, W / 2 + (-RW / 2 - cam.x) * k - 1), rx1 = Math.min(W + 2, W / 2 + (RW / 2 - cam.x) * k + 1);
      const ry0 = Math.max(-2, H / 2 - (RH - cam.y) * k - 1), ry1 = Math.min(H + 2, yb + 1);
      const p = new Path2D();
      p.rect(rx0, ry0, rx1 - rx0, ry1 - ry0);
      p.moveTo(xl, yb); p.lineTo(xl, ys); p.arc((xl + xr) / 2, ys, HW * k, Math.PI, 0, false); p.lineTo(xr, yb); p.closePath();
      ctx.fillStyle = fill; ctx.fill(p, "evenodd");
    }
    function grad(a, b, c, dA, dB) {
      const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
      g.addColorStop(0, col(c, dA)); g.addColorStop(1, col(c, dB));
      return g;
    }
    function room(zA, zB, detail) {
      const za = Math.max(zA, cam.z + NEAR);
      if (zB <= za) return;
      const dA = za - cam.z, dB = zB - cam.z, L = -RW / 2, Rx = RW / 2;
      poly([P(L, 0, za), P(Rx, 0, za), P(Rx, 0, zB), P(L, 0, zB)], grad(P(0, 0, za), P(0, 0, zB), C.floor, dA, dB));
      poly([P(L, RH, za), P(Rx, RH, za), P(Rx, RH, zB), P(L, RH, zB)], grad(P(0, RH, za), P(0, RH, zB), C.ceil, dA, dB));
      poly([P(L, 0, za), P(L, RH, za), P(L, RH, zB), P(L, 0, zB)], grad(P(L, 2, za), P(L, 2, zB), C.side, dA, dB));
      poly([P(Rx, 0, za), P(Rx, RH, za), P(Rx, RH, zB), P(Rx, 0, zB)], grad(P(Rx, 2, za), P(Rx, 2, zB), C.side, dA, dB));
      if (detail) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = col(C.line, (dA + dB) / 2);
        ctx.beginPath();
        for (let z = Math.ceil(za); z < zB; z += 1.1) { const a = P(L, 0, z), b = P(Rx, 0, z); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
        for (let x = L + 1.1; x < Rx; x += 1.1) { const a = P(x, 0, za), b = P(x, 0, zB); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
        ctx.stroke();
      }
      const mid = (zA + zB) / 2;
      if (mid - 1.3 > cam.z + NEAR) poly([P(-0.7, RH, mid - 1.3), P(0.7, RH, mid - 1.3), P(0.7, RH, mid + 1.3), P(-0.7, RH, mid + 1.3)], col(LAMP, mid - cam.z));
      if (mid - 1.1 > cam.z + NEAR) {
        for (const x of [L, Rx]) {
          const pts = [P(x, 0, mid - 1.1)];
          for (let i = 0; i <= 10; i++) { const t = (i / 10) * Math.PI; pts.push(P(x, 2.1 + Math.sin(t) * 1.1, mid - Math.cos(t) * 1.1)); }
          pts.push(P(x, 0, mid + 1.1));
          poly(pts, col(C.hole, mid - cam.z));
        }
      }
    }
    function engrave(text, z, size) {
      const d = z - cam.z, [x, y] = P(0, (SPRING + HW + RH) / 2 + 0.05, z);
      ctx.font = `900 ${(size * f / d).toFixed(1)}px "Big Shoulders Display"`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = col(C.num, d);
      ctx.fillText(text, x, y);
    }
    function render() {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.fillStyle = col(CREAM, 999); ctx.fillRect(0, 0, W, H);
      const kc = Math.floor((cam.z - T) / SP), kMax = kc + AHEAD;
      wallMinusDoor(kMax * SP, col(C.face, kMax * SP - cam.z));
      for (let k = kMax - 1; k >= kc; k--) {
        room(k * SP + T, (k + 1) * SP, k - kc < 5);
        const zf = k * SP, zb = zf + T;
        if (zb - cam.z > NEAR) wallMinusDoor(zb, col(C.reveal, zb - cam.z));
        if (zf - cam.z > NEAR) {
          wallMinusDoor(zf, col(C.face, zf - cam.z));
          if (k >= 1 && k <= items.length && finePointer) engrave(items[k - 1].big, zf, 1.05);
          else if (k === 0) engrave("SIGNALS", zf, 0.9);
        }
      }
      ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (scale >= BASE * 0.99 && finePointer) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = noise; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = "source-over";
      } else if (scale < BASE * 0.99 && "filter" in ctx) {
        // soften the small frame before CSS scales it up: haze instead of blocks
        if (soft.width !== cv.width || soft.height !== cv.height) { soft.width = cv.width; soft.height = cv.height; }
        sctx.clearRect(0, 0, soft.width, soft.height);
        sctx.drawImage(cv, 0, 0);
        ctx.filter = "blur(1.6px)";
        ctx.drawImage(soft, 0, 0);
        ctx.filter = "none";
      }
    }
    const soft = document.createElement("canvas"), sctx = soft.getContext("2d");
    let cur = -2;
    function show(i) {
      if (i === cur) return;
      cur = i;
      const it = i === 0 ? intro : items[i - 1];
      R.idx.textContent = i === 0 ? "04" : `04.${i}`;
      R.kick.textContent = i === 0 ? "Signals" : `Room ${i} of ${items.length}`;
      R.big.textContent = it.big;
      R.label.textContent = it.label;
      R.sub.textContent = it.sub;
      stepEls.forEach((li, k) => li.classList.toggle("on", k < i));
      swapIn(read, 0, 8);
    }
    // resting spot for room k: just through the previous doorway, next arch ahead
    const roomP = (k) => (k === 0 ? 0 : ((k - 1) * SP + 1.2 + 3.2) / LEN);
    function tick() {
      const { p, visible } = pin("hallway");
      if (!visible) return;
      cam.z = -3.2 + p * LEN;
      cam.x = (reduced || !finePointer ? 0 : st.mx * 0.5) + Math.sin(cam.z * 0.9) * 0.04;
      cam.y = EYE + Math.abs(Math.sin(cam.z * 1.6)) * 0.03;
      const focus = reduced ? 1 : smooth(0.0, roomP(1) * 0.95, p);
      setScale(focus > 0.97 ? BASE : focus > 0.75 ? 0.5 : focus > 0.5 ? 0.3 : focus > 0.25 ? 0.18 : 0.1);
      const key = `${cam.x.toFixed(3)}|${cam.z.toFixed(3)}|${scale}`;
      if (key !== lastKey) { lastKey = key; render(); }
      setVar(stage, "--haze", (0.12 + 0.88 * (1 - focus)).toFixed(3));
      setVar(stage, "--read-o", (smooth(roomP(1) * 0.5, roomP(1), p) * (1 - smooth(0.92, 0.98, p))).toFixed(3));
      setVar(stage, "--hflash", smooth(0.9, 1, p).toFixed(3));
      show(cam.z < 0 ? 0 : Math.min(items.length, Math.floor(cam.z / SP) + 1));
    }
    const snaps = () => [0, ...items.map((_, i) => roomP(i + 1))].map((p) => M.hallway.top + p * (M.hallway.h - st.H));
    return { resize, tick, snaps };
  }

  // ───────────────────────── 05 SKY ─────────────────────────
  // Riso-dithered cumulus over cobalt, a traffic light, and road signs that are the links.
  function makeSky() {
    const scene = $(".sky-scene");
    const backCv = $(".sky-back"), frontCv = $(".sky-front");
    const bctx = backCv.getContext("2d"), fctx = frontCv.getContext("2d");
    sprinkle($(".sky-stars"), 50, 314, 0);

    const signs = [
      { label: "RESUME", href: SITE.resume, ext: true, hover: "OPEN" },
      { label: "EMAIL", href: "mailto:" + SITE.email, hover: "WRITE" },
      { label: "GITHUB", href: SITE.github, ext: true, hover: "BROWSE" },
      { label: "LINKEDIN", href: SITE.linkedin, ext: true, hover: "CONNECT" },
    ];
    $("[data-signs]").innerHTML = signs.map((s, i) => {
      const y = 426 + i * 62;
      return `<a class="sign" href="${s.href}"${s.ext ? ' target="_blank" rel="noopener"' : ""} data-hover="${s.hover}" aria-label="${s.label}">
        <g class="sign-plate"><rect x="132" y="${y}" width="174" height="48" rx="3"/>
        <text x="148" y="${y + 31}">${s.label}</text>
        <path d="M262 ${y + 19} h16 v-7 l13 12 l-13 12 v-7 h-16z"/></g></a>`;
    }).join("");

    const bar = [
      { cls: "seg-hatch", w: 24, k: "2025", v: "IEEE CS hackathon win" },
      { cls: "seg-grey", w: 26, k: "Patents", v: "3 published" },
      { cls: "seg-white", w: 28, k: "Now", v: SITE.nowBuilding },
      { cls: "seg-open", w: 22, k: "Next", v: "Your team?" },
    ];
    $("[data-skybar]").innerHTML =
      `<div class="sky-bar-track">${bar.map((b) => `<div class="seg ${b.cls}" style="width:${b.w}%"></div>`).join("")}</div>
       <div class="sky-bar-labels">${bar.map((b) => `<span style="width:${b.w}%"><b>${b.k}</b>${b.v}</span>`).join("")}</div>`;

    const lamps = $$(".lamp");
    let lampHold = false, lampI = 0, lampAt = 0;
    const setLamp = (i) => lamps.forEach((l, k) => l.classList.toggle("on", k === i));
    setLamp(0);
    $$(".sign").forEach((s) => {
      s.addEventListener("pointerenter", () => { lampHold = true; setLamp(2); });
      s.addEventListener("pointerleave", () => { lampHold = false; });
      s.addEventListener("focus", () => { lampHold = true; setLamp(2); });
      s.addEventListener("blur", () => { lampHold = false; });
    });

    const SC = 0.5; // texture pixels are 2 css px: the riso grain
    const PALC = [[243, 236, 218], [180, 193, 242], [100, 124, 228], [46, 72, 212]];
    async function clouds(w, h, seed, banks, under) {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d"), r = rng(seed), circles = [];
      for (const b of banks) {
        for (let i = 0; i < b.n; i++) {
          const u = r() * 2 - 1, prof = 1 - u * u;
          const rad = b.r * h * (0.35 + 0.8 * prof * r() + 0.2 * r());
          circles.push({ x: b.x * w + u * b.w * w * 0.5, y: b.y * h - prof * b.h * h * (0.25 + 0.75 * r()) + rad * 0.4, r: rad, flat: b.flat || 1 });
        }
      }
      circles.sort((a, q) => a.y - q.y);
      await sliced(circles.length, (ci) => {
        const C = circles[ci];
        for (const dx of [-w, 0, w]) {
          const cx = C.x + dx;
          if (cx + C.r < 0 || cx - C.r > w) continue;
          const gr = g.createRadialGradient(cx - C.r * 0.25, C.y - C.r * 0.35 * C.flat, C.r * 0.1, cx, C.y, C.r * 1.08);
          gr.addColorStop(0, "#fff"); gr.addColorStop(0.62, "#f2f2f2"); gr.addColorStop(0.86, "#a8a8a8"); gr.addColorStop(1, "#6a6a6a");
          g.fillStyle = gr; g.beginPath(); g.ellipse(cx, C.y, C.r, C.r * C.flat, 0, 0, TAU); g.fill();
        }
      });
      g.globalCompositeOperation = "source-atop";
      const gy = g.createLinearGradient(0, under[0] * h, 0, under[1] * h);
      gy.addColorStop(0, "rgba(0,0,0,0)"); gy.addColorStop(1, "rgba(0,0,0,.5)");
      g.fillStyle = gy; g.fillRect(0, 0, w, h);
      const id = g.getImageData(0, 0, w, h), d = id.data;
      await sliced(h, (y) => {
        for (let x = 0; x < w; x++) {
          const k = (y * w + x) * 4, a = d[k + 3];
          if (!a) continue;
          const b = BAYER[(y & 3) * 4 + (x & 3)];
          if (a < 250 && a / 255 < b) { d[k + 3] = 0; continue; }
          const v = d[k] / 255 + (b - 0.5) * 0.24 + (r() - 0.5) * 0.16;
          const c2 = v > 0.68 ? PALC[0] : v > 0.5 ? PALC[1] : v > 0.34 ? PALC[2] : PALC[3];
          d[k] = c2[0]; d[k + 1] = c2[1]; d[k + 2] = c2[2]; d[k + 3] = 255;
        }
      });
      g.putImageData(id, 0, 0);
      return c;
    }

    let tw, th, wisps, mids, fronts, margin, ready = false, buildId = 0, dirty = true;
    async function build() {
      const id = ++buildId;
      ready = false;
      const W = backCv.clientWidth, H = backCv.clientHeight;
      tw = Math.ceil(W * SC); th = Math.ceil(H * SC);
      margin = Math.ceil(30 * SC);
      await idle(); if (id !== buildId) return;
      const w1 = await clouds(tw * 2, th, 5, [
        { x: 0.2, y: 0.6, w: 0.2, h: 0.02, r: 0.04, n: 20, flat: 0.28 },
        { x: 0.68, y: 0.54, w: 0.22, h: 0.03, r: 0.045, n: 22, flat: 0.28 },
      ], [0.45, 0.7]);
      await idle(); if (id !== buildId) return;
      const m1 = await clouds(tw * 2, th, 17, [
        { x: 0.08, y: 0.96, w: 0.2, h: 0.2, r: 0.06, n: 40 },
        { x: 0.32, y: 0.95, w: 0.16, h: 0.14, r: 0.05, n: 30 },
        { x: 0.58, y: 0.94, w: 0.22, h: 0.26, r: 0.065, n: 44 },
        { x: 0.84, y: 0.93, w: 0.18, h: 0.2, r: 0.055, n: 36 },
      ], [0.6, 1]);
      await idle(); if (id !== buildId) return;
      const f1 = await clouds(tw + margin * 2, th, 29, [
        { x: 0.8, y: 1.04, w: 0.56, h: 0.66, r: 0.14, n: 90 },
        { x: 0.13, y: 1.2, w: 0.42, h: 0.12, r: 0.09, n: 46 },
        { x: 0.46, y: 1.16, w: 0.3, h: 0.12, r: 0.07, n: 30 },
      ], [0.55, 1.05]);
      if (id !== buildId) return;
      backCv.width = frontCv.width = tw; backCv.height = frontCv.height = th;
      wisps = w1; mids = m1; fronts = f1; ready = true; dirty = true;
    }
    function wrapDraw(ctx, tex, off) {
      const w = tex.width, x0 = -(((off % w) + w) % w);
      ctx.drawImage(tex, Math.round(x0), 0);
      if (x0 + w < tw) ctx.drawImage(tex, Math.round(x0 + w), 0);
    }
    let frame = 0;
    const drift = !reduced && !LOW;
    function tick(now) {
      if (!visible("sky")) return;
      const top = M.sky.top - st.sy;
      const q = clamp(1 - top / st.H);
      setVar(scene, "--kit-y", `${((1 - q) * 120).toFixed(0)}px`);
      setVar(scene, "--front-y", `${((1 - q) * 70).toFixed(0)}px`);
      if (!lampHold && now - lampAt > 2200) { lampAt = now; lampI = (lampI + 1) % 3; setLamp(lampI); }
      if (!ready) return;
      if (!drift && !dirty) return;
      if (drift && frame++ % 3) return;
      dirty = false;
      const t = drift ? now / 1000 : 0;
      bctx.clearRect(0, 0, tw, th);
      wrapDraw(bctx, wisps, t * 2.2 + st.mx * 6);
      wrapDraw(bctx, mids, t * 1.1 + st.mx * 10);
      fctx.clearRect(0, 0, tw, th);
      fctx.drawImage(fronts, Math.round(-margin - st.mx * margin * 0.9), 0);
    }
    return { build, tick, snaps: () => [M.sky.top + st.H * 0.35] };
  }

  // ───────────────────────── rail + nav tone ─────────────────────────
  function makeRail() {
    const items = $$(".rail li");
    const themeMeta = $("[data-theme-color]");
    const THEME = { city: "#1d36d6", orbit: "#030308", work: "#1d36d6", hallway: "#e9ebf6", sky: "#1d36d6" };
    let on = "", tone = "", theme = "";
    return {
      tick() {
        const y = st.sy, mid = y + st.H * 0.5;
        let id = "city";
        for (const k of IDS) if (M[k].top <= mid && M[k].top + M[k].h > mid) id = k;
        const hall = M.hallway, sky = M.sky;
        const t = (y + 60 >= hall.top && y + 60 < hall.top + hall.h) || (y + 60 >= sky.top && y < sky.top + st.H * 0.22) ? "dark" : "light";
        if (t !== tone) { tone = t; root.dataset.tone = t; }
        const top = IDS.slice().reverse().find((k) => M[k].top <= y + 2) || "city";
        let c = THEME[top];
        if (top === "city" && y > M.city.top + (M.city.h - st.H) * 0.7) c = "#05061a";
        if (top === "sky" && y + st.H >= root.scrollHeight - 4) c = "#0a1466";
        if (c !== theme) { theme = c; themeMeta.setAttribute("content", c); }
        if (id === on) return;
        on = id;
        items.forEach((li) => li.classList.toggle("on", li.dataset.for === id));
      },
    };
  }

  // ───────────────────────── boot ─────────────────────────
  // Open fast: fonts get a short grace period, the city and page layout build, and the
  // curtain lifts. The planet and clouds finish building in idle time behind it.
  async function boot() {
    scrollTo(0, 0);
    fillContent();
    measure();
    const scroller = makeScroller();
    const cursor = makeCursor();
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    $$(".reveal").forEach((el) => io.observe(el));

    Loader.set(15, "Waking up");
    if (document.fonts) await Promise.race([document.fonts.ready, wait(600)]);
    Loader.set(45, "Raising the city");
    const City = makeCity(); City.resize();
    Loader.set(70, "Walking the street");
    const Work = makeWork(scroller); Work.layout();
    const Hall = makeHallway(); Hall.resize();
    const Rail = makeRail();
    let Orbit = null, Sky = null;
    measure();

    const refreshSnaps = () => scroller.setSnaps([0, M.orbit.top, ...Work.snaps(), ...Hall.snaps(), ...(Sky ? Sky.snaps() : [])]);
    refreshSnaps();

    let rt, lastW = innerWidth;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        st.W = innerWidth; st.H = innerHeight;
        City.resize(); Hall.resize();
        if (innerWidth !== lastW) { lastW = innerWidth; Work.layout(); Work.lightWindows(); if (Sky) Sky.build(); }
        measure(); refreshSnaps();
      }, 140);
    });
    if (document.fonts) document.fonts.ready.then(() => { Work.layout(); measure(); refreshSnaps(); });

    function frame(now) {
      st.sy = scrollY;
      const k = reduced ? 1 : 0.07;
      st.mx += (st.tmx - st.mx) * k; st.my += (st.tmy - st.my) * k;
      scroller.tick(now);
      st.sy = scrollY;
      cursor.tick();
      City.tick(now);
      if (Orbit) Orbit.tick(now);
      Work.tick(now);
      Hall.tick(now);
      if (Sky) Sky.tick(now);
      Rail.tick();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    Loader.set(100, "Ready");
    await Loader.finish();
    st.t0 = performance.now();
    if (!reduced) root.classList.add("intro");

    await idle();
    Orbit = makeOrbit();
    Work.lightWindows();
    await idle();
    Sky = makeSky(); Sky.build();
    refreshSnaps();
  }
  boot();
})();
