(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  /* ---------------- Game data ---------------- */
  // Placeholder catalogue: swap in your real games, Roblox place IDs and stats.
  const GAMES = [
    {
      id: "skyforge",
      title: "Skyforge Odyssey",
      genre: "adventure",
      tags: ["Adventure", "Co-op"],
      hot: true,
      players: 21400,
      visits: "640M",
      rating: "94%",
      desc: "Chart floating islands, forge legendary gear, and take down sky titans with up to six friends. Weekly world events reshape the map.",
      palette: ["#2b1a6b", "#7c5cff", "#00e5ff", "#ffd36e"],
      seed: 3,
      feature: true,
    },
    {
      id: "neon",
      title: "Neon Rush",
      genre: "pvp",
      tags: ["PvP", "Racing"],
      players: 9800,
      visits: "310M",
      rating: "92%",
      desc: "High-speed hoverboard races through a synthwave city. Ranked seasons, custom boards, and zero pay-to-win.",
      palette: ["#1a0630", "#ff4fd8", "#00e5ff", "#ffffff"],
      seed: 11,
    },
    {
      id: "petverse",
      title: "Petverse Tycoon",
      genre: "simulator",
      tags: ["Simulator", "Pets"],
      hot: true,
      players: 11200,
      visits: "520M",
      rating: "95%",
      desc: "Hatch, raise and trade over 400 pets, then build the theme park of your dreams for them to live in.",
      palette: ["#0b2a2a", "#2dff8a", "#ffd36e", "#ff8fa3"],
      seed: 7,
    },
    {
      id: "hollow",
      title: "Hollow Lights",
      genre: "adventure",
      tags: ["Horror", "Story"],
      players: 3100,
      visits: "120M",
      rating: "91%",
      desc: "A co-op horror mystery set in an abandoned lighthouse. Every chapter is shaped by community theories.",
      palette: ["#05060d", "#253a73", "#9bd1ff", "#ffe08a"],
      seed: 19,
    },
    {
      id: "block",
      title: "Block Party",
      genre: "social",
      tags: ["Social", "Music"],
      players: 2700,
      visits: "95M",
      rating: "89%",
      desc: "Build a stage, drop a beat, and throw the biggest party on Roblox. Live DJ events every Friday.",
      palette: ["#1d0a2e", "#ff4fd8", "#ffd36e", "#7c5cff"],
      seed: 23,
    },
  ];

  /* ---------------- Loader ---------------- */
  document.body.classList.add("loading");
  const loader = $("#loader");
  const loaderPct = $("#loaderPct");
  let pct = 0;
  const loadTick = setInterval(() => {
    pct = Math.min(100, pct + Math.ceil(Math.random() * 14));
    loaderPct.textContent = pct;
    if (pct >= 100) finishLoad();
  }, reduceMotion ? 1 : 60);

  function finishLoad() {
    clearInterval(loadTick);
    loader.classList.add("done");
    document.body.classList.remove("loading");
    requestAnimationFrame(() => document.body.classList.add("ready"));
    $$("[data-scramble]").forEach((el, i) => setTimeout(() => scramble(el), 250 + i * 150));
  }

  /* ---------------- Text scramble ---------------- */
  function scramble(el) {
    if (reduceMotion) return;
    const final = el.textContent;
    const chars = "▓▒░<>/\\[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let frame = 0;
    const total = 24;
    const step = () => {
      el.textContent = final
        .split("")
        .map((c, i) => {
          if (c === " ") return " ";
          return frame / total > i / final.length ? c : chars[(Math.random() * chars.length) | 0];
        })
        .join("");
      if (frame++ < total) requestAnimationFrame(step);
      else el.textContent = final;
    };
    step();
  }

  /* ---------------- Hero portal (canvas particles) ---------------- */
  const portal = $("#portal");
  const pctx = portal.getContext("2d");
  let pw, ph, dpr, particles = [];
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const COLORS = ["124,92,255", "0,229,255", "255,79,216"];

  function sizePortal() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    pw = portal.clientWidth;
    ph = portal.clientHeight;
    portal.width = pw * dpr;
    portal.height = ph * dpr;
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(900, Math.floor((pw * ph) / 1800));
    particles = Array.from({ length: count }, makeParticle);
  }
  function makeParticle() {
    return {
      a: Math.random() * Math.PI * 2,
      r: 0.25 + Math.random() * 1.1,
      speed: 0.0008 + Math.random() * 0.003,
      size: Math.random() * 1.8 + 0.3,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      drift: Math.random() * 0.0015 + 0.0004,
    };
  }
  window.addEventListener("pointermove", (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  });

  let t = 0;
  let heroVisible = true;
  new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(portal);

  function drawPortal() {
    requestAnimationFrame(drawPortal);
    if (!heroVisible) return;
    t += 0.01;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    const cx = pw * (0.5 + (mouse.x - 0.5) * 0.08);
    const cy = ph * (0.48 + (mouse.y - 0.5) * 0.08);
    const R = Math.min(pw, ph) * 0.34;

    pctx.fillStyle = "rgba(7,6,13,0.22)";
    pctx.fillRect(0, 0, pw, ph);

    // glowing core
    const g = pctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.25);
    g.addColorStop(0, "rgba(124,92,255,0.10)");
    g.addColorStop(0.55, "rgba(0,229,255,0.05)");
    g.addColorStop(1, "rgba(7,6,13,0)");
    pctx.fillStyle = g;
    pctx.fillRect(0, 0, pw, ph);

    // ring
    pctx.save();
    pctx.translate(cx, cy);
    pctx.rotate(t * 0.2);
    pctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      pctx.strokeStyle = `rgba(${COLORS[i]},${0.25 - i * 0.06})`;
      pctx.beginPath();
      pctx.ellipse(0, 0, R * (1 + i * 0.04) + Math.sin(t * 2 + i) * 4, R * 0.98 * (1 + i * 0.04), t * (0.3 + i * 0.1), 0, Math.PI * 2);
      pctx.stroke();
    }
    pctx.restore();

    // swirling particles getting pulled into the rift
    for (const p of particles) {
      p.a += p.speed * (1.6 - p.r);
      p.r -= p.drift;
      if (p.r < 0.05) Object.assign(p, makeParticle(), { r: 1.25 });
      const rr = R * p.r;
      const x = cx + Math.cos(p.a) * rr;
      const y = cy + Math.sin(p.a) * rr * 0.92;
      const alpha = Math.min(1, p.r * 1.2) * (p.r < 0.2 ? p.r * 5 : 1);
      pctx.fillStyle = `rgba(${p.c},${alpha})`;
      pctx.fillRect(x, y, p.size, p.size);
    }
  }
  sizePortal();
  pctx.fillStyle = "#07060d";
  pctx.fillRect(0, 0, pw, ph);
  if (!reduceMotion) drawPortal();
  let resizeTO;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      sizePortal();
      if (reduceMotion) drawStaticPortal();
    }, 150);
  });
  function drawStaticPortal() {
    const g = pctx.createRadialGradient(pw / 2, ph / 2, 0, pw / 2, ph / 2, Math.min(pw, ph) * 0.45);
    g.addColorStop(0, "rgba(124,92,255,0.35)");
    g.addColorStop(1, "rgba(7,6,13,1)");
    pctx.fillStyle = g;
    pctx.fillRect(0, 0, pw, ph);
  }
  if (reduceMotion) drawStaticPortal();

  /* ---------------- Procedural game art ---------------- */
  function rng(seed) {
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }
  function paintArt(canvas, game) {
    const w = (canvas.width = canvas.clientWidth * 2 || 800);
    const h = (canvas.height = canvas.clientHeight * 2 || 1000);
    const c = canvas.getContext("2d");
    const r = rng(game.seed * 9973);
    const [bg, a, b, accent] = game.palette;

    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, bg);
    sky.addColorStop(0.6, a);
    sky.addColorStop(1, b);
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);

    // stars
    for (let i = 0; i < 120; i++) {
      c.fillStyle = `rgba(255,255,255,${r() * 0.8})`;
      c.fillRect(r() * w, r() * h * 0.5, 2, 2);
    }
    // sun / moon
    const sx = w * (0.25 + r() * 0.5), sy = h * (0.22 + r() * 0.15), sr = Math.min(w, h) * (0.1 + r() * 0.08);
    const sun = c.createRadialGradient(sx, sy, 0, sx, sy, sr * 3);
    sun.addColorStop(0, accent);
    sun.addColorStop(0.3, accent + "88");
    sun.addColorStop(1, "transparent");
    c.fillStyle = sun;
    c.fillRect(0, 0, w, h);

    // layered blocky skyline — a nod to Roblox's voxel look
    for (let layer = 0; layer < 4; layer++) {
      const base = h * (0.55 + layer * 0.11);
      const shade = 1 - layer * 0.22;
      c.fillStyle = `rgba(${Math.round(10 * shade)},${Math.round(8 * shade)},${Math.round(22 * shade)},${0.45 + layer * 0.18})`;
      let x = 0;
      while (x < w) {
        const bw = 30 + r() * 120;
        const bh = (40 + r() * 220) * (1 - layer * 0.15);
        c.fillRect(x, base - bh, bw, h);
        // windows / gems
        if (layer > 0 && r() > 0.4) {
          c.fillStyle = (r() > 0.5 ? b : accent) + "cc";
          for (let k = 0; k < 4; k++) c.fillRect(x + 8 + r() * (bw - 20), base - bh + 10 + r() * bh * 0.6, 6, 6);
          c.fillStyle = `rgba(${Math.round(10 * shade)},${Math.round(8 * shade)},${Math.round(22 * shade)},${0.45 + layer * 0.18})`;
        }
        x += bw + r() * 10;
      }
    }
    // floating cubes
    for (let i = 0; i < 7; i++) {
      const s = 14 + r() * 50, x = r() * w, y = r() * h * 0.55;
      c.save();
      c.translate(x, y);
      c.rotate(r() * Math.PI);
      c.fillStyle = (r() > 0.5 ? b : accent) + "dd";
      c.fillRect(-s / 2, -s / 2, s, s);
      c.restore();
    }
  }

  /* ---------------- Games grid ---------------- */
  const grid = $("#gamesGrid");
  grid.innerHTML = GAMES.map(
    (g) => `
    <article class="game reveal${g.feature ? " feature" : ""}" data-id="${g.id}" data-genre="${g.genre}" tabindex="0" role="button" aria-label="Open ${g.title}" style="--glow:${g.palette[2]}aa">
      <div class="game-art"><canvas></canvas></div>
      <span class="game-play" aria-hidden="true">▶</span>
      <div class="game-info">
        <div class="game-tags">${g.hot ? '<span class="tag hot">🔥 Trending</span>' : ""}${g.tags.map((x) => `<span class="tag">${x}</span>`).join("")}</div>
        <h3>${g.title}</h3>
        <div class="game-meta">
          <span><b class="players" data-base="${g.players}">${fmt(g.players)}</b> playing</span>
          <span><b>${g.visits}</b> visits</span>
          <span><b>${g.rating}</b> 👍</span>
        </div>
      </div>
    </article>`
  ).join("");

  const artCanvases = $$(".game-art canvas");
  const paintAll = () => artCanvases.forEach((cv, i) => paintArt(cv, GAMES[i]));
  requestAnimationFrame(paintAll);
  window.addEventListener("resize", () => {
    clearTimeout(paintAll.to);
    paintAll.to = setTimeout(paintAll, 200);
  });

  // filters
  $$(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      $$(".chip").forEach((c) => {
        c.classList.toggle("active", c === chip);
        c.setAttribute("aria-selected", c === chip);
      });
      const f = chip.dataset.filter;
      $$(".game").forEach((card) => {
        const show = f === "all" || card.dataset.genre === f;
        card.classList.toggle("hide", !show);
        card.classList.toggle("feature", show && f === "all" && GAMES.find((g) => g.id === card.dataset.id).feature);
      });
      requestAnimationFrame(paintAll);
    })
  );

  // modal
  const modal = $("#gameModal");
  function openGame(id) {
    const g = GAMES.find((x) => x.id === id);
    $("#modalGenre").textContent = g.tags.join(" · ");
    $("#modalTitle").textContent = g.title;
    $("#modalDesc").textContent = g.desc;
    $("#modalStats").innerHTML = `
      <div><b>${fmt(livePlayers[id])}</b><span>Playing now</span></div>
      <div><b>${g.visits}</b><span>Visits</span></div>
      <div><b>${g.rating}</b><span>Liked</span></div>`;
    $("#modalArt").innerHTML = "<canvas></canvas>";
    modal.showModal();
    paintArt($("#modalArt canvas"), g);
  }
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".game");
    if (card) openGame(card.dataset.id);
  });
  grid.addEventListener("keydown", (e) => {
    const card = e.target.closest(".game");
    if (card && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openGame(card.dataset.id);
    }
  });
  $("#modalClose").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => e.target === modal && modal.close());

  /* ---------------- Live player counts ---------------- */
  const livePlayers = Object.fromEntries(GAMES.map((g) => [g.id, g.players]));
  const totalEl = $("#liveNow");
  const chartNow = $("#chartNow");
  function tickPlayers() {
    let total = 0;
    for (const g of GAMES) {
      livePlayers[g.id] = Math.max(100, livePlayers[g.id] + (Math.random() - 0.45) * g.players * 0.01);
      total += livePlayers[g.id];
    }
    $$(".players").forEach((el) => (el.textContent = fmt(livePlayers[el.closest(".game").dataset.id])));
    totalEl.textContent = fmt(total);
    chartNow.textContent = fmt(total);
    return total;
  }

  /* ---------------- Chart ---------------- */
  const POINTS = 48;
  const series = [];
  (() => {
    let v = 28000;
    for (let i = 0; i < POINTS; i++) {
      v += (Math.random() - 0.38) * 1800 + Math.sin(i / 5) * 600;
      series.push(v);
    }
  })();
  function drawChart(drawProgress = 1) {
    const min = Math.min(...series) * 0.9, max = Math.max(...series) * 1.05;
    const n = Math.max(2, Math.ceil(series.length * drawProgress));
    const pts = series.slice(0, n).map((v, i) => [(i / (POINTS - 1)) * 800, 200 - ((v - min) / (max - min)) * 190]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    $("#chartLine").setAttribute("d", d);
    $("#chartArea").setAttribute("d", `${d} L${pts[pts.length - 1][0]},200 L0,200 Z`);
  }
  drawChart(0);
  let chartShown = false;
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    chartShown = true;
    const start = performance.now();
    const anim = (now) => {
      const p = Math.min(1, (now - start) / 1600);
      drawChart(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(anim);
    };
    reduceMotion ? drawChart(1) : requestAnimationFrame(anim);
  }, { threshold: 0.3 }).observe($("#chart"));

  tickPlayers();
  setInterval(() => {
    const total = tickPlayers();
    series.shift();
    series.push(total);
    if (chartShown) drawChart(1);
  }, 2200);

  /* ---------------- Reveal on scroll ---------------- */
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  /* ---------------- Counters ---------------- */
  const countIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const dec = +(el.dataset.decimals || 0);
        const suf = el.dataset.suffix || "";
        const start = performance.now();
        const dur = reduceMotion ? 1 : 1800;
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = (target * (1 - Math.pow(1 - p, 4))).toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    { threshold: 0.5 }
  );
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------------- Pointer effects ---------------- */
  if (finePointer && !reduceMotion) {
    const cursor = $("#cursor"), dot = $("#cursorDot");
    let cx = 0, cy = 0, x = 0, y = 0;
    window.addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    });
    (function loop() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      cursor.classList.toggle("hover", !!e.target.closest("a, button, .game, summary, .chip"));
    });

    // 3D tilt + spotlight
    const tiltTargets = () => $$(".game, .tilt");
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest(".game, .tilt");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width, py = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      const amt = el.classList.contains("game") ? 8 : 4;
      el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * amt}deg) rotateY(${(px - 0.5) * amt}deg)`;
    });
    tiltTargets().forEach((el) => el.addEventListener("pointerleave", () => (el.style.transform = "")));

    // magnetic buttons
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });
  }

  /* ---------------- Nav ---------------- */
  const nav = $("#nav");
  let lastY = 0;
  window.addEventListener(
    "scroll",
    () => {
      const yy = window.scrollY;
      nav.classList.toggle("scrolled", yy > 40);
      nav.classList.toggle("hidden", yy > lastY && yy > 400 && !navLinks.classList.contains("open"));
      lastY = yy;
    },
    { passive: true }
  );
  const toggle = $("#navToggle"), navLinks = $("#navLinks");
  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      navLinks.classList.remove("open");
      toggle.setAttribute("aria-expanded", false);
    }
  });

  /* ---------------- Contact form ---------------- */
  const form = $("#contactForm"), status = $("#formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["name", "email", "msg"].forEach((id) => {
      const input = $("#" + id);
      const valid = input.value.trim() && (input.type !== "email" || /^\S+@\S+\.\S+$/.test(input.value));
      input.parentElement.classList.toggle("error", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      status.style.color = "#ff5470";
      status.textContent = "Please fill in the highlighted fields.";
      return;
    }
    // No backend yet: hook this up to Formspree, a serverless function, or your own API.
    status.style.color = "";
    status.textContent = `Thanks, ${$("#name").value.trim().split(" ")[0]}! We'll be in touch within 48 hours.`;
    form.reset();
  });

  $("#year").textContent = new Date().getFullYear();
})();
