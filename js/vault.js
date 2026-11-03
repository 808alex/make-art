// ---- Bar vault: loose bars saved for later, synced like songs ----
// Stored as one document ("vault") in the viewer's own collection, mirrored in localStorage.
const LS_VAULT = "ma.vault.v1";
let vault = [], vaultAt = 0, vaultLocal = false, vaultDirty = false, vaultChain = Promise.resolve();
let vaultEndFilter = null, lastVaultKey = "";
try {
  const v = JSON.parse(localStorage.getItem(LS_VAULT) || "null");
  if (v && Array.isArray(v.bars)) { vault = v.bars; vaultAt = v.updatedAt || 0; vaultLocal = !!v.local; }
} catch (e) {}

function storeVaultLocal() { try { localStorage.setItem(LS_VAULT, JSON.stringify({ bars: vault, updatedAt: vaultAt, local: vaultLocal })); } catch (e) {} }
function saveVault() {
  vaultDirty = false;
  vaultAt = Date.now();
  if (studio.mode !== "cloud") { vaultLocal = true; storeVaultLocal(); return; }
  storeVaultLocal();
  const body = { kind: "vault", bars: vault.map(b => ({ id: b.id, text: b.text, createdAt: b.createdAt, from: b.from || "" })), updatedAt: vaultAt };
  vaultChain = vaultChain.then(() => studio.col.doc(VAULT_DOC).set(body)).then(() => { vaultLocal = false; storeVaultLocal(); })
    .catch(e => {
      vaultDirty = true;
      toast(e && e.code === "invalid_argument" ? "The vault is too full to sync. Delete some old bars." : "Couldn't sync the vault yet. Your bars are kept in this browser.");
    });
}
function applyRemoteVault(remote, first) {
  const rAt = remote ? remote.updatedAt || 0 : -1;
  if (first && vault.length && (vaultLocal || !remote) && vaultAt > rAt) { saveVault(); return; }
  if (remote && Array.isArray(remote.bars) && !vaultDirty && rAt >= vaultAt) {
    vault = remote.bars.filter(b => b && typeof b.text === "string").map(b => ({ id: b.id, text: b.text, createdAt: b.createdAt || 0, from: b.from || "" }));
    vaultAt = rAt; vaultLocal = false; storeVaultLocal();
    renderVault();
  }
}

// last word of a bar, and the sound it ends on (used for the "ends on" tag and filter)
function barEnd(text) {
  const lines = text.split("\n").map(l => l.replace(/\[[^\]]*\]/g, "").trim()).filter(Boolean);
  const words = (lines[lines.length - 1] || "").match(/[A-Za-zÀ-ɏ]+(?:['’][A-Za-z]+)*/g) || [];
  const w = words[words.length - 1];
  if (!w || !RH.loaded()) return null;
  const info = RH.wordInfo(w);
  return info ? { word: w.toLowerCase(), P: info.P, sound: RH.readable(info.P) } : null;
}
function ago(t) {
  const d = Math.floor((Date.now() - t) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(t).toLocaleDateString([], { day: "numeric", month: "short", year: new Date(t).getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

function renderVault() {
  const q = ($("vaultSearch").value || "").trim().toLowerCase();
  let list = vault.slice().sort((a, b) => b.createdAt - a.createdAt);
  if (q) list = list.filter(b => b.text.toLowerCase().includes(q));
  if (vaultEndFilter) list = list.filter(b => { const e = barEnd(b.text); return e && RH.familySim(vaultEndFilter.P, e.P) >= 0.82; });
  $("vaultCount").textContent = vault.length ? `${list.length === vault.length ? "" : list.length + " of "}${vault.length} bar${vault.length === 1 ? "" : "s"}` : "";
  const f = $("vaultFilter");
  f.hidden = !vaultEndFilter;
  if (vaultEndFilter) f.innerHTML = `Showing bars that end like <b>${esc(vaultEndFilter.word)}</b> <button type="button" class="ghost" id="vaultClearEnd">Show all</button>`;
  $("vaultEmpty").hidden = vault.length > 0;
  const key = list.map(b => b.id).join(",") + "|" + q + "|" + (vaultEndFilter ? vaultEndFilter.word : "");
  const anim = key !== lastVaultKey;
  lastVaultKey = key;
  $("vaultList").innerHTML = list.length ? list.map((b, i) => {
    const e = barEnd(b.text);
    return `<li class="bar${anim ? " in" : ""}" style="--i:${Math.min(i, 20)}" data-id="${esc(b.id)}">
      <p class="bartext">${esc(b.text)}</p>
      <div class="barmeta">
        ${e ? `<button type="button" class="endtag" data-end="${esc(b.id)}" title="Show bars that rhyme with this ending">ends on <b>${esc(e.sound)}</b></button>` : ""}
        <span class="barwhen">${esc(ago(b.createdAt))}${b.from ? ` · from ${esc(b.from)}` : ""}</span>
        <span class="baracts">
          <button type="button" class="tool" data-use="${esc(b.id)}">Add to song</button>
          <button type="button" class="tool" data-copybar="${esc(b.id)}">Copy</button>
          <button type="button" class="tool danger" data-del="${esc(b.id)}">Delete</button>
        </span>
      </div>
    </li>`;
  }).join("") : (vault.length ? `<li class="empty">No bars match.</li>` : "");
}

function addBar(text, from) {
  text = text.replace(/\s+$/, "").replace(/^\s*\n/, "");
  if (!text.trim()) { toast("Write a bar first"); return false; }
  if (text.length > 2000) { toast("That's more than a couple of bars. Keep vault entries short."); return false; }
  vault.push({ id: "b" + newId(), text, createdAt: Date.now(), from: from || "" });
  saveVault();
  lastVaultKey = "";
  renderVault();
  return true;
}
$("vaultSave").addEventListener("click", () => {
  if (addBar($("vaultInput").value)) { $("vaultInput").value = ""; toast("Saved to the vault"); $("vaultInput").focus(); }
});
$("vaultInput").addEventListener("keydown", e => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $("vaultSave").click(); }
});
$("vaultSearch").addEventListener("input", renderVault);

// from the editor: save the selected lines, or the line the cursor is on
$("toVault").addEventListener("mousedown", e => e.preventDefault());
$("toVault").addEventListener("click", () => {
  const a = lyr.selectionStart, b = lyr.selectionEnd, v = lyr.value;
  let text = v.slice(a, b);
  if (!text.trim()) {
    const start = v.lastIndexOf("\n", a - 1) + 1;
    let end = v.indexOf("\n", a); if (end < 0) end = v.length;
    text = v.slice(start, end);
  }
  text = text.replace(/\[\d+:\d{2}\]\s?/g, "");
  const s = current();
  if (addBar(text, s ? (s.title || "").trim() : "")) toast("Saved to the vault");
});

$("vaultList").addEventListener("click", e => {
  const btn = e.target.closest("button"); if (!btn) return;
  const id = btn.dataset.use || btn.dataset.copybar || btn.dataset.del || btn.dataset.end;
  const bar = vault.find(x => x.id === id); if (!bar) return;
  if (btn.dataset.use) {
    setView("write");
    const v = lyr.value, pos = lyr.selectionStart ?? v.length;
    const lineEnd = v.indexOf("\n", pos) < 0 ? v.length : v.indexOf("\n", pos);
    const before = v.slice(0, lineEnd);
    const ins = (before && !before.endsWith("\n") ? "\n" : "") + bar.text;
    lyr.setRangeText(ins, lineEnd, lineEnd, "end");
    markDirty();
    lyr.focus();
    toast("Added to your song");
  } else if (btn.dataset.copybar) {
    copy(bar.text);
  } else if (btn.dataset.del) {
    if (btn.dataset.armed !== "true") {
      btn.dataset.armed = "true"; btn.textContent = "Tap again";
      setTimeout(() => { if (btn.isConnected) { btn.dataset.armed = "false"; btn.textContent = "Delete"; } }, 3000);
      return;
    }
    vault = vault.filter(x => x.id !== id);
    saveVault(); renderVault();
    toast("Deleted from the vault");
  } else if (btn.dataset.end) {
    const en = barEnd(bar.text);
    if (en) { vaultEndFilter = en; renderVault(); }
  }
});
$("vaultFilter").addEventListener("click", e => {
  if (e.target.closest("#vaultClearEnd")) { vaultEndFilter = null; renderVault(); }
});

// Alt+V from anywhere: open the vault, ready to type
document.addEventListener("keydown", e => {
  if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === "KeyV") {
    e.preventDefault();
    setView("vault");
    setTimeout(() => $("vaultInput").focus(), 50);
  }
});

renderVault();
// end sounds need the rhyme dictionary; redraw once it has loaded
(function waitDict() { if (RH.loaded()) renderVault(); else setTimeout(waitDict, 400); })();
