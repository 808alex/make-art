// ================= Extras: rhyme colours, syllables, A–B loop, speed, BPM/key, tapes =================

// ---------- rhyme colours + syllable counts ----------
const hlEl = $("hl");
const HL_STOP = new Set("a an the and or but of to in on at for with from by as is it its i i'm im my your you're we he she they them this that these those be am are was were do did does so if then than just like up out not no yeah uh oh".split(" "));
let hlOn = true, sylOn = true, hlT = null;
try { hlOn = localStorage.getItem("wp.hl") !== "0"; sylOn = localStorage.getItem("wp.syl") !== "0"; } catch (e) {}

function autoGrow() {
  const cur = lyr.style.height;
  lyr.style.height = "auto";
  const want = lyr.scrollHeight + 3 + "px";
  if (cur !== want) lyr.style.height = want;
  else lyr.style.height = cur;
}
function hlSchedule() {
  autoGrow();
  clearTimeout(hlT);
  hlT = setTimeout(renderHL, 80);
}
function sylCount(word) {
  const i = RH.loaded() ? RH.wordInfo(word) : null;
  if (i) return i.n;
  const g = (word.toLowerCase().replace(/e\b/, "").match(/[aeiouy]+/g) || []).length;
  return Math.max(1, g);
}
function lyricTokens(text) {
  const lines = text.split("\n"), toks = [];
  lines.forEach((line, li) => {
    const skip = [];
    line.replace(/\[[^\]]*\]/g, (m, off) => { skip.push([off, off + m.length]); return m; });
    const re = /[A-Za-zÀ-ɏ]+(?:['’][A-Za-z]+)*/g;
    const lt = []; let m;
    while ((m = re.exec(line))) {
      const s = m.index;
      if (skip.some(([a, b]) => s >= a && s < b)) continue;
      lt.push({ li, s, e: s + m[0].length, w: m[0], end: false });
    }
    if (lt.length) lt[lt.length - 1].end = true;
    toks.push(...lt);
  });
  return { lines, toks };
}
function rhymeGroups(toks) {
  const color = new Array(toks.length).fill(0);
  if (!hlOn || !RH.loaded()) return color;
  const info = toks.map(t => {
    const lw = t.w.toLowerCase().replace(/’/g, "'");
    if (!t.end && (HL_STOP.has(lw) || lw.length < 2)) return null;
    return RH.wordInfo(lw);
  });
  const parent = toks.map((_, i) => i);
  const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  for (let i = 0; i < toks.length; i++) {
    if (!info[i]) continue;
    const wi = toks[i].w.toLowerCase();
    for (let j = i + 1; j < toks.length && toks[j].li - toks[i].li <= 3; j++) {
      if (!info[j] || toks[j].w.toLowerCase() === wi) continue;
      if (RH.familySim(info[i].P, info[j].P) >= 0.82) parent[find(i)] = find(j);
    }
  }
  const size = {};
  toks.forEach((_, i) => { if (info[i]) { const r = find(i); size[r] = (size[r] || 0) + 1; } });
  const cmap = {}; let next = 0;
  toks.forEach((_, i) => {
    if (!info[i]) return;
    const r = find(i);
    if (size[r] < 2) return;
    if (!cmap[r]) cmap[r] = (next++ % 8) + 1;
    color[i] = cmap[r];
  });
  return color;
}
function renderHL() {
  const { lines, toks } = lyricTokens(lyr.value);
  const color = rhymeGroups(toks);
  let html = "", ti = 0;
  lines.forEach((line, li) => {
    let out = "", pos = 0, n = 0;
    while (ti < toks.length && toks[ti].li === li) {
      const t = toks[ti];
      out += esc(line.slice(pos, t.s));
      out += color[ti] ? `<mark style="--c:var(--r${color[ti]})">${esc(t.w)}</mark>` : esc(t.w);
      pos = t.e; n += sylCount(t.w); ti++;
    }
    out += esc(line.slice(pos));
    html += (sylOn && n ? `<span class="syl">${n}</span>` : "") + out + (li < lines.length - 1 ? "\n" : "");
  });
  hlEl.innerHTML = html + "\n​";
  $("edwrap").classList.toggle("nosyl", !sylOn);
}
function toggleBtn(id, on) { $(id).setAttribute("aria-pressed", String(on)); }
$("hlToggle").addEventListener("click", () => {
  hlOn = !hlOn; toggleBtn("hlToggle", hlOn); renderHL();
  try { localStorage.setItem("wp.hl", hlOn ? "1" : "0"); } catch (e) {}
});
$("sylToggle").addEventListener("click", () => {
  sylOn = !sylOn; toggleBtn("sylToggle", sylOn); renderHL(); autoGrow();
  try { localStorage.setItem("wp.syl", sylOn ? "1" : "0"); } catch (e) {}
});
if ("ResizeObserver" in window) {
  let lastW = 0;
  new ResizeObserver(es => { const w = es[0].contentRect.width; if (w !== lastW) { lastW = w; autoGrow(); } }).observe($("edwrap"));
}

// ---------- persistence helper for song settings ----------
const persistT = {};
function persistSong(s, delay) {
  clearTimeout(persistT[s.id]);
  const go = () => {
    if (s.id === studio.cur) { s.lyrics = lyr.value; s.title = titleIn.value; }
    s.updatedAt = Date.now();
    delete s._new;
    saveSong(s);
    renderSongSelect();
  };
  if (delay) persistT[s.id] = setTimeout(go, delay); else go();
}

// ---------- A–B loop, speed, bar counter ----------
const ab = { a: null, b: null };
let lastT = 0;
function renderAB() {
  const z = $("abZone"), d = audio.duration;
  const on = ab.a != null && ab.b != null;
  $("setA").setAttribute("aria-pressed", String(ab.a != null));
  $("setB").setAttribute("aria-pressed", String(ab.b != null));
  $("clearAB").hidden = ab.a == null && ab.b == null;
  $("abTxt").textContent = on ? `${fmt(ab.a)} → ${fmt(ab.b)}` : ab.a != null ? `from ${fmt(ab.a)}, set B` : "";
  if (on && d) { z.hidden = false; z.style.left = (ab.a / d * 100) + "%"; z.style.width = ((ab.b - ab.a) / d * 100) + "%"; }
  else z.hidden = true;
}
function saveAB() { const s = current(); if (!s) return; s.loopA = ab.a; s.loopB = ab.b; persistSong(s, 600); }
function setAB(which, t) {
  if (player.dataset.ready !== "true") { toast("Load a beat first"); return; }
  t = t == null ? audio.currentTime : t;
  if (which === "a") { ab.a = t; if (ab.b != null && ab.b <= t + 0.25) ab.b = null; toast(`Loop start ${fmt(t)}`); }
  else {
    if (ab.a == null) ab.a = 0;
    if (t <= ab.a + 0.25) { toast("B has to come after A"); return; }
    ab.b = t; toast(`Looping ${fmt(ab.a)} → ${fmt(t)}`);
  }
  saveAB(); renderAB();
}
function clearAB() { ab.a = ab.b = null; saveAB(); renderAB(); }
function abJump(t) {
  if (ab.a != null && ab.b != null && lastT < ab.b && t >= ab.b) { audio.currentTime = ab.a; return ab.a; }
  return t;
}
function tick() {
  if (audio.paused) return;
  lastT = abJump(audio.currentTime);
  updateBarPos(lastT);
  requestAnimationFrame(tick);
}
audio.addEventListener("play", () => { lastT = audio.currentTime; requestAnimationFrame(tick); });
audio.addEventListener("seeked", () => { lastT = audio.currentTime; updateBarPos(lastT); });
audio.addEventListener("timeupdate", () => { lastT = abJump(audio.currentTime); updateBarPos(lastT); });
audio.addEventListener("loadedmetadata", () => { renderAB(); applyRate(); });
$("setA").addEventListener("click", () => setAB("a"));
$("setB").addEventListener("click", () => setAB("b"));
$("clearAB").addEventListener("click", clearAB);
document.addEventListener("keydown", e => {
  const ae = document.activeElement;
  if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
  if (e.key === "[") { e.preventDefault(); setAB("a"); }
  else if (e.key === "]") { e.preventDefault(); setAB("b"); }
});

function updateBarPos(t) {
  const s = current(), el = $("barPos");
  if (!s || !s.bpm || player.dataset.ready !== "true") { el.textContent = "Bar –"; return; }
  const beat = 60 / s.bpm, off = s.beatOffset || 0;
  if (t < off - 0.08) { el.textContent = "Intro"; return; }
  const n = Math.floor((t - off) / beat + 0.03);
  el.textContent = `Bar ${Math.floor(n / 4) + 1} · ${n % 4 + 1}`;
}

let keepPitch = true;
function applyRate() {
  const r = +$("speedSel").value || 1;
  audio.defaultPlaybackRate = r; audio.playbackRate = r;
  audio.preservesPitch = keepPitch; audio.mozPreservesPitch = keepPitch; audio.webkitPreservesPitch = keepPitch;
  renderTempo();
}
function renderTempo() {
  const s = current(), r = +$("speedSel").value || 1;
  $("tempoNow").textContent = s && s.bpm && r !== 1 ? `${Math.round(s.bpm * r)} BPM at ${r}×` : "";
}
$("speedSel").addEventListener("change", applyRate);
$("pitchBtn").addEventListener("click", () => {
  keepPitch = !keepPitch; toggleBtn("pitchBtn", keepPitch); applyRate();
  toast(keepPitch ? "Pitch stays put when you change speed" : "Pitch moves with speed, like a slowed edit");
});

// "Loop this part": from this line's mark to the next mark below
$("loopPart").addEventListener("click", () => {
  if (player.dataset.ready !== "true") { toast("Load a beat first"); return; }
  const v = lyr.value, pos = lyr.selectionStart;
  const lineStart = v.lastIndexOf("\n", pos - 1) + 1;
  const above = v.slice(0, v.indexOf("\n", pos) < 0 ? v.length : v.indexOf("\n", pos)).split("\n").reverse();
  let a = null;
  for (const line of above) { const m = line.match(/\[(\d+):(\d{2})\]/); if (m) { a = (+m[1]) * 60 + (+m[2]); break; } }
  if (a == null) { toast("Mark a beat time on this line first"); return; }
  let b = null;
  const re = /\[(\d+):(\d{2})\]/g; re.lastIndex = Math.max(lineStart, v.indexOf("\n", pos) < 0 ? v.length : v.indexOf("\n", pos));
  let m;
  while ((m = re.exec(v))) { const t = (+m[1]) * 60 + (+m[2]); if (t > a + 0.5) { b = t; break; } }
  if (b == null) {
    const s = current();
    b = s && s.bpm ? a + 16 * 4 * 60 / s.bpm : audio.duration;
    b = Math.min(b, audio.duration || b);
  }
  ab.a = a; ab.b = b; saveAB(); renderAB();
  audio.currentTime = a; audio.play().catch(() => {});
  toast(`Looping ${fmt(a)} → ${fmt(b)}`);
});

// ---------- BPM + key analysis ----------
function fftInPlace(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const a = i + k, b = a + half;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}
const hann = n => { const w = new Float64Array(n); for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)); return w; };
const pause = () => new Promise(r => setTimeout(r, 0));

async function decodeMono(arrayBuffer, sr) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = new AC();
  let buf;
  try { buf = await ac.decodeAudioData(arrayBuffer); }
  finally { try { ac.close(); } catch (e) {} }
  const len = Math.ceil(buf.duration * sr);
  const off = new OfflineAudioContext(1, len, sr);
  const src = off.createBufferSource(); src.buffer = buf; src.connect(off.destination); src.start();
  const r = await off.startRendering();
  return { x: r.getChannelData(0), duration: buf.duration };
}
async function onsetEnvelope(x, sr) {
  const N = 1024, H = 512, w = hann(N);
  const maxLen = Math.min(x.length, sr * 150);
  const frames = Math.max(0, Math.floor((maxLen - N) / H));
  const env = new Float64Array(frames), low = new Float64Array(frames);
  const kMax = Math.floor(8000 / sr * N), kLow = Math.max(2, Math.floor(160 / sr * N));
  let prev = new Float64Array(N / 2);
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let f = 0; f < frames; f++) {
    const o = f * H;
    for (let i = 0; i < N; i++) { re[i] = x[o + i] * w[i]; im[i] = 0; }
    fftInPlace(re, im);
    let flux = 0, lf = 0;
    for (let k = 1; k < kMax; k++) {
      const mag = Math.log1p(100 * Math.hypot(re[k], im[k]));
      const d = mag - prev[k];
      if (d > 0) { flux += k < kMax / 8 ? d * 1.5 : d; if (k <= kLow) lf += d; }
      prev[k] = mag;
    }
    env[f] = flux; low[f] = lf;
    if (f % 600 === 0) await pause();
  }
  // remove the slow-moving average so only the hits remain
  const detrend = src => {
    const out = new Float64Array(frames), W = 16;
    let acc = 0;
    for (let i = 0; i < frames; i++) {
      acc += src[i]; if (i >= W) acc -= src[i - W];
      out[i] = Math.max(0, src[i] - acc / Math.min(i + 1, W));
    }
    return out;
  };
  return { env: detrend(env), low: detrend(low), fps: sr / H, lat: N / 2 / sr };
}
function combScore(env, fps, bpm) {
  const p = fps * 60 / bpm, n = env.length;
  let s = 0;
  for (const [k, wt] of [[1, 1], [2, 0.8], [4, 0.6], [8, 0.4]]) {
    const lag = p * k, li = Math.floor(lag), fr = lag - li;
    let acc = 0;
    for (let i = 0; i + li + 1 < n; i++) acc += env[i] * (env[i + li] * (1 - fr) + env[i + li + 1] * fr);
    s += wt * acc / Math.max(1, n - li);
  }
  return s;
}
function findTempo(env, fps, low) {
  const prior = b => Math.exp(-0.5 * Math.pow(Math.log2(b / 125) / 0.75, 2));
  let best = 0, bestB = 120;
  const raw = {};
  for (let b = 60; b <= 175; b += 0.5) { const s = combScore(env, fps, b); raw[b] = s; if (s * prior(b) > best) { best = s * prior(b); bestB = b; } }
  if (bestB > 160) { const half = Math.round(bestB) / 2; const hs = combScore(env, fps, half); if (hs > 0.6 * raw[bestB]) bestB = half; }
  let fine = bestB, fineS = -1;
  for (let b = bestB - 0.6; b <= bestB + 0.6; b += 0.05) { const s = combScore(env, fps, b); if (s > fineS) { fineS = s; fine = b; } }
  const bpm = Math.round(fine * 10) / 10;
  const alt = bpm >= 115 ? bpm / 2 : bpm * 2;
  // beat phase, then which of the 4 beats is the downbeat
  const p = fps * 60 / bpm;
  const at = t => { const i = Math.floor(t), f = t - i; return i + 1 < env.length ? env[i] * (1 - f) + env[i + 1] * f : 0; };
  let phase = 0, phS = -1;
  for (let ph = 0; ph < p; ph += 0.25) { let s = 0; for (let t = ph; t < env.length - 1; t += p) s += at(t); if (s > phS) { phS = s; phase = ph; } }
  let down = 0, dS = -1;
  const atLow = t => { const i = Math.round(t); return i >= 0 && i < low.length ? Math.max(low[i], low[i - 1] || 0, low[i + 1] || 0) : 0; };
  for (let j = 0; j < 4; j++) { let s = 0; for (let t = phase + j * p; t < env.length - 1; t += 4 * p) s += atLow(t); if (s > dS) { dS = s; down = j; } }
  return { bpm, alt: Math.round(alt * 10) / 10, offsetFrames: phase + down * p };
}
const PC = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
const MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
function corr(a, b) {
  const ma = a.reduce((x, y) => x + y) / 12, mb = b.reduce((x, y) => x + y) / 12;
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return n / Math.sqrt(da * db || 1);
}
async function findKey(x, sr) {
  const N = 8192, w = hann(N), chroma = new Float64Array(12);
  const re = new Float64Array(N), im = new Float64Array(N);
  const bins = [];
  for (let k = 1; k < N / 2; k++) {
    const f = k * sr / N;
    if (f < 55 || f > 2000) continue;
    const midi = 69 + 12 * Math.log2(f / 440), r = Math.round(midi);
    if (Math.abs(midi - r) > 0.35) continue;
    bins.push([k, ((r % 12) + 12) % 12, f < 260 ? 1.6 : 1]);
  }
  for (let o = 0, f = 0; o + N <= x.length; o += N, f++) {
    for (let i = 0; i < N; i++) { re[i] = x[o + i] * w[i]; im[i] = 0; }
    fftInPlace(re, im);
    const fr = new Float64Array(12);
    for (const [k, pc, wt] of bins) fr[pc] += Math.hypot(re[k], im[k]) * wt;
    const mx = Math.max(...fr);
    if (mx > 1e-6) for (let i = 0; i < 12; i++) chroma[i] += fr[i] / mx;
    if (f % 40 === 0) await pause();
  }
  const scores = [];
  for (let t = 0; t < 12; t++) {
    const rot = Array.from({ length: 12 }, (_, i) => chroma[(i + t) % 12]);
    scores.push({ name: PC[t] + " major", s: corr(rot, MAJ), t, m: 0 });
    scores.push({ name: PC[t] + " minor", s: corr(rot, MIN) + 0.015, t, m: 1 });
  }
  scores.sort((a, b) => b.s - a.s);
  const top = scores[0];
  const rel = top.m ? PC[(top.t + 3) % 12] + " major" : PC[(top.t + 9) % 12] + " minor";
  return { key: top.name, alt: rel };
}
async function analyzeAudio(arrayBuffer) {
  const sr = 22050;
  const { x, duration } = await decodeMono(arrayBuffer, sr);
  await pause();
  const { env, low, fps, lat } = await onsetEnvelope(x, sr);
  const tempo = env.length > fps * 4 ? findTempo(env, fps, low) : null;
  await pause();
  const key = await findKey(x, sr);
  return { duration, bpm: tempo && tempo.bpm, bpmAlt: tempo && tempo.alt, offset: tempo ? Math.max(0, tempo.offsetFrames / fps + lat) : 0, key: key.key, keyAlt: key.alt };
}

const analyzing = new Set(), analyzeFailed = new Set(), factMsg = {};
function setFactNote(sid, msg) { factMsg[sid] = msg; if (sid === studio.cur) renderFacts(); }
async function analyzeSong(sid, source) {
  if (analyzing.has(sid)) return;
  analyzing.add(sid);
  setFactNote(sid, "Finding BPM and key…");
  try {
    let buf;
    if (source) buf = await source.arrayBuffer();
    else {
      const s0 = studio.songs.find(x => x.id === sid);
      if (!s0 || !s0.beatId) throw 0;
      const r = await fetch("/_blob/" + s0.beatId);
      if (!r.ok) throw 0;
      buf = await r.arrayBuffer();
    }
    await pause();
    const res = await analyzeAudio(buf);
    const s = studio.songs.find(x => x.id === sid);
    if (!s) return;
    if (!s.bpmManual && res.bpm) { s.bpm = res.bpm; s.bpmAlt = res.bpmAlt; s.beatOffset = res.offset; }
    s.key = res.key; s.keyAlt = res.keyAlt; s.beatDur = Math.round(res.duration * 10) / 10; s.analyzed = 1;
    setFactNote(sid, "");
    persistSong(s);
  } catch (e) {
    analyzeFailed.add(sid);
    setFactNote(sid, "Couldn't read the beat to find its BPM and key. Tap tempo still works.");
  } finally {
    analyzing.delete(sid);
    if (sid === studio.cur) { renderFacts(); renderTempo(); }
  }
}
function renderFacts() {
  const s = current(); if (!s) return;
  const hasBeat = !!(studio.localBeat[s.id] || s.beatId);
  $("beatFacts").hidden = !hasBeat;
  const bf = $("bpmFact"), kf = $("keyFact");
  bf.innerHTML = s.bpm ? `${esc(String(Math.round(s.bpm)))} BPM${s.bpmAlt ? ` <small>or ${esc(String(Math.round(s.bpmAlt)))}</small>` : ""}` : "— BPM";
  bf.title = s.bpm ? (s.bpmManual ? "Set with Tap tempo. Tap to swap to half or double time." : "Detected. Tap to swap to half or double time.") : "Tempo";
  kf.innerHTML = s.key ? `${esc(s.key)}${s.keyAlt ? ` <small>or ${esc(s.keyAlt)}</small>` : ""}` : "Key —";
  kf.title = s.key ? "Detected. The relative key shares the same notes. Tap to swap." : "Key";
  $("factNote").textContent = factMsg[s.id] || (s.bpm || s.key ? "Detected from the audio, so double-check by ear" : "");
}
$("bpmFact").addEventListener("click", () => {
  const s = current(); if (!s || !s.bpm || !s.bpmAlt) return;
  [s.bpm, s.bpmAlt] = [s.bpmAlt, s.bpm];
  renderFacts(); renderTempo(); updateBarPos(audio.currentTime); persistSong(s, 400);
});
$("keyFact").addEventListener("click", () => {
  const s = current(); if (!s || !s.key || !s.keyAlt) return;
  [s.key, s.keyAlt] = [s.keyAlt, s.key];
  renderFacts(); persistSong(s, 400);
});
let taps = [], tapT = null;
$("tapBtn").addEventListener("click", () => {
  const s = current(); if (!s) return;
  const now = performance.now();
  taps = taps.filter(t => now - t < 2500);
  taps.push(now);
  if (taps.length < 4) { $("tapBtn").textContent = `Tap · ${taps.length}`; return; }
  const iv = []; for (let i = Math.max(1, taps.length - 8); i < taps.length; i++) iv.push(taps[i] - taps[i - 1]);
  const avg = iv.reduce((a, b) => a + b) / iv.length;
  const bpm = Math.round(60000 / avg * 10) / 10;
  s.bpm = bpm; s.bpmAlt = bpm >= 115 ? Math.round(bpm * 5) / 10 : bpm * 2; s.bpmManual = true;
  if (!audio.paused) s.beatOffset = audio.currentTime % (60 / bpm);
  $("tapBtn").textContent = `Tap · ${Math.round(bpm)}`;
  renderFacts(); renderTempo();
  clearTimeout(tapT); tapT = setTimeout(() => { $("tapBtn").textContent = "Tap tempo"; persistSong(s); }, 1500);
});

function onSongBeat(s) {
  ab.a = s.loopA ?? null; ab.b = s.loopB ?? null;
  renderAB(); renderFacts(); renderTempo(); applyRate();
  updateBarPos(audio.currentTime || 0);
  if (s.beatId && !s.analyzed && !analyzing.has(s.id) && !analyzeFailed.has(s.id) && studio.mode === "cloud" && !studio.localBeat[s.id]) analyzeSong(s.id, null);
}

// ---------- studio tabs ----------
function setView(v) {
  $("writeView").hidden = v !== "write";
  $("tapesView").hidden = v !== "tapes";
  $("tabWrite").setAttribute("aria-selected", String(v === "write"));
  $("tabTapes").setAttribute("aria-selected", String(v === "tapes"));
  try { localStorage.setItem("wp.view", v); } catch (e) {}
  if (v === "write") autoGrow(); else renderTapes();
}
$("tabWrite").addEventListener("click", () => setView("write"));
$("tabTapes").addEventListener("click", () => setView("tapes"));

// ---------- tapes ----------
const LS_TAPES = "wp.tapes.v1";
let tapes = [], tapesAt = 0, tapesLocal = false, tapesDirty = false, curTape = null, tapesT = null, tapeChain = Promise.resolve();
try {
  const v = JSON.parse(localStorage.getItem(LS_TAPES) || "null");
  if (v && Array.isArray(v.tapes)) { tapes = v.tapes; tapesAt = v.updatedAt || 0; tapesLocal = !!v.local; }
  curTape = localStorage.getItem("wp.tape.cur");
} catch (e) {}
const tapeById = id => tapes.find(t => t.id === id);
function storeTapesLocal() { try { localStorage.setItem(LS_TAPES, JSON.stringify({ tapes, updatedAt: tapesAt, local: tapesLocal })); } catch (e) {} }
function saveTapes() {
  clearTimeout(tapesT);
  tapesDirty = false;
  tapesAt = Date.now();
  const known = new Set(studio.songs.map(s => s.id));
  tapes.forEach(t => { t.songIds = t.songIds.filter(id => known.has(id)); });
  if (studio.mode !== "cloud") { tapesLocal = true; storeTapesLocal(); return; }
  storeTapesLocal();
  const body = { kind: "tapes", tapes: JSON.parse(JSON.stringify(tapes)), updatedAt: tapesAt };
  tapeChain = tapeChain.then(() => studio.col.doc(TAPES_DOC).set(body)).then(() => { tapesLocal = false; storeTapesLocal(); })
    .catch(() => { tapesDirty = true; toast("Couldn't save your tapes yet. They're kept in this browser."); });
}
function saveTapesSoon() { tapesDirty = true; clearTimeout(tapesT); tapesT = setTimeout(saveTapes, 700); }
function applyRemoteTapes(remote, first) {
  const rAt = remote ? remote.updatedAt || 0 : -1;
  if (first && tapes.length && (tapesLocal || !remote) && tapesAt > rAt) { saveTapes(); return; }
  if (remote && Array.isArray(remote.tapes) && !tapesDirty && rAt >= tapesAt) {
    tapes = remote.tapes.map(t => ({ id: t.id, name: t.name || "", songIds: Array.isArray(t.songIds) ? t.songIds : [], createdAt: t.createdAt || 0 }));
    tapesAt = rAt; tapesLocal = false; storeTapesLocal();
    renderTapes();
  }
}
function songLabel(s) { return (s.title || "").trim() || "Untitled"; }
function renderTapes() {
  if (!tapes.some(t => t.id === curTape)) curTape = tapes[0] ? tapes[0].id : null;
  const t = tapeById(curTape);
  $("tapeSelect").innerHTML = tapes.map(x => `<option value="${esc(x.id)}"${x.id === curTape ? " selected" : ""}>${esc(x.name.trim() || "Untitled tape")} · ${x.songIds.length} track${x.songIds.length === 1 ? "" : "s"}</option>`).join("");
  $("tapeSelect").hidden = !tapes.length;
  $("deleteTape").hidden = !tapes.length;
  $("tapeBody").hidden = !t;
  $("tapeEmpty").hidden = !!t;
  if (!t) return;
  if (document.activeElement !== $("tapeName")) $("tapeName").value = t.name;
  const songs = t.songIds.map(id => studio.songs.find(s => s.id === id)).filter(Boolean);
  $("trackList").innerHTML = songs.length ? songs.map((s, i) => `
    <li class="track">
      <span class="tno">${String(i + 1).padStart(2, "0")}</span>
      <button type="button" class="ttitle" data-open="${esc(s.id)}" title="Open in Write">${esc(songLabel(s))}</button>
      <span class="tmeta">${s.bpm ? Math.round(s.bpm) + " BPM" : ""}${s.bpm && s.key ? " · " : ""}${s.key ? esc(s.key.replace(" major", "").replace(" minor", "m")) : ""}${s.beatDur ? ` · ${fmt(s.beatDur)}` : ""}</span>
      <span class="tbtns">
        <button type="button" class="tbtn" data-mv="${i}" data-dir="-1" aria-label="Move up"${i === 0 ? " disabled" : ""}>↑</button>
        <button type="button" class="tbtn" data-mv="${i}" data-dir="1" aria-label="Move down"${i === songs.length - 1 ? " disabled" : ""}>↓</button>
        <button type="button" class="tbtn" data-rm="${i}" aria-label="Remove from tape">×</button>
      </span>
    </li>`).join("") : `<li class="empty">No tracks yet. Add songs below.</li>`;
  const avail = studio.songs.filter(s => !s._new && !t.songIds.includes(s.id));
  $("addSongSel").innerHTML = avail.length ? avail.map(s => `<option value="${esc(s.id)}">${esc(songLabel(s))}</option>`).join("") : `<option value="">Every song is on this tape</option>`;
  $("addSongSel").disabled = $("addTrack").disabled = !avail.length;
  const total = songs.reduce((a, s) => a + (s.beatDur || 0), 0), unknown = songs.filter(s => !s.beatDur).length;
  $("tapeStats").textContent = songs.length ? `${songs.length} track${songs.length === 1 ? "" : "s"} · ${fmt(total)}${unknown ? ` + ${unknown} without a beat length` : ""}` : "";
}
$("tapeSelect").addEventListener("change", () => { curTape = $("tapeSelect").value; try { localStorage.setItem("wp.tape.cur", curTape); } catch (e) {} $("ideaChips").innerHTML = ""; renderTapes(); });
$("newTape").addEventListener("click", () => {
  const t = { id: "t" + newId(), name: "", songIds: [], createdAt: Date.now() };
  tapes.unshift(t); curTape = t.id; saveTapes(); renderTapes(); $("tapeName").focus();
});
let tapeDelT;
$("deleteTape").addEventListener("click", () => {
  const b = $("deleteTape"), t = tapeById(curTape); if (!t) return;
  if (b.dataset.armed !== "true") { b.dataset.armed = "true"; b.textContent = "Tap again to delete"; clearTimeout(tapeDelT); tapeDelT = setTimeout(() => { b.dataset.armed = "false"; b.textContent = "Delete"; }, 3500); return; }
  b.dataset.armed = "false"; b.textContent = "Delete";
  tapes = tapes.filter(x => x.id !== t.id); curTape = null; saveTapes(); renderTapes();
  toast(`Deleted “${t.name.trim() || "Untitled tape"}”. The songs are still in Write.`);
});
$("tapeName").addEventListener("input", () => { const t = tapeById(curTape); if (!t) return; t.name = $("tapeName").value; saveTapesSoon(); });
$("tapeName").addEventListener("change", renderTapes);
$("addTrack").addEventListener("click", () => {
  const t = tapeById(curTape), id = $("addSongSel").value; if (!t || !id) return;
  t.songIds.push(id); saveTapes(); renderTapes();
});
$("trackList").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const t = tapeById(curTape); if (!t) return;
  const ids = t.songIds.filter(id => studio.songs.some(s => s.id === id));
  if (b.dataset.open) { setView("write"); openSong(b.dataset.open); return; }
  if (b.dataset.mv !== undefined) {
    const i = +b.dataset.mv, j = i + (+b.dataset.dir);
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
  } else if (b.dataset.rm !== undefined) ids.splice(+b.dataset.rm, 1);
  t.songIds = ids; saveTapes(); renderTapes();
});
$("copyTracklist").addEventListener("click", () => {
  const t = tapeById(curTape); if (!t) return;
  const songs = t.songIds.map(id => studio.songs.find(s => s.id === id)).filter(Boolean);
  const lines = songs.map((s, i) => `${i + 1}. ${songLabel(s)}${s.beatDur ? ` (${fmt(s.beatDur)})` : ""}`);
  copy(`${t.name.trim() || "Untitled tape"}\n\n${lines.join("\n")}`);
});
function titleCase(s) { return s.replace(/\b([a-z])/g, (m, c) => c.toUpperCase()); }
$("nameIdeas").addEventListener("click", () => {
  const ev = POOLS.everyday.words;
  const single = ev.filter(w => !w.includes(" ") && w.length > 3), multi = ev.filter(w => w.includes(" "));
  const ideas = new Set();
  let guard = 0;
  while (ideas.size < 6 && guard++ < 60) {
    const r = Math.random();
    if (r < 0.35) ideas.add(titleCase(pick(multi)));
    else if (r < 0.75) ideas.add(titleCase(pick(single) + " " + pick(single)));
    else if (r < 0.9) ideas.add(titleCase(pick(single) + " & " + pick(single)));
    else ideas.add(titleCase(pick(["songs for", "notes from", "letters from", "views from"]) + " " + pick(single)));
  }
  $("ideaChips").innerHTML = [...ideas].map(n => `<button type="button" class="rw" data-tapename="${esc(n)}"><span>${esc(n)}</span></button>`).join("");
});
$("ideaChips").addEventListener("click", e => {
  const b = e.target.closest("[data-tapename]"); if (!b) return;
  const t = tapeById(curTape); if (!t) return;
  t.name = b.dataset.tapename; $("tapeName").value = t.name; saveTapes(); renderTapes();
});

// ---------- player height drives page padding ----------
if ("ResizeObserver" in window) {
  new ResizeObserver(es => { document.documentElement.style.setProperty("--plh", Math.ceil(es[0].borderBoxSize ? es[0].borderBoxSize[0].blockSize : es[0].target.offsetHeight) + "px"); }).observe(player);
}

// ---------- start ----------
EXTRAS_READY = true;
toggleBtn("hlToggle", hlOn); toggleBtn("sylToggle", sylOn);
(function startExtras() {
  let v = "write";
  try { v = localStorage.getItem("wp.view") || "write"; } catch (e) {}
  setView(v === "tapes" ? "tapes" : "write");
  const s = current();
  if (s) onSongBeat(s);
  hlSchedule();
  renderTapes();
  // the rhyme dictionary loads after the page; recolour once it's ready
  const wait = setInterval(() => { if (RH.loaded()) { clearInterval(wait); renderHL(); } }, 300);
})();
