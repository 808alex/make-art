// ---- Writing insights: vault bars that fit the line you're on, and words you lean on too much ----
const STOP = new Set(`a about above after again against all am an and any are as at be because been before being below between both but by
can could did do does doing don't down during each few for from further had has have having he her here hers herself him himself his how
i i'd i'll i'm i've if in into is it it's its itself just like me more most my myself no nor not now of off on once only or other our ours
out over own same she should so some such than that that's the their theirs them themselves then there these they they're this those through
to too under until up very was we were what when where which while who whom why will with would you your yours yourself yeah yea uh oh ooh
ay ayy hey ya got get gon gonna wanna know ain't aint cause can't cant won't wont dont didn't didnt let make made back still really way thing
things one two go going come came say said tell told see seen want need feel take took give gave keep kept every never ever always even
though thru til till you're we're she's he's there's what's gotta tryna lot man`.split(/\s+/));
const WORD_RE = /[A-Za-zÀ-ɏ]+(?:['’][A-Za-z]+)*/g;
const norm1 = w => w.toLowerCase().replace(/’/g, "'");
function stem(w) {
  w = norm1(w).replace(/'s$/, "");
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}
const contentWords = text => (text.replace(/\[[^\]]*\]/g, " ").match(WORD_RE) || []).map(norm1).filter(w => w.length >= 3 && !STOP.has(w));

// ---------- overused words ----------
var overused = new Map();   // stem -> { word, total, songs }
var owOn = true;
try { owOn = localStorage.getItem("ma.ow") !== "0"; } catch (e) {}
function isOverused(w) { return owOn && overused.has(stem(w)) && !STOP.has(norm1(w)); }

function computeOverused() {
  const counts = new Map();
  for (const s of studio.songs) {
    const text = s.id === studio.cur ? lyr.value : (s.lyrics || "");
    if (!text) continue;
    const seen = new Set();
    for (const w of contentWords(text)) {
      const k = stem(w);
      let c = counts.get(k);
      if (!c) { c = { total: 0, songs: 0, forms: {} }; counts.set(k, c); }
      c.total++;
      c.forms[w] = (c.forms[w] || 0) + 1;
      if (!seen.has(k)) { seen.add(k); c.songs++; }
    }
  }
  const totalWords = [...counts.values()].reduce((a, c) => a + c.total, 0);
  const min = Math.max(6, Math.round(totalWords / 120));
  const next = new Map();
  for (const [k, c] of counts) {
    if ((c.total >= min && c.songs >= 2) || c.total >= min * 2) {
      c.word = Object.entries(c.forms).sort((a, b) => b[1] - a[1])[0][0];
      next.set(k, c);
    }
  }
  const changed = [...next.keys()].sort().join(",") !== [...overused.keys()].sort().join(",");
  overused = next;
  return changed;
}
function renderHabits() {
  const here = new Map();
  for (const w of contentWords(lyr.value)) { const k = stem(w); here.set(k, (here.get(k) || 0) + 1); }
  const list = [...here.keys()].filter(k => overused.has(k)).map(k => overused.get(k)).sort((a, b) => b.total - a.total).slice(0, 8);
  $("habits").hidden = !owOn || !list.length;
  $("habitChips").innerHTML = list.map(c =>
    `<button type="button" class="habit" data-hw="${esc(c.word)}" title="Used ${c.total} times across ${c.songs} song${c.songs === 1 ? "" : "s"}. Tap to find it in this song.">` +
    `<b>${esc(c.word)}</b> ×${c.total}${c.songs > 1 ? ` <small>in ${c.songs} songs</small>` : ""}</button>`).join("");
}
$("habitChips").addEventListener("click", e => {
  const b = e.target.closest("[data-hw]"); if (!b) return;
  const target = stem(b.dataset.hw), v = lyr.value;
  const hits = [];
  let m; const re = new RegExp(WORD_RE.source, "g");
  while ((m = re.exec(v))) if (stem(m[0]) === target) hits.push([m.index, m.index + m[0].length]);
  if (!hits.length) return;
  const from = lyr.selectionEnd || 0;
  const next = hits.find(h => h[0] >= from) || hits[0];
  lyr.focus();
  lyr.setSelectionRange(next[0], next[1]);
});
$("owToggle").setAttribute("aria-pressed", String(owOn));
$("owToggle").addEventListener("click", () => {
  owOn = !owOn;
  $("owToggle").setAttribute("aria-pressed", String(owOn));
  try { localStorage.setItem("ma.ow", owOn ? "1" : "0"); } catch (e) {}
  renderHabits(); renderHL();
});

// ---------- vault suggestions ----------
let vsHiddenFor = null;
function targetLine() {
  const v = lyr.value, pos = lyr.selectionStart ?? v.length;
  const lines = v.split("\n");
  const clean = l => (l || "").replace(/\[[^\]]*\]/g, "").trim();
  let i = v.slice(0, pos).split("\n").length - 1;
  if (!clean(lines[i])) { i--; while (i >= 0 && !clean(lines[i])) i--; }
  return i >= 0 ? { text: clean(lines[i]), idx: i, lines } : null;
}
function suggestBars() {
  if (!vault.length || !RH.loaded()) return { list: [] };
  const t = targetLine(); if (!t) return { list: [] };
  const words = t.text.match(WORD_RE) || [];
  const endW = words[words.length - 1];
  const endInfo = endW ? RH.wordInfo(endW) : null;
  const ctx = t.lines.slice(Math.max(0, t.idx - 5), t.idx + 1).join(" ");
  const topic = new Set(contentWords(ctx).map(stem));
  const have = lyr.value.toLowerCase();
  const out = [];
  for (const b of vault) {
    const firstLine = b.text.trim().split("\n")[0].toLowerCase();
    if (firstLine && have.includes(firstLine)) continue;       // already in this song
    let rhyme = 0, rhymeWord = null;
    if (endInfo) {
      for (const line of b.text.split("\n")) {
        const ws = line.replace(/\[[^\]]*\]/g, "").match(WORD_RE) || [];
        const lw = ws[ws.length - 1];
        if (!lw || norm1(lw) === norm1(endW)) continue;
        const inf = RH.wordInfo(lw);
        if (!inf) continue;
        const sim = RH.familySim(endInfo.P, inf.P);
        if (sim > rhyme) { rhyme = sim; rhymeWord = lw; }
      }
    }
    const barWords = new Map();
    for (const w of contentWords(b.text)) if (!barWords.has(stem(w))) barWords.set(stem(w), w);
    const shared = [...barWords.keys()].filter(k => topic.has(k)).map(k => barWords.get(k));
    const score = (rhyme >= 0.82 ? 10 + rhyme : 0) + shared.length * 2.5;
    if (score >= 2.5) out.push({ b, rhyme: rhyme >= 0.82 ? rhymeWord : null, shared, score });
  }
  out.sort((x, y) => y.score - x.score);
  return { list: out.slice(0, 3), endW, key: t.idx + "|" + (endW || "") + "|" + out.slice(0, 3).map(x => x.b.id).join(",") };
}
function renderSuggest() {
  const box = $("vSuggest");
  if ($("writeView").hidden) { box.hidden = true; return; }
  const r = suggestBars();
  if (!r.list.length || vsHiddenFor === r.key) { box.hidden = true; return; }
  const wasHidden = box.hidden;
  box.hidden = false;
  box.dataset.key = r.key;
  $("vsWhy").textContent = r.endW ? `for the line ending “${r.endW}”` : "";
  $("vsList").innerHTML = r.list.map((x, i) => `
    <div class="vs-item${wasHidden ? " in" : ""}" style="--i:${i}">
      <p>${esc(x.b.text)}</p>
      <div class="vs-meta">
        ${x.rhyme ? `<span class="vs-tag">rhymes · ${esc(x.rhyme)}</span>` : ""}
        ${x.shared.length ? `<span class="vs-tag soft">same topic · ${esc(x.shared.slice(0, 3).join(", "))}</span>` : ""}
        <button type="button" class="tool" data-vsadd="${esc(x.b.id)}">Add below</button>
      </div>
    </div>`).join("");
}
$("vsList").addEventListener("mousedown", e => { if (e.target.closest("[data-vsadd]")) e.preventDefault(); });
$("vsList").addEventListener("click", e => {
  const btn = e.target.closest("[data-vsadd]"); if (!btn) return;
  const bar = vault.find(x => x.id === btn.dataset.vsadd); if (!bar) return;
  const v = lyr.value, pos = lyr.selectionStart ?? v.length;
  const lineEnd = v.indexOf("\n", pos) < 0 ? v.length : v.indexOf("\n", pos);
  const before = v.slice(0, lineEnd);
  lyr.setRangeText((before && !before.endsWith("\n") ? "\n" : "") + bar.text, lineEnd, lineEnd, "end");
  markDirty();
  if (matchMedia("(pointer: fine)").matches) lyr.focus();
  toast("Added from your vault");
});
$("vsHide").addEventListener("click", () => { vsHiddenFor = $("vSuggest").dataset.key; $("vSuggest").hidden = true; });
// on wide screens the suggestions sit at the top of the tools column, where they stay in view while you write;
// on phones they sit right under the editor
const wideMQ = matchMedia("(min-width: 1040px)");
function placeSuggest() {
  const box = $("vSuggest");
  if (wideMQ.matches) { if (box.parentElement !== $("tools")) $("tools").prepend(box); }
  else if (box.previousElementSibling !== $("edwrap")) $("edwrap").after(box);
}
wideMQ.addEventListener ? wideMQ.addEventListener("change", placeSuggest) : wideMQ.addListener(placeSuggest);
placeSuggest();

// ---------- scheduling ----------
let insT = null;
function runInsights() {
  if (computeOverused()) renderHL();
  renderHabits();
  renderSuggest();
}
function insightsSchedule() { clearTimeout(insT); insT = setTimeout(runInsights, 300); }
["keyup", "click"].forEach(ev => lyr.addEventListener(ev, e => {
  if (ev === "keyup" && !/^Arrow|^Page|^Home|^End/.test(e.key)) return;
  clearTimeout(insT); insT = setTimeout(renderSuggest, 200);
}));
(function waitDict() { if (RH.loaded()) runInsights(); else setTimeout(waitDict, 400); })();
