// ---- Rhyme finder UI ----
const RCOLS = [
  ["phrases", "Phrases & flips"],
  ["everyday", "Everyday"],
  ["buzz", "Brands & buzz"],
  ["pieces", "Archive pieces"],
  ["rare", "Rare & distinct"]
];
const RARE_RANK = 16000;
let poolCands = [], poolSet = new Set(), rhymeRes = null, rhymeOpen = {};
function buildPoolCands(){
  if (!RH.loaded()) return;
  poolCands = []; poolSet = new Set();
  const add = (w, col) => {
    const key = RH.norm(w);
    if (poolSet.has(key)) return;
    const c = RH.prepCandidate(w); if (!c) return;
    poolSet.add(key);
    poolCands.push({ w, ...c, col });
  };
  for (const k in POOLS) {
    if (k === "coined" || k === "everyday") continue;
    for (const w of POOLS[k].words) add(w, k === "pieces" ? "pieces" : "buzz");
  }
  for (const w of SAYINGS) add(w, "phrases");
}
function runRhyme(){
  const q = document.getElementById("rhymeInput").value.trim();
  try { localStorage.setItem("wp.rhyme", q); } catch(e){}
  const heard = document.getElementById("heard");
  if (!RH.loaded()) return;
  if (!q) { rhymeRes = null; heard.textContent = "Type a word or a 2–3 word phrase to see what rhymes and flows with it."; renderRhymes(); return; }
  const Q = RH.prepTarget(q);
  if (!Q) { rhymeRes = null; heard.textContent = "Couldn't work out how that one sounds. Try another spelling."; renderRhymes(); return; }
  const n = Q.T.tail.length;
  heard.innerHTML = `${Q.phrase ? "Matching the flow" : "Rhyming on"} <b>${esc(RH.readable(Q.T))}</b> · ${n} syllable${n > 1 ? "s" : ""}${Q.guessed ? " · sound guessed from spelling" : ""}`;
  const min = +document.getElementById("rhymeMin").value;
  const qn = RH.norm(q);
  const out = { phrases: [], everyday: [], buzz: [], pieces: [], rare: [] };
  for (const o of RH.words) {
    if (!o.S.length || o.w === qn || poolSet.has(o.w)) continue;
    const r = RH.scoreWord(Q, o);
    if (r.score < min) continue;
    out[o.rank < RARE_RANK ? "everyday" : "rare"].push({ w: o.w, s: r.score, m: r.multi, k: r.score + 6 * r.multi + 4 * (1 - o.rank / 42000) });
  }
  const lastTok = s => RH.tokens(s).pop();
  const qLast = lastTok(q);
  for (const c of poolCands) {
    if (RH.norm(c.w) === qn || lastTok(c.w) === qLast) continue;
    const r = RH.scoreCand(Q, c);
    if (r.score < min) continue;
    out[c.col].push({ w: c.w, s: r.score, m: r.multi, k: r.score + 6 * r.multi + (c.col === "phrases" ? 4 : 0), say: c.col === "phrases" });
  }
  const sayings = new Set(out.phrases.map(r => RH.norm(r.w)));
  for (const r of RH.buildPhrases(Q, min, sayings)) out.phrases.push(r);
  for (const k in out) out[k].sort((a, b) => b.k - a.k);
  rhymeRes = out; rhymeOpen = {};
  renderRhymes();
}
function renderRhymes(){
  const el = document.getElementById("rhymeCols");
  if (!rhymeRes) { el.innerHTML = ""; return; }
  el.innerHTML = RCOLS.map(([k, label]) => {
    const list = rhymeRes[k];
    if (k === "phrases" && !list.length) return "";
    const base = k === "phrases" ? 48 : 36;
    const cap = rhymeOpen[k] ? 200 : base;
    const items = list.slice(0, cap).map((r, ri) =>
      `<button type="button" class="rw in${r.s === 100 ? " top" : ""}${r.m >= 0.9 && r.s >= 85 ? " multi" : ""}${r.say ? " say" : ""}" style="--i:${Math.min(ri, 36)}" data-rcopy="${esc(r.w)}"><span>${esc(r.w)}</span><i>${r.s}</i></button>`).join("");
    const more = list.length > base ? `<button type="button" class="ghost more" data-rmore="${k}">${rhymeOpen[k] ? "Show fewer" : `Show ${Math.min(list.length, 200) - base} more`}</button>` : "";
    return `<div class="col${k === "phrases" ? " wide" : ""}"><h3><span>${label}</span><span>${list.length}</span></h3>
      ${list.length ? `<div class="rlist">${items}</div>${more}` : `<p class="empty">Nothing at this rating. Drop the slider a bit.</p>`}</div>`;
  }).join("");
}
let rhymeT;
document.getElementById("rhymeInput").addEventListener("input", () => { clearTimeout(rhymeT); rhymeT = setTimeout(runRhyme, 220); });
document.getElementById("rhymeInput").addEventListener("keydown", e => { if (e.key === "Enter") { clearTimeout(rhymeT); runRhyme(); } });
document.getElementById("rhymeMin").addEventListener("input", e => {
  document.getElementById("rhymeMinVal").textContent = e.target.value + "+";
  clearTimeout(rhymeT); rhymeT = setTimeout(runRhyme, 120);
});
(function initRhyme(){
  let last = "drip";
  try { const v = localStorage.getItem("wp.rhyme"); if (v !== null) last = v; } catch(e){}
  document.getElementById("rhymeInput").value = last;
  fetch("data/rhymes.txt").then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(t => {
    RH.load(t.trim()); buildPoolCands(); runRhyme();
  }).catch(() => {
    document.getElementById("heard").textContent = "The rhyme dictionary didn't load. Refresh the page to try again.";
  });
})();
document.addEventListener("keydown", e => {
  const ae = document.activeElement;
  if (e.code === "Space" && (!ae || ae === document.body) && !document.getElementById("wordsPanel").hidden) { e.preventDefault(); reroll(); }
});

document.getElementById("custom").value = state.custom;
parseCustom();
renderControls();
renderStash();
reroll();

// ---- Rhymes / Words tabs in the tools column ----
function showTool(name, opts) {
  const words = name === "words";
  const rp = document.getElementById("rhymesPanel"), wp = document.getElementById("wordsPanel");
  const was = rp.hidden ? "words" : "rhymes";
  rp.hidden = words; wp.hidden = !words;
  document.getElementById("ttRhymes").setAttribute("aria-selected", String(!words));
  document.getElementById("ttWords").setAttribute("aria-selected", String(words));
  try { localStorage.setItem("ma.tool", words ? "words" : "rhymes"); } catch (e) {}
  if (was !== name && !(opts && opts.instant)) {
    const el = words ? wp : rp;
    el.style.setProperty("--from", words ? "18px" : "-18px");
    el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter");
    document.getElementById("tools").scrollTop = 0;
  }
  if (window.placeTabLines) window.placeTabLines();
}
document.querySelector(".ttabs").addEventListener("click", e => {
  const b = e.target.closest("button[data-tool]");
  if (b) showTool(b.dataset.tool);
});
(function () {
  let t = "rhymes";
  try { t = localStorage.getItem("ma.tool") || "rhymes"; } catch (e) {}
  showTool(t === "words" ? "words" : "rhymes", { instant: true });
})();
