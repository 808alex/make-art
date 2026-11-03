// ---- First-run tour: a short card that walks through the app, skippable, reopenable from the header ----
(function () {
  const KEY = "ma.tour.v1";
  const ICON = {
    hi: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    beat: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    write: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    rhyme: '<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h6"/><circle cx="18" cy="16" r="3"/>',
    vault: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9V7"/><path d="M3 9h2"/><path d="M3 15h2"/>',
    save: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    warn: '<path d="M12 3 2 20h20Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>'
  };
  function steps() {
    const cloud = studio.mode === "cloud";
    return [
      { icon: "hi", title: "Welcome to Make Art", body: "A studio for writing over beats. Bring a beat, write your bars, and keep rhymes and your saved lines right beside you." },
      { icon: "beat", title: "Bring a beat", body: "Drag an MP3, WAV or M4A anywhere onto the page, or open the Beat panel. BPM and key are found for you, and you can add the producer and licence there too.",
        list: ["Space plays and pauses (when you're not typing)", "← and → skip 5 seconds"] },
      { icon: "write", title: "Write", body: "Words that rhyme light up in the same colour, and every bar shows its syllable count. Mark beat time stamps a line so you can jump back to it.",
        list: ["Turn colours, syllables and other helpers on or off in Options"] },
      { icon: "rhyme", title: "Rhymes on the side", body: "Type a word, or two or three, in the Rhyme Finder for perfect rhymes, slant rhymes and multis. Tap one to drop it into your lyrics. The Words tab has the random word generator." },
      { icon: "vault", title: "Vault and EPs", body: "Got a bar but no song? Save it in the Vault. While you write, it suggests saved bars that fit your line. EP / Album puts your songs in order." },
      cloud
        ? { icon: "save", title: "Saved to your account", body: "Your songs, EPs, vault and beats sync to your Claude account, so they're there on every device you sign in on." }
        : { icon: "warn", title: "Where your work is saved", warn: true,
            body: "Everything saves in this browser on this device. It's still there after you close the tab or restart your computer.",
            list: ["A private or incognito window forgets everything when you close it.",
                   "Clearing this browser's site data or cookies deletes your songs.",
                   "Switching browser or device? Use Download backup here, then Restore backup there. Beats aren't in the backup, so load them again."] }
    ];
  }

  let el = null, i = 0, list = [], lastFocus = null;
  function render(dir) {
    const s = list[i], last = i === list.length - 1;
    el.querySelector(".tour-art").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[s.icon]}</svg>`;
    el.querySelector(".tour-card").classList.toggle("warn", !!s.warn);
    el.querySelector(".tour-count").textContent = `${i + 1} of ${list.length}`;
    el.querySelector("#tourTitle").textContent = s.title;
    el.querySelector(".tour-body").textContent = s.body;
    el.querySelector(".tour-list").innerHTML = (s.list || []).map(x => `<li>${esc(x)}</li>`).join("");
    el.querySelector(".tour-list").hidden = !s.list;
    el.querySelector(".tour-dots").innerHTML = list.map((_, k) => `<span class="${k === i ? "on" : ""}"></span>`).join("");
    el.querySelector("[data-back]").hidden = i === 0;
    el.querySelector("[data-next]").textContent = last ? "Start writing" : "Next";
    el.querySelector("[data-skip]").hidden = last;
    const page = el.querySelector(".tour-page");
    page.style.setProperty("--from", dir < 0 ? "-22px" : "22px");
    page.classList.remove("enter"); void page.offsetWidth; page.classList.add("enter");
  }
  function close() {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    if (!el) return;
    el.classList.add("leaving");
    document.documentElement.classList.remove("tour-open");
    if (window.__lenis) window.__lenis.start();
    const gone = el; el = null;
    setTimeout(() => gone.remove(), 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function open() {
    if (el) return;
    list = steps(); i = 0; lastFocus = document.activeElement;
    el = document.createElement("div");
    el.className = "tour";
    el.setAttribute("data-lenis-prevent", "");   // the smooth-scroll library must not take the wheel from the card
    document.documentElement.classList.add("tour-open");
    if (window.__lenis) window.__lenis.stop();
    el.innerHTML = `
      <div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tourTitle">
        <div class="tour-top"><span class="tour-count"></span><button type="button" class="tour-skipbtn" data-skip>Skip tour</button></div>
        <div class="tour-page">
          <div class="tour-art" aria-hidden="true"></div>
          <h2 id="tourTitle"></h2>
          <p class="tour-body"></p>
          <ul class="tour-list"></ul>
        </div>
        <div class="tour-dots" aria-hidden="true"></div>
        <div class="tour-nav">
          <button type="button" class="ghost" data-back>Back</button>
          <button type="button" class="reroll" data-next>Next</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => {
      if (e.target.closest("[data-skip]")) close();
      else if (e.target.closest("[data-back]")) { if (i > 0) { i--; render(-1); } }
      else if (e.target.closest("[data-next]")) { if (i < list.length - 1) { i++; render(1); } else close(); }
    });
    el.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "Tab") {   // keep focus inside the card
        const f = [...el.querySelectorAll("button:not([hidden])")];
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    render(1);
    setTimeout(() => el && el.querySelector("[data-next]").focus(), 50);
  }
  $("tourBtn").addEventListener("click", open);
  // first visit: wait until we know where things are saved, then show it once
  let seen = false;
  try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}
  if (!seen) {
    let tries = 0;
    (function wait() {
      if (studio.mode !== "pending" || tries++ > 20) setTimeout(open, 500);
      else setTimeout(wait, 250);
    })();
  }
})();
