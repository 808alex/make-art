// ---- Beat credits: producer, link and licence saved with each song's beat ----
const LICENCES = {
  "": "Licence not set", own: "My own beat", "free-p": "Free for profit", "free-np": "Free for non-profit only",
  "lease-mp3": "Lease (MP3)", "lease-wav": "Lease (WAV)", "lease-stems": "Lease (stems)",
  unlimited: "Unlimited lease", exclusive: "Exclusive", unknown: "Licence unsure"
};
// licences that let you release the song (within whatever limits the lease sets)
const CLEARED = new Set(["own", "free-p", "lease-mp3", "lease-wav", "lease-stems", "unlimited", "exclusive"]);

const hasBeat = s => !!(s && (s.beatName || s.beatId || studio.localBeat[s.id]));
function licenceOk(s) { return !hasBeat(s) || CLEARED.has(s.licence || ""); }
function safeLink(u) {
  u = (u || "").trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes(".") ? x.href : ""; } catch (e) { return ""; }
}

let creditSeenBeat = {};
function renderCredits() {
  const s = current(), box = $("credits");
  if (!s || !hasBeat(s)) { box.hidden = true; return; }
  box.hidden = false;
  const ae = document.activeElement;
  if (ae !== $("crProd")) $("crProd").value = s.prod || "";
  if (ae !== $("crLink")) $("crLink").value = s.prodLink || "";
  if (ae !== $("crNotes")) $("crNotes").value = s.licenceNotes || "";
  $("crLic").value = s.licence || "";

  const sum = [];
  if (s.prod) sum.push("prod. " + s.prod);
  if (s.licence) sum.push(LICENCES[s.licence] || s.licence);
  $("creditSum").textContent = sum.length ? sum.join(" · ") : "Add the producer and licence";
  const flag = $("creditFlag"), ok = CLEARED.has(s.licence || "");
  flag.hidden = ok;
  flag.textContent = s.licence === "free-np" ? "not for release" : s.licence === "unknown" ? "check before release" : "no licence yet";

  const link = safeLink(s.prodLink), a = $("crOpen");
  a.hidden = !link;
  if (link) a.href = link;

  // producers you've used before, for quick picking
  const names = [...new Set(studio.songs.map(x => (x.prod || "").trim()).filter(Boolean))].sort((x, y) => x.localeCompare(y));
  $("prodList").innerHTML = names.map(n => `<option value="${esc(n)}"></option>`).join("");

  // show the producer next to the beat name in the player
  const local = studio.localBeat[s.id], name = (local && local.name) || s.beatName;
  if (name && audio.dataset.src) $("plName").textContent = name + (s.prod ? ` · prod. ${s.prod}` : "");

  // the first time a new beat lands on a song with no credits, open the card so they get filled in
  const beatKey = s.id + ":" + (s.beatName || s.beatId || "");
  if (!creditSeenBeat[beatKey]) {
    creditSeenBeat[beatKey] = true;
    if (!s.prod && !s.licence && local) box.open = true;
  }
}
function creditInput() {
  const s = current(); if (!s) return;
  s.prod = $("crProd").value.trim() || null;
  s.prodLink = $("crLink").value.trim() || null;
  s.licence = $("crLic").value || null;
  s.licenceNotes = $("crNotes").value.trim() || null;
  renderCredits();
  persistSong(s, 700);
  if (typeof renderTapes === "function") renderTapes();
}
["crProd", "crLink", "crNotes"].forEach(id => $(id).addEventListener("input", creditInput));
$("crLic").addEventListener("change", creditInput);
$("crLink").addEventListener("blur", () => {
  const v = $("crLink").value.trim();
  if (v && !safeLink(v)) toast("That link doesn't look right. Paste the full address from your browser.");
});
renderCredits();
