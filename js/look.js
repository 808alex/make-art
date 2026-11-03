// ---- Look: colour themes, click ripples, scroll reveal, smooth scrolling, tab motion, beat pulse ----
(function () {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- colour themes ----------
  function markPal(p) {
    document.querySelectorAll("#palPicker button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.pal === p)));
  }
  function applyPal(p, ev) {
    if (root.dataset.pal === p) return;
    const go = () => {
      root.dataset.pal = p;
      markPal(p);
      try { localStorage.setItem("ma.pal", p); } catch (e) {}
    };
    if (document.startViewTransition && !reduced && ev) {
      const x = ev.clientX || innerWidth / 2, y = ev.clientY || 0;
      root.style.setProperty("--vx", x + "px");
      root.style.setProperty("--vy", y + "px");
      root.style.setProperty("--vr", Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + "px");
      document.startViewTransition(go);
    } else go();
  }
  markPal(root.dataset.pal);
  $("palPicker").addEventListener("click", e => {
    const b = e.target.closest("button[data-pal]");
    if (b) applyPal(b.dataset.pal, e);
  });

  // ---------- options menu under the song title ----------
  const optBtn = $("optBtn"), optMenu = $("optMenu");
  const setMenu = open => { optMenu.hidden = !open; optBtn.setAttribute("aria-expanded", String(open)); };
  optBtn.addEventListener("click", () => setMenu(optMenu.hidden));
  document.addEventListener("click", e => { if (!optMenu.hidden && !e.target.closest(".menuwrap")) setMenu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !optMenu.hidden) { setMenu(false); optBtn.focus(); } });
  optMenu.addEventListener("click", e => { if (e.target.closest("button.mi")) setMenu(false); });

  // first-paint animation only runs once
  setTimeout(() => root.classList.remove("boot"), 1300);

  // ---------- click ripple ----------
  const RIPPLE = "button, .rw, .beatbtn";
  document.addEventListener("pointerdown", e => {
    if (reduced || e.button > 0) return;
    const el = e.target.closest(RIPPLE);
    if (!el || el.disabled || el.classList.contains("play")) return;
    el.classList.add("rippled");
    const r = el.getBoundingClientRect();
    const sp = document.createElement("span");
    sp.className = "ripple";
    sp.style.setProperty("--rs", Math.max(r.width, r.height) * 2.4 + "px");
    sp.style.setProperty("--rx", e.clientX - r.left + "px");
    sp.style.setProperty("--ry", e.clientY - r.top + "px");
    el.appendChild(sp);
    sp.addEventListener("animationend", () => sp.remove());
  }, { passive: true });

  // ---------- scroll reveal (only for what starts below the fold) ----------
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const t = en.target;
        io.unobserve(t);
        t.classList.add("revealing");
        requestAnimationFrame(() => t.classList.remove("pre"));
        setTimeout(() => t.classList.remove("revealing"), 1100);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    const watch = () => {
      document.querySelectorAll(".finder .cols, .keys, #trackList").forEach(el => {
        if (el.dataset.revealed) return;
        el.dataset.revealed = "1";
        if (el.getBoundingClientRect().top > innerHeight * 0.92) { el.classList.add("pre"); io.observe(el); }
      });
    };
    setTimeout(watch, 900);
  }

  // ---------- smooth scrolling on desktop ----------
  if (window.Lenis && !reduced && matchMedia("(pointer: fine)").matches) {
    try {
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      window.__lenis = lenis;
    } catch (e) {}
  }

  // ---------- tabs: sliding underline + view transitions ----------
  const bars = [...document.querySelectorAll(".stabs")].map(bar => {
    const line = document.createElement("span");
    line.className = "tabline";
    bar.appendChild(line);
    return [bar, line];
  });
  function placeTabLine() {
    bars.forEach(([bar, line]) => {
      const sel = bar.querySelector('[aria-selected="true"]');
      if (!sel || !sel.offsetWidth) return;
      line.style.width = sel.offsetWidth + "px";
      line.style.transform = `translateX(${sel.offsetLeft}px)`;
    });
  }
  window.placeTabLines = placeTabLine;
  const baseSetView = setView;
  setView = function (v) {
    const was = currentView();
    baseSetView(v);
    placeTabLine();
    if (was !== v && VIEWS.includes(v)) {
      const el = $(v + "View");
      el.style.setProperty("--from", VIEWS.indexOf(v) > VIEWS.indexOf(was) ? "18px" : "-18px");
      el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter");
    }
  };
  placeTabLine();
  addEventListener("resize", placeTabLine);
  document.fonts && document.fonts.ready.then(placeTabLine);

  // ---------- pulse with the beat ----------
  function syncBeat() {
    const s = current();
    const on = !audio.paused && player.dataset.ready === "true" && !!(s && s.bpm);
    root.classList.remove("playing");
    if (!on) return;
    const rate = audio.playbackRate || 1;
    const songBeat = 60 / s.bpm, realBeat = songBeat / rate;
    let p = ((audio.currentTime - (s.beatOffset || 0)) / songBeat) % 1;
    if (p < 0) p += 1;
    root.style.setProperty("--beatdur", realBeat.toFixed(4) + "s");
    root.style.setProperty("--beatphase", (-p * realBeat).toFixed(4) + "s");
    void root.offsetWidth;
    root.classList.add("playing");
  }
  ["play", "pause", "seeked", "ratechange", "ended", "emptied"].forEach(ev => audio.addEventListener(ev, syncBeat));
  setInterval(() => { if (!audio.paused) syncBeat(); }, 6000);
  $("bpmFact").addEventListener("click", () => setTimeout(syncBeat, 0));
  $("tapBtn").addEventListener("click", () => setTimeout(syncBeat, 0));
})();
