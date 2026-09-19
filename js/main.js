/* Shared behavior: typing effect, reveals, clock, command palette */

/* ---------- Cipher-scramble text reveal ---------- */
/* Headings tagged [data-scramble] decrypt from random glyphs into their
   real text right as their .reveal ancestor finishes fading in. */
(function scrambleOnReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // leave final text untouched, no animation needed

  const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#$%01";
  const MS_PER_CHAR = 34;
  const LOCK_WINDOW = 240;

  function scrambleReveal(el) {
    if (el.dataset.scrambled) return;
    el.dataset.scrambled = "1";
    const final = el.textContent;
    const len = final.length;
    const total = len * MS_PER_CHAR + LOCK_WINDOW + 80;
    el.classList.add("scrambling");
    const start = performance.now();

    function frame(now) {
      const t = now - start;
      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = final[i];
        if (ch === " ") { out += " "; continue; }
        out += (t >= i * MS_PER_CHAR + LOCK_WINDOW)
          ? ch
          : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
      }
      el.textContent = out;
      if (t < total) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = final;
        el.classList.remove("scrambling");
      }
    }
    requestAnimationFrame(frame);
  }

  revealEls.forEach((el) => {
    el.addEventListener("transitionend", function handler(e) {
      if (e.propertyName !== "opacity") return;
      el.removeEventListener("transitionend", handler);
      const targets = el.matches("[data-scramble]")
        ? [el]
        : [...el.querySelectorAll("[data-scramble]")];
      targets.forEach(scrambleReveal);
    });
  });
})();

/* ---------- Typing rotation (hero role line) ---------- */
(function typeRotate() {
  const el = document.getElementById("type-target");
  if (!el) return;
  const phrases = JSON.parse(el.dataset.phrases || "[]");
  if (!phrases.length) return;
  let pi = 0, ci = 0, deleting = false;

  function step() {
    const phrase = phrases[pi];
    if (!deleting) {
      ci++;
      el.textContent = phrase.slice(0, ci);
      if (ci === phrase.length) {
        deleting = true;
        return setTimeout(step, 2100);
      }
      return setTimeout(step, 55 + Math.random() * 45);
    }
    ci--;
    el.textContent = phrase.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      return setTimeout(step, 400);
    }
    setTimeout(step, 28);
  }
  setTimeout(step, 600);
})();

/* ---------- Scroll reveal ---------- */
(function reveals() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
})();

/* ---------- UTC clock in status bar ---------- */
(function clock() {
  const el = document.getElementById("utc-clock");
  if (!el) return;
  function update() {
    const now = new Date();
    el.textContent = now.toISOString().replace("T", " ").slice(0, 19) + "Z";
  }
  update();
  setInterval(update, 1000);
})();

/* ---------- Command palette (press / to open) ---------- */
(function cmdPalette() {
  const palette = document.getElementById("cmd-palette");
  const input = document.getElementById("cmd-input");
  const fab = document.getElementById("cmd-fab");
  if (!palette || !input) return;

  const routes = {
    home: "index.html",
    main: "index.html",
    projects: "projects.html",
    personal: "personal.html",
    resume: "resume.html",
    dossier: "resume.html",
    contact: "index.html#contact",
    about: "index.html#about",
  };

  function open() {
    palette.classList.add("open");
    input.value = "";
    setTimeout(() => input.focus(), 120);
  }
  function close() {
    palette.classList.remove("open");
    input.blur();
  }

  document.addEventListener("keydown", (e) => {
    const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
    if (e.key === "/" && !typing) {
      e.preventDefault();
      open();
    } else if (e.key === "Escape") {
      close();
    }
  });

  if (fab) fab.addEventListener("click", open);

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const cmd = input.value.trim().toLowerCase();
    if (!cmd) return close();

    // page-local section jumps first (resume tabs etc.)
    const local = document.querySelector(`[data-cmd-target="${cmd}"]`);
    if (local) {
      local.click();
      close();
      return;
    }
    if (routes[cmd]) {
      window.location.href = routes[cmd];
      return;
    }
    if (cmd === "help") {
      input.value = "";
      input.placeholder = "commands: home | projects | personal | resume | contact | download | terminal";
      return;
    }
    if (cmd === "download" || cmd === "pdf") {
      const dl = document.getElementById("dl-resume");
      if (dl) dl.click();
      else window.location.href = "resume.html";
      close();
      return;
    }
    if (cmd === "terminal" || cmd === "shell") {
      close();
      if (window.__openHiddenTerminal) window.__openHiddenTerminal();
      return;
    }
    input.value = "";
    input.placeholder = `unknown command: ${cmd} — try "help"`;
  });
})();
