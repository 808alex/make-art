// ---- Backup: move songs, EPs and the vault between browsers with a file (no account, no server) ----
// Beats aren't included: they're big audio files and stay in the browser they were loaded in.

// in browser-only mode, ask the browser to keep this site's storage instead of clearing it when space runs low
(function keepStorage() {
  const ask = () => { if (studio.mode === "local" && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); };
  if (studio.mode === "pending") setTimeout(keepStorage, 1500); else ask();
})();
function backupData() {
  const clean = o => { const c = {}; for (const k in o) if (!k.startsWith("_")) c[k] = o[k]; return c; };
  return {
    app: "make-art", version: 1, exportedAt: new Date().toISOString(),
    songs: studio.songs.filter(s => !(s._new && isEmpty(s))).map(clean),
    tapes: JSON.parse(JSON.stringify(tapes)),
    vault: vault.map(b => ({ id: b.id, text: b.text, createdAt: b.createdAt, from: b.from || "" }))
  };
}
$("bkDown").addEventListener("click", () => {
  saveNow();
  const blob = new Blob([JSON.stringify(backupData(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `make-art-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast("Backup downloaded");
});
$("bkFile").addEventListener("change", async e => {
  const f = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!f) return;
  let d;
  try { d = JSON.parse(await f.text()); } catch (err) { toast("That file isn't a Make Art backup."); return; }
  if (!d || d.app !== "make-art" || !Array.isArray(d.songs)) { toast("That file isn't a Make Art backup."); return; }
  saveNow();
  let added = 0, updated = 0;
  for (const s of d.songs) {
    if (!s || typeof s.id !== "string") continue;
    const have = studio.songs.find(x => x.id === s.id);
    if (!have) { studio.songs.push({ title: "", lyrics: "", beatId: null, beatName: "", ...s, _local: true }); added++; }
    else if ((s.updatedAt || 0) > (have.updatedAt || 0)) { Object.assign(have, s, { _local: true }); updated++; }
  }
  saveLocalSongs();
  if (studio.mode === "cloud") studio.songs.filter(s => s._local).forEach(s => saveSong(s));
  if (Array.isArray(d.tapes)) {
    for (const t of d.tapes) {
      if (!t || typeof t.id !== "string") continue;
      const i = tapes.findIndex(x => x.id === t.id);
      if (i < 0) tapes.push({ id: t.id, name: t.name || "", songIds: Array.isArray(t.songIds) ? t.songIds : [], createdAt: t.createdAt || 0 });
    }
    saveTapes();
  }
  if (Array.isArray(d.vault)) {
    const ids = new Set(vault.map(b => b.id));
    for (const b of d.vault) if (b && typeof b.text === "string" && !ids.has(b.id)) vault.push({ id: b.id || "b" + newId(), text: b.text, createdAt: b.createdAt || Date.now(), from: b.from || "" });
    saveVault();
  }
  renderSongSelect();
  if (current()) openSong(studio.cur);
  renderTapes(); renderVault();
  toast(`Restored: ${added} new song${added === 1 ? "" : "s"}${updated ? `, ${updated} updated` : ""}`);
});
