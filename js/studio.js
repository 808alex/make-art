// ---- Studio: songs, autosave, beat player ----
const $ = id => document.getElementById(id);
const LS_SONGS = "wp.songs.v1", LS_CUR = "wp.song.cur", LS_TAP = "wp.tap";
const TAPES_DOC = "tapes";
const SONG_EXTRA = ["bpm", "bpmAlt", "beatOffset", "bpmManual", "key", "keyAlt", "beatDur", "analyzed", "loopA", "loopB"];
var EXTRAS_READY = false;
const lyr = $("lyrics"), titleIn = $("songTitle"), audio = $("beat"), songSel = $("songSelect");
const studio = {
  col: null, assets: null, mode: "pending", songs: [], cur: null, dirty: false,
  saveT: null, chain: Promise.resolve(), retries: 0, localBeat: {}, beatMsg: {}, seeking: false
};
let tapMode = "insert";
try { const v = localStorage.getItem(LS_TAP); if (v === "copy" || v === "insert") tapMode = v; } catch (e) {}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const timeStr = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmt = t => { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0"); };
function loadLocalSongs() { try { const v = JSON.parse(localStorage.getItem(LS_SONGS) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
function saveLocalSongs() { try { localStorage.setItem(LS_SONGS, JSON.stringify(studio.songs.filter(s => !s._new))); } catch (e) {} }
function blankSong() { const t = Date.now(); return { id: newId(), title: "", lyrics: "", beatId: null, beatName: "", createdAt: t, updatedAt: t, _new: true }; }
const current = () => studio.songs.find(s => s.id === studio.cur);
const sortSongs = () => studio.songs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
const isEmpty = s => !(s.lyrics || "").trim() && !(s.title || "").trim() && !s.beatId && !s.beatName;

function setMode(mode) {
  studio.mode = mode;
  const el = $("syncState");
  el.dataset.state = mode === "cloud" ? "cloud" : "local";
  el.textContent = mode === "cloud" ? "Synced to your account" : "Saved in this browser only";
  el.title = mode === "cloud" ? "Songs save to your Claude account and show up on any device you're signed in on."
    : "Sign in to Claude and open this page there to sync songs across devices.";
}
function setSaveState(t) { $("saveState").textContent = t; }

function renderSongSelect() {
  sortSongs();
  songSel.innerHTML = studio.songs.map(s => {
    const name = (s.title || "").trim() || (s._new ? "New song" : "Untitled");
    const when = s._new ? "not saved yet" : new Date(s.updatedAt || Date.now()).toLocaleDateString([], { day: "numeric", month: "short" });
    return `<option value="${esc(s.id)}"${s.id === studio.cur ? " selected" : ""}>${esc(name)} · ${esc(when)}</option>`;
  }).join("");
  if (EXTRAS_READY) renderTapes();
}
function updateStats() {
  const lines = lyr.value.split("\n").map(l => l.replace(/\[\d+:\d{2}\]/g, "").trim()).filter(Boolean);
  const words = (lyr.value.replace(/\[\d+:\d{2}\]/g, "").match(/[^\s]+/g) || []).length;
  $("lyricStats").textContent = `${lines.length} bar${lines.length === 1 ? "" : "s"} · ${words} word${words === 1 ? "" : "s"}`;
  if (EXTRAS_READY) hlSchedule();
}

// ---- saving ----
function saveSong(s) {
  saveLocalSongs();
  if (studio.mode !== "cloud") { s._local = true; saveLocalSongs(); setSaveState("Saved in this browser · " + timeStr()); return Promise.resolve(); }
  const body = { title: s.title || "", lyrics: s.lyrics || "", beatId: s.beatId || null, beatName: s.beatName || "", createdAt: s.createdAt || Date.now(), updatedAt: s.updatedAt || Date.now() };
  for (const k of SONG_EXTRA) if (s[k] !== undefined) body[k] = s[k];
  const id = s.id;
  if (id === studio.cur) setSaveState("Saving…");
  studio.chain = studio.chain.then(() => studio.col.doc(id).set(body)).then(() => {
    studio.retries = 0;
    if (s._local) { delete s._local; saveLocalSongs(); }
    if (id === studio.cur && !studio.dirty) setSaveState("Saved · " + timeStr());
  }).catch(e => {
    const code = e && e.code;
    if (id === studio.cur) {
      studio.dirty = true;
      setSaveState(code === "quota_exceeded" ? "Song storage is full. Delete old songs to keep saving."
        : code === "invalid_argument" ? "This song is too long to save in one piece." : "Couldn't save yet. Retrying…");
      if ((code === "unavailable" || !code) && studio.retries < 3) { studio.retries++; clearTimeout(studio.saveT); studio.saveT = setTimeout(saveNow, 4000); }
    }
  });
  return studio.chain;
}
function saveNow() {
  clearTimeout(studio.saveT);
  const s = current();
  if (!s || !studio.dirty) return;
  studio.dirty = false;
  if (s._new && isEmpty(s)) return;
  delete s._new;
  renderSongSelect();
  saveSong(s);
}
function markDirty() {
  const s = current(); if (!s) return;
  s.lyrics = lyr.value; s.title = titleIn.value; s.updatedAt = Date.now();
  studio.dirty = true;
  setSaveState("Editing…");
  updateStats();
  clearTimeout(studio.saveT);
  studio.saveT = setTimeout(saveNow, 900);
}

// ---- songs ----
function openSong(id) {
  if (studio.cur && studio.cur !== id) saveNow();
  studio.cur = id;
  try { localStorage.setItem(LS_CUR, id); } catch (e) {}
  const s = current();
  titleIn.value = s.title || "";
  lyr.value = s.lyrics || "";
  studio.dirty = false;
  updateStats();
  setSaveState(s._new ? "" : "Saved");
  renderSongSelect();
  resetDelete();
  loadBeatFor(s);
}
function refreshEditor(s) {
  const focused = document.activeElement === lyr, pos = lyr.selectionStart;
  if (titleIn.value !== (s.title || "") && document.activeElement !== titleIn) titleIn.value = s.title || "";
  if (lyr.value !== (s.lyrics || "")) {
    lyr.value = s.lyrics || "";
    if (focused) { const p = Math.min(pos, lyr.value.length); lyr.setSelectionRange(p, p); }
    updateStats();
  }
}
function ensureSong() {
  if (!studio.songs.length) studio.songs.push(blankSong());
  if (!current()) studio.cur = studio.songs[0].id;
}

$("newSong").addEventListener("click", () => {
  saveNow();
  const existing = studio.songs.find(s => s._new && isEmpty(s));
  const s = existing || blankSong();
  if (!existing) studio.songs.push(s);
  s.updatedAt = Date.now();
  openSong(s.id);
  titleIn.focus();
});
songSel.addEventListener("change", () => openSong(songSel.value));
titleIn.addEventListener("input", () => { markDirty(); });
titleIn.addEventListener("change", () => renderSongSelect());
lyr.addEventListener("input", markDirty);
lyr.addEventListener("blur", saveNow);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveNow(); });
window.addEventListener("pagehide", saveNow);

let delT;
function resetDelete() { const b = $("deleteSong"); b.dataset.armed = "false"; b.textContent = "Delete"; clearTimeout(delT); }
$("deleteSong").addEventListener("click", () => {
  const b = $("deleteSong"), s = current(); if (!s) return;
  if (b.dataset.armed !== "true") {
    b.dataset.armed = "true"; b.textContent = "Tap again to delete";
    clearTimeout(delT); delT = setTimeout(resetDelete, 3500); return;
  }
  resetDelete();
  clearTimeout(studio.saveT); studio.dirty = false;
  const gone = s;
  studio.songs = studio.songs.filter(x => x.id !== gone.id);
  saveLocalSongs();
  if (studio.mode === "cloud" && !gone._new) {
    studio.chain = studio.chain.then(() => studio.col.doc(gone.id).delete()).catch(() => toast("Couldn't delete it from your account. Try again."));
  }
  if (gone.beatId && studio.assets && !studio.songs.some(x => x.beatId === gone.beatId)) studio.assets.delete(gone.beatId).catch(() => {});
  if (studio.localBeat[gone.id]) { URL.revokeObjectURL(studio.localBeat[gone.id].url); delete studio.localBeat[gone.id]; }
  ensureSong();
  openSong(studio.songs[0].id);
  toast(`Deleted “${(gone.title || "").trim() || "Untitled"}”`);
});

// ---- cloud sync ----
function applySnapshot(snap) {
  const remote = new Map();
  let remoteTapes = null;
  snap.docs.forEach(d => {
    if (!d.exists) return;
    const v = d.data() || {};
    if (d.id === TAPES_DOC) { remoteTapes = v; return; }
    remote.set(d.id, { id: d.id, title: "", lyrics: "", beatId: null, beatName: "", ...v });
  });
  const first = studio.mode !== "cloud";
  if (first) setMode("cloud");
  const next = [], toPush = [];
  for (const r of remote.values()) {
    const l = studio.songs.find(s => s.id === r.id);
    if (l && ((l.id === studio.cur && studio.dirty) || (l.updatedAt || 0) > (r.updatedAt || 0))) next.push(l);
    else next.push(r);
  }
  for (const s of studio.songs) {
    if (remote.has(s.id)) continue;
    if (s._new) next.push(s);
    else if (s._local || (s.id === studio.cur && studio.dirty)) { next.push(s); if (first) toPush.push(s); }
  }
  studio.songs = next;
  saveLocalSongs();
  if (!current()) { ensureSong(); openSong(studio.songs[0].id); }
  else {
    const s = current();
    if (!studio.dirty) refreshEditor(s);
    loadBeatFor(s);
    renderSongSelect();
  }
  toPush.forEach(s => saveSong(s));
  if (EXTRAS_READY) applyRemoteTapes(remoteTapes, first);
}
async function initCloud() {
  const c = window.claude;
  if (!c || typeof c.use !== "function") { setMode("local"); return; }
  try {
    const [db, user, assets] = await Promise.all([c.use("db"), c.use("user"), c.use("assets")]);
    studio.assets = assets;
    const uid = user ? await user.id() : null;
    if (!db || !uid) { setMode("local"); return; }
    studio.col = db.collection("data/users/" + uid);
    studio.col.onSnapshot(applySnapshot, () => {
      setMode("local");
      toast("Lost the connection to your account. Saving in this browser for now.");
    });
  } catch (e) { setMode("local"); }
}

// ---- beats ----
function setBeatMsg(sid, msg, tone) {
  studio.beatMsg[sid] = { msg, tone: tone || "" };
  if (sid === studio.cur) renderBeatInfo();
}
function renderBeatInfo() {
  const s = current(); if (!s) return;
  const local = studio.localBeat[s.id];
  const name = (local && local.name) || s.beatName || "";
  $("beatName").textContent = name || "No beat yet";
  $("beatBtnText").textContent = name ? "Change beat" : "Load beat";
  const m = studio.beatMsg[s.id];
  const st = $("beatState");
  if (m) { st.textContent = m.msg; st.dataset.tone = m.tone; }
  else if (s.beatId) { st.textContent = studio.mode === "cloud" ? "Synced to your account" : "Synced"; st.dataset.tone = "ok"; }
  else if (local) { st.textContent = "Plays on this device only"; st.dataset.tone = ""; }
  else if (s.beatName) { st.textContent = "This beat wasn't synced. Load it again to play it here."; st.dataset.tone = ""; }
  else { st.textContent = "MP3, WAV, M4A and more"; st.dataset.tone = ""; }
}
function setAudio(src, name) {
  if (audio.dataset.src !== src) {
    audio.pause();
    audio.src = src; audio.dataset.src = src;
    $("player").dataset.ready = "false";
    audio.load();
  }
  $("plName").textContent = name || "Beat";
}
function clearAudio() {
  audio.pause();
  audio.removeAttribute("src"); audio.dataset.src = "";
  audio.load();
  $("player").dataset.ready = "false";
  $("plName").textContent = "No beat on this song";
  $("plCur").textContent = "0:00"; $("plDur").textContent = "0:00"; $("seek").value = 0;
}
function loadBeatFor(s) {
  const local = studio.localBeat[s.id];
  if (local) setAudio(local.url, local.name);
  else if (s.beatId) setAudio("/_blob/" + s.beatId, s.beatName || "Beat");
  else clearAudio();
  renderBeatInfo();
  if (EXTRAS_READY) onSongBeat(s);
}

async function toSyncable(file, onProgress) {
  const t = (file.type || "").toLowerCase(), ext = (file.name.split(".").pop() || "").toLowerCase();
  if (["video/mp4", "audio/mp4", "audio/x-m4a", "audio/m4a"].includes(t) || ext === "m4a" || ext === "mp4") return { blob: file, type: "video/mp4" };
  if (["video/webm", "audio/webm"].includes(t) || ext === "webm") return { blob: file, type: "video/webm" };
  if (!window.AudioEncoder || !window.AudioData || !window.Mp4Muxer || !window.OfflineAudioContext) throw { code: "no_encoder" };
  const SR = 48000;
  let cfg = null;
  for (const c of [{ codec: "mp4a.40.2", mux: "aac", bitrate: 192000 }, { codec: "opus", mux: "opus", bitrate: 160000 }]) {
    try {
      const sup = await AudioEncoder.isConfigSupported({ codec: c.codec, sampleRate: SR, numberOfChannels: 2, bitrate: c.bitrate });
      if (sup && sup.supported) { cfg = c; break; }
    } catch (e) {}
  }
  if (!cfg) throw { code: "no_encoder" };
  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = new AC();
  let decoded;
  try { decoded = await ac.decodeAudioData(await file.arrayBuffer()); }
  catch (e) { throw { code: "decode" }; }
  finally { try { ac.close(); } catch (e) {} }
  const frames = Math.ceil(decoded.duration * SR);
  const off = new OfflineAudioContext(2, frames, SR);
  const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start();
  const buf = await off.startRendering();
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  const muxer = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), audio: { codec: cfg.mux, sampleRate: SR, numberOfChannels: 2 }, fastStart: "in-memory" });
  let encErr = null;
  const enc = new AudioEncoder({ output: (chunk, meta) => muxer.addAudioChunk(chunk, meta), error: e => { encErr = e; } });
  enc.configure({ codec: cfg.codec, sampleRate: SR, numberOfChannels: 2, bitrate: cfg.bitrate });
  const CH = 4800;
  for (let i = 0, n = 0; i < frames; i += CH, n++) {
    if (encErr) throw encErr;
    const len = Math.min(CH, frames - i);
    const data = new Float32Array(len * 2);
    data.set(L.subarray(i, i + len), 0); data.set(R.subarray(i, i + len), len);
    const ad = new AudioData({ format: "f32-planar", sampleRate: SR, numberOfFrames: len, numberOfChannels: 2, timestamp: Math.round(i / SR * 1e6), data });
    enc.encode(ad); ad.close();
    if (n % 40 === 0) {
      onProgress(Math.round(i / frames * 100));
      while (enc.encodeQueueSize > 30) await new Promise(r => setTimeout(r, 5));
      await new Promise(r => setTimeout(r, 0));
    }
  }
  await enc.flush(); enc.close();
  if (encErr) throw encErr;
  muxer.finalize();
  return { blob: new Blob([muxer.target.buffer], { type: "video/mp4" }), type: "video/mp4" };
}
async function syncBeat(sid, file) {
  const why = {
    no_encoder: "Plays on this device only. This browser can't convert it for syncing; Chrome or Edge can, or load an M4A.",
    decode: "Plays on this device only. Couldn't read this file to convert it.",
    too_large: "Plays on this device only. Too big to sync (20 MB max).",
    unsupported_type: "Plays on this device only. This format can't be synced.",
    quota_or_state: "Plays on this device only. Beat storage is full; delete old songs to free space.",
    rate_limited: "Plays on this device only. Too many uploads at once; load it again in a minute."
  };
  try {
    setBeatMsg(sid, "Getting it ready for your other devices…");
    const out = await toSyncable(file, p => setBeatMsg(sid, `Converting for sync… ${p}%`));
    if (out.blob.size > 20 * 1024 * 1024) throw { code: "too_large" };
    setBeatMsg(sid, "Uploading…");
    const r = await studio.assets.upload(out.blob, { type: out.type });
    const s = studio.songs.find(x => x.id === sid);
    if (!s) { studio.assets.delete(r.id).catch(() => {}); return; }
    const old = s.beatId;
    s.beatId = r.id; s.updatedAt = Date.now();
    delete s._new;
    if (sid === studio.cur) { studio.dirty = false; clearTimeout(studio.saveT); s.lyrics = lyr.value; s.title = titleIn.value; }
    await saveSong(s);
    if (old && old !== r.id && !studio.songs.some(x => x.beatId === old)) studio.assets.delete(old).catch(() => {});
    setBeatMsg(sid, "Synced to your account", "ok");
    renderSongSelect();
  } catch (e) {
    setBeatMsg(sid, why[e && e.code] || "Plays on this device only. Couldn't sync it this time; load it again to retry.");
  }
}
$("beatFile").addEventListener("change", e => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  const s = current(); if (!file || !s) return;
  const sid = s.id;
  if (studio.localBeat[sid]) URL.revokeObjectURL(studio.localBeat[sid].url);
  studio.localBeat[sid] = { url: URL.createObjectURL(file), name: file.name };
  s.beatName = file.name;
  delete studio.beatMsg[sid];
  ["bpm", "bpmAlt", "beatOffset", "bpmManual", "key", "keyAlt", "beatDur", "analyzed", "loopA", "loopB"].forEach(k => { s[k] = null; });
  loadBeatFor(s);
  markDirty();
  analyzeSong(sid, file);
  if (studio.mode !== "cloud") { setBeatMsg(sid, "Plays on this device only"); return; }
  if (!studio.assets) { setBeatMsg(sid, "Plays on this device only. Beat syncing is only for the page's owner and editors."); return; }
  syncBeat(sid, file);
});

// ---- player ----
const player = $("player"), seek = $("seek");
audio.loop = true;
function setPlayIcon() {
  const playing = !audio.paused;
  $("playIcon").innerHTML = playing ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
  $("playBtn").setAttribute("aria-label", playing ? "Pause" : "Play");
}
function togglePlay() {
  if (player.dataset.ready !== "true") { toast(audio.dataset.src ? "Beat is still loading" : "Load a beat first"); return; }
  if (audio.paused) audio.play().catch(() => toast("Tap play to start the beat")); else audio.pause();
}
function skip(d) {
  if (player.dataset.ready !== "true") return;
  const dur = audio.duration || 0;
  audio.currentTime = Math.min(Math.max(0, audio.currentTime + d), Math.max(0, dur - 0.05));
}
audio.addEventListener("loadedmetadata", () => { player.dataset.ready = "true"; $("plDur").textContent = fmt(audio.duration); });
audio.addEventListener("timeupdate", () => {
  $("plCur").textContent = fmt(audio.currentTime);
  if (!studio.seeking && audio.duration) seek.value = Math.round(audio.currentTime / audio.duration * 1000);
});
audio.addEventListener("play", setPlayIcon);
audio.addEventListener("pause", setPlayIcon);
audio.addEventListener("error", () => {
  if (!audio.dataset.src) return;
  player.dataset.ready = "false";
  const s = current();
  if (s && !studio.localBeat[s.id]) setBeatMsg(s.id, "Couldn't load this beat here. Load it again.");
});
seek.addEventListener("input", () => {
  studio.seeking = true;
  if (audio.duration) { const t = seek.value / 1000 * audio.duration; $("plCur").textContent = fmt(t); audio.currentTime = t; }
});
seek.addEventListener("change", () => { studio.seeking = false; });
$("playBtn").addEventListener("click", togglePlay);
$("back5").addEventListener("click", () => skip(-5));
$("fwd5").addEventListener("click", () => skip(5));
$("loopBtn").addEventListener("click", () => {
  audio.loop = !audio.loop; $("loopBtn").setAttribute("aria-pressed", String(audio.loop));
  toast(audio.loop ? "Loop on" : "Loop off");
});

// ---- writing tools ----
function lineBounds(pos) {
  const v = lyr.value;
  const start = v.lastIndexOf("\n", pos - 1) + 1;
  let end = v.indexOf("\n", pos); if (end < 0) end = v.length;
  return [start, end];
}
function rhymeFromLyrics(n) {
  const a = lyr.selectionStart, b = lyr.selectionEnd;
  let q = lyr.value.slice(a, b).trim();
  if (!q) {
    const lines = lyr.value.slice(0, a).split("\n");
    let line = lines.pop();
    while (!line.replace(/\[\d+:\d{2}\]/g, "").trim() && lines.length) line = lines.pop();
    const words = line.replace(/\[\d+:\d{2}\]/g, "").match(/[A-Za-zÀ-ɏ'’]+/g) || [];
    q = words.slice(-n).join(" ").replace(/’/g, "'");
  }
  if (!q) { toast("Write a line first"); return; }
  $("rhymeInput").value = q;
  runRhyme();
  $("finder").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}
function markTime() {
  if (player.dataset.ready !== "true") { toast("Load a beat first"); return; }
  const [start] = lineBounds(lyr.selectionStart);
  const tag = `[${fmt(audio.currentTime)}] `;
  const rest = lyr.value.slice(start);
  const m = rest.match(/^\[\d+:\d{2}\]\s?/);
  lyr.setRangeText(tag, start, start + (m ? m[0].length : 0), "preserve");
  markDirty();
  if (matchMedia("(pointer: fine)").matches) lyr.focus();
}
function jumpToLineTime() {
  if (player.dataset.ready !== "true") { toast("Load a beat first"); return; }
  const before = lyr.value.slice(0, lineBounds(lyr.selectionStart)[1]).split("\n").reverse();
  for (const line of before) {
    const m = line.match(/\[(\d+):(\d{2})\]/);
    if (m) { audio.currentTime = (+m[1]) * 60 + (+m[2]); audio.play().catch(() => {}); return; }
  }
  toast("No marked time on or above this line. Use Mark beat time first.");
}
function insertWord(w) {
  if (!current()) return;
  const a = lyr.selectionStart ?? lyr.value.length, b = lyr.selectionEnd ?? a;
  const before = lyr.value.slice(0, a);
  const pre = before && !/[\s(\["']$/.test(before) ? " " : "";
  lyr.setRangeText(pre + w, a, b, "end");
  markDirty();
  toast(`Added “${w}”`);
  if (matchMedia("(pointer: fine)").matches) lyr.focus();
}
function useWord(w) { if (tapMode === "insert") insertWord(w); else copy(w); }
function renderTap() {
  document.querySelectorAll("#tapMode button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.tap === tapMode)));
}
$("tapMode").addEventListener("click", e => {
  const b = e.target.closest("button[data-tap]"); if (!b) return;
  tapMode = b.dataset.tap; renderTap();
  try { localStorage.setItem(LS_TAP, tapMode); } catch (e2) {}
});
$("rhymeLast").addEventListener("click", () => rhymeFromLyrics(1));
$("rhymeLast2").addEventListener("click", () => rhymeFromLyrics(2));
$("markTime").addEventListener("click", markTime);
$("jumpTime").addEventListener("click", jumpToLineTime);
// keep the cursor where it was when a toolbar button is pressed
document.querySelectorAll(".edtools .tool").forEach(b => b.addEventListener("mousedown", e => e.preventDefault()));

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { e.preventDefault(); togglePlay(); return; }
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    if (e.key === "ArrowLeft") { e.preventDefault(); skip(-5); }
    else if (e.key === "ArrowRight") { e.preventDefault(); skip(5); }
    else if (e.code === "KeyR") { e.preventDefault(); rhymeFromLyrics(e.shiftKey ? 2 : 1); }
    else if (e.code === "KeyT") { e.preventDefault(); markTime(); }
    else if (e.code === "KeyJ") { e.preventDefault(); jumpToLineTime(); }
  }
});

// ---- boot ----
(function bootStudio() {
  studio.songs = loadLocalSongs().map(s => ({ title: "", lyrics: "", beatId: null, beatName: "", ...s }));
  let last = null;
  try { last = localStorage.getItem(LS_CUR); } catch (e) {}
  sortSongs();
  if (last && studio.songs.some(s => s.id === last)) studio.cur = last;
  ensureSong();
  renderTap();
  openSong(studio.cur);
  $("syncState").textContent = "Connecting…";
  initCloud();
})();

// ---- small screens: jump back to the lyrics after using the tools ----
(function backToLyrics() {
  const btn = $("toLyrics");
  if (!btn || !("IntersectionObserver" in window)) return;
  const wide = matchMedia("(min-width: 1040px)");
  let visible = true;
  const update = () => { btn.hidden = wide.matches || visible; };
  new IntersectionObserver(es => { visible = es[0].isIntersecting; update(); }).observe(lyr);
  wide.addEventListener ? wide.addEventListener("change", update) : wide.addListener(update);
  btn.addEventListener("click", () => {
    lyr.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  });
})();
