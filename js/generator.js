// ---- Word generator: pools, rolls, stash, shared helpers (esc, toast, copy) ----
const POOLS = {
  everyday: { label: "Everyday", words: ["midnight", "dusk", "dawn", "haze", "mist", "fog", "rain", "drizzle", "overcast", "thunder", "lightning", "storm", "breeze", "frost", "ember", "ash", "smoke", "static", "tide", "shore", "coast", "harbor", "pier", "dock", "marina", "river", "canyon", "desert", "dune", "ocean", "current", "undertow", "lagoon", "reef", "island", "cliff", "valley", "ridge", "summit", "forest", "pine", "cedar", "willow", "ivy", "moss", "fern", "lotus", "orchid", "sage", "lavender", "jasmine", "rose", "petal", "thorn", "moon", "moonlight", "sunset", "sunrise", "horizon", "orbit", "comet", "nebula", "eclipse", "starlight", "solstice", "equinox", "gravity", "satellite", "stone", "slate", "marble", "granite", "quartz", "onyx", "obsidian", "amber", "jade", "pearl", "silver", "gold", "cobalt", "indigo", "crimson", "ivory", "charcoal", "velvet", "silk", "suede", "linen", "leather", "denim", "wool", "cashmere", "satin", "glass", "neon", "chrome", "concrete", "steel", "copper", "bronze", "rooftop", "skyline", "alley", "subway", "highway", "overpass", "streetlight", "motel", "diner", "arcade", "balcony", "hallway", "lobby", "elevator", "corridor", "window", "curtain", "doorway", "staircase", "backseat", "dashboard", "rearview", "headlights", "taillights", "tunnel", "bridge", "crossing", "calm", "quiet", "still", "slow", "easy", "smooth", "cold", "warm", "faded", "lucid", "hazy", "golden", "hollow", "distant", "patient", "steady", "gentle", "restless", "weightless", "nostalgic", "mellow", "silent", "careless", "honest", "loyal", "humble", "hungry", "awake", "dreaming", "wandering", "vinyl", "cassette", "polaroid", "film camera", "headphones", "radio", "jukebox", "notebook", "postcard", "keychain", "sunglasses", "lighter", "candle", "lantern", "mirror", "compass", "passport", "suitcase", "ticket", "receipt", "envelope", "letter", "canvas", "ink", "frame", "coffee", "espresso", "matcha", "lemonade", "cherry", "peach", "mango", "citrus", "vanilla", "cinnamon", "mint", "honey", "sugar", "ice", "cruise", "roam", "wander", "float", "glide", "fade", "glow", "flicker", "shimmer", "hum", "whisper", "breathe", "linger", "unwind", "settle", "drift", "chase", "ride", "sail", "dream", "wait", "vanish", "return", "escape", "arrive", "stay", "burn", "freeze", "melt", "bloom", "shine", "memory", "moment", "silence", "distance", "motion", "rhythm", "tempo", "balance", "timing", "patience", "freedom", "solitude", "peace", "focus", "instinct", "presence", "legacy", "chapter", "season", "mood", "tone", "texture", "shade", "shadow", "reflection", "illusion", "mirage", "daydream", "lullaby", "melody", "harmony", "interlude", "outro", "encore", "afterglow", "aftermath", "blueprint", "wavelength", "headspace", "north", "west", "long drive", "late night", "slow motion", "deep end", "low tide", "high tide", "first light", "last call", "open road", "side street", "back road", "quiet hours", "city lights", "cold front", "night shift", "day off", "paper planes", "glass house", "soft focus", "white noise", "grey area", "blue hour", "golden hour", "after hours", "fever dream", "second wind", "slow burn", "far away", "nowhere", "somewhere", "elsewhere", "homesick", "sleepless", "vanishing point", "turning point", "loose change", "spare time", "free fall", "background noise", "paradise", "sanctuary", "oasis", "haven", "rainfall", "snowfall", "nightfall", "wildfire", "campfire", "firelight", "candlelight", "porch light", "sunroof", "convertible", "cruise control", "gas station", "corner store", "laundromat", "parking lot", "train station", "airport", "runway", "terminal", "layover", "saltwater", "riverbank", "shoreline", "coastline", "waterfront", "boardwalk", "lighthouse", "sailboat", "anchor", "compass rose", "ghost", "angel", "halo", "saint", "prophet", "poet", "stranger", "drifter", "outsider", "rebel", "runaway", "nomad", "wolf", "fox", "raven", "crow", "falcon", "panther", "tiger", "cobra", "stallion", "gemini", "scorpio", "aries", "leo", "atlas", "apollo", "orion", "phoenix", "eden", "odyssey", "sundown", "upstate", "downtown", "uptown", "midtown", "crosstown", "outskirts", "suburbs", "countryside", "hometown", "ceiling fan", "tv static", "phone light", "screen glow", "voicemail", "late reply", "read receipt", "airplane mode", "do not disturb", "no signal", "overtime", "all night", "slow dance", "long story", "small talk", "inside joke", "deja vu", "nightcap", "sunday", "saturday", "friday night", "summer", "winter", "autumn", "spring", "heavy rotation", "on repeat", "b-side", "deep cut", "demo", "rough draft", "first take", "voice note", "sketchbook", "weekend", "getaway", "road trip", "detour", "shortcut", "crossroads", "dead end", "fork in the road", "rear window", "side mirror"] },
  slang: { label: "Slang", words: ["drip", "sauce", "aura", "lowkey", "locked in", "tapped in", "cooked", "tuff", "icy", "valid", "peak", "wavey", "clean", "calm", "heavy", "smoke", "motion", "outside", "gassed", "the ends", "bet", "say less", "on sight", "plug", "bread", "guap", "bands", "racks", "finesse", "slide", "splurge", "pressure", "solid", "real one", "certified", "no cap", "crash out", "bando", "opps", "flex", "stack", "ice out", "big steppa", "ice cold", "mandem", "peng", "frosty", "geeked", "goated", "in my bag", "on the low", "pull up", "run it up", "made it out", "moving different", "quiet money", "no stress", "all good", "slow wine", "vibes", "on the road", "gang", "up next", "the plug", "day ones"] },
  internet: { label: "Sound & net", words: ["phonk","plugg","pluggnb","rage","jerk","hyperpop","digicore","opium","vamp","sigilkore","drill","grime","cloud rap","trap metal","glitch","liminal","backrooms","Frutiger Aero","vaporwave","Y2K","lore","render","hologram","chrome","808","autotune","sample flip","loop kit","dial-up","cyber","bitcrush","reverb","sidechain","low end","nightcore","witch house","memphis","bounce","jersey club","brazilian phonk","sped up","slowed","pitched","hi-hat roll","skrrt","adlib","stem","bootleg","white label","dubplate","mixtape","DJ drop","radio rip","voicemail","404","lag","ping","hitbox","patch","mod","seed","spawn","skin","render distance"] },
  brands: { label: "Archive labels", words: ["Raf Simons","Rick Owens","Maison Margiela","Helmut Lang","Number (N)ine","Undercover","Comme des Garçons","Yohji Yamamoto","Issey Miyake","Jean Paul Gaultier","Vivienne Westwood","Dior Homme","Hedi Slimane","Carol Christian Poell","Boris Bidjan Saberi","Julius","Kapital","Visvim","Bape","Chrome Hearts","Vetements","Balenciaga","Junya Watanabe","Ann Demeulemeester","Dirk Bikkembergs","Martine Rose","Stone Island","C.P. Company","Moschino","Mugler","Hysteric Glamour","Sacai","Lemaire","Our Legacy","Enfants Riches Déprimés","Kiko Kostadinov","Wales Bonner","Gallery Dept","The Soloist","If Six Was Nine","14th Addiction","Corteiz","Trapstar","Hellstar","Denim Tears","Arc'teryx Veilance","Acronym","Prada Linea Rossa","Avirex","Von Dutch","Ed Hardy","Evisu","True Religion","Akimbo Club","Neighborhood","WTAPS","Fear of God","Ksubi","Amiri","Palace","Supreme","Stüssy","Oakley","Moncler","Off-White","ERL","Blackmeans"] },
  pieces: { label: "Archive pieces", words: ["Tabi boots","Geobaskets","Ramones","Riot bomber","astro biker","skull cashmere","Scab jacket","mesh top","cross patch denim","shark hoodie","GATs","Triple S","skinny denim '07","ghost piece","boro jacket","FBT moccasins","Pleats Please","wool gabardine coat","orb necklace","Alpha SV","XT-6","Shox TL","Air Max 95","Alcatraz cargos","Maya puffer","Detroit jacket","racing jacket","bondage trousers","MA-1","kilt","leather blouson","cargo flares","bumster","tank top","chain wallet","trucker hat","cross pendant","tennis chain","Cuban link","grillz","stacked denim","drop crotch","balaclava","beanie","durag","shutter shades","Juliet sunglasses","goggles","utility vest","tactical rig","waxed jacket","shearling","fur trapper","rhinestone tee","distressed hoodie","pony hair boots","creepers","Dunks","Air Force 1","TN","Foamposite","Rimowa","Goyard tote","Margiela Replica","painter pants"] },
  cars: { label: "Whips", words: ["Murciélago","Countach","Huracán","Urus","Aventador","Diablo","Cullinan","Phantom","Wraith","Ghost","Maybach","Bentayga","Testarossa","Enzo","LaFerrari","F40","Skyline R34","Supra MK4","RX-7","Evo IX","STI","E30 M3","E46","G-Wagon","911 Turbo","Carrera GT","Black Series","Hellcat","Trackhawk","Escalade","Range Rover","Cayenne","Benz","Bimmer","Lambo","'Rari","Chiron","Veyron","Zonda","Huayra","Jesko","P1","Senna","Viper","C8","Cutlass","'64 Impala","Monte Carlo","Grand National","S-Class","2JZ","Spyder","drophead","coupé","Silvia S15","NSX","Integra Type R","Golf R32","Audi R8","Quattro","Stingray","Mustang Boss","Charger","Celica","Corolla AE86","Miata","Defender","Land Cruiser","Hilux","Mulsanne","Continental GT"] },
  places: { label: "Cities & cribs", words: ["Monaco","Monte Carlo","Saint-Tropez","Ibiza","Dubai","Tokyo","Harajuku","Shibuya","Osaka","Seoul","Paris","Milan","Antwerp","Berlin","London","Peckham","Tottenham","Dublin","Atlanta","Houston","Memphis","Compton","Harlem","the Bronx","Miami","Lagos","Accra","Kingston","Medellín","Rio","São Paulo","Bel Air","Calabasas","Malibu","Hollywood Hills","Beverly Hills","Marbella","Lake Como","Zurich","Geneva","Reykjavík","Kyoto","Bangkok","Bali","Zanzibar","Havana","Copenhagen","Oslo","Riga","Tallinn","Amsterdam","Ginza","Roppongi","Hong Kong","Shanghai","Mumbai","Cape Town","Johannesburg","Toronto","Vancouver","penthouse","chateau","villa","mansion","trap house","duplex","loft","compound","estate","hacienda","brownstone","high-rise","crib","yacht","jet","condo","safe house","summer house","basement studio"] },
  coined: { label: "Coined", words: [] },
  yours: { label: "Yours", words: [] }
};

const SYL_A = ["sa","so","ve","va","lo","la","ma","mi","no","na","ka","ko","ri","ra","se","sol","mar","vel","cal","el","al","ar","ka","lu","ne","ze","ta","to","da","di"];
const SYL_B = ["ren","lo","no","ra","ro","vo","ria","lia","ne","ni","ro","sa","to","vi","ka","ri","la","ven","ron","rin","lin","mo","do","de"];
const SYL_END = ["","","","n","s","l"];
const SUFFIX = ["wave","core","ville","side","town"];
const PREFIX = ["Neo","Saint ","Ultra","Lo-"];

const pick = a => a[Math.floor(Math.random()*a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
};

let state = {
  enabled: new Set(store.get("wp.enabled2", ["everyday","slang","brands","cars","places"])),
  count: store.get("wp.count", 12),
  mutate: store.get("wp.mutate2", 0),
  cards: [],
  stash: store.get("wp.stash", []),
  custom: store.get("wp.custom", "")
};

function parseCustom(){
  POOLS.yours.words = state.custom.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
  if (!POOLS.yours.words.length) state.enabled.delete("yours");
}

function realWords(){
  const all = [];
  for (const k in POOLS) if (k !== "coined") all.push(...POOLS[k].words);
  return all;
}
function letters(w){ return w.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-zA-Z]/g,"").toLowerCase(); }

function coin(){
  const ok = s => s.length >= 4 && s.length <= 9 && /^[^aeiou]{0,2}([aeiouy]{1,2}[^aeiouy]{1,2})+[aeiouy]{0,2}$/.test(s) && !/[^aeiouy]{2}$/.test(s.slice(-2)) ;
  if (Math.random() < 0.35) {
    // Blend two real words: front of one + back of another
    for (let t = 0; t < 12; t++) {
      const a = letters(pick(realWords())), b = letters(pick(realWords()));
      if (a.length < 4 || b.length < 4 || a === b) continue;
      const out = a.slice(0, Math.max(2, Math.round(a.length * 0.5))) + b.slice(Math.round(b.length * 0.5));
      if (ok(out)) return { w: cap(out), src: "blend" };
    }
  }
  let s = pick(SYL_A) + pick(SYL_B);
  if (Math.random() < 0.3) s += pick(SYL_B);
  s = s.replace(/([aeiou])\1+/g, "$1");
  if (/[aeiou]$/.test(s)) s += pick(SYL_END);
  return { w: cap(s), src: "fresh" };
}

const MUTATIONS = [
  w => w + pick(SUFFIX),
  w => pick(PREFIX) + w,
  w => w.replace(/er\b/gi,"a").replace(/ing\b/gi,"in'"),
  w => { const b = letters(pick(realWords())); return w.replace(/\s+/g,"") + b.slice(Math.floor(b.length/2)); }
];
function mutate(w){
  const lvl = state.mutate;
  if (lvl === 0) return { w, m: false };
  const chance = lvl === 1 ? 0.35 : 0.8;
  if (Math.random() > chance) return { w, m: false };
  let out = pick(MUTATIONS)(w);
  if (lvl === 2 && Math.random() < 0.35) out = pick(MUTATIONS)(out);
  return { w: out === w ? w + pick(SUFFIX) : out, m: true };
}

function rollOne(){
  const cats = [...state.enabled];
  if (!cats.length) return { w: "pick a pool", cat: "—", pinned: false };
  const W = c => c === "everyday" ? 6 : c === "yours" ? 2 : 1;
  let r = Math.random() * cats.reduce((t, c) => t + W(c), 0), cat = cats[0];
  for (const c of cats) { r -= W(c); if (r < 0) { cat = c; break; } }
  if (cat === "coined") {
    const c = coin();
    return { w: c.w, cat, note: c.src, pinned: false };
  }
  const base = pick(POOLS[cat].words);
  const m = mutate(base);
  return { w: m.w, cat, note: m.m ? "mutated" : "", pinned: false };
}

function reroll(){
  const next = [];
  const kept = state.cards.filter(c => c.pinned);
  for (let i = 0; i < state.count; i++) {
    if (kept[i]) next.push(kept[i]);
    else {
      let c, tries = 0;
      do { c = rollOne(); tries++; } while (tries < 8 && (next.some(x => x.w === c.w) || kept.some(x => x.w === c.w)));
      next.push({ ...c, fresh: true });
    }
  }
  // keep any extra pins beyond count
  state.cards = next.concat(kept.slice(state.count));
  renderGrid();
}

const ICON_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/></svg>';
const ICON_RHYME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h11"/><path d="M4 12h7"/><path d="M4 17h5"/><path d="M15 17a3 3 0 1 0 6 0v-7l-6 1.5"/></svg>';
const ICON_STAR ='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';

function esc(s){ return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])); }

function renderGrid(){
  const g = document.getElementById("grid");
  g.innerHTML = state.cards.map((c, i) => {
    const label = POOLS[c.cat] ? POOLS[c.cat].label : c.cat;
    const inStash = state.stash.includes(c.w);
    return `<div class="card${c.pinned ? " pinned" : ""}${c.fresh ? " fresh" : ""}">
      <button class="word" type="button" data-copy="${i}" aria-label="Copy ${esc(c.w)}">
        <span class="w">${esc(c.w)}</span>
        <span class="tag">${esc(label)}${c.note ? ` · <b>${esc(c.note)}</b>` : ""}</span>
      </button>
      <div class="acts">
        <button class="icon" type="button" data-rhyme="${i}" aria-label="Find rhymes">${ICON_RHYME}</button>
        <button class="icon" type="button" data-star="${i}" aria-pressed="${inStash}" aria-label="Stash">${ICON_STAR}</button>
        <button class="icon" type="button" data-pin="${i}" aria-pressed="${c.pinned}" aria-label="Pin">${ICON_PIN}</button>
      </div>
    </div>`;
  }).join("");
  state.cards.forEach(c => c.fresh = false);
}

function renderStash(){
  const s = document.getElementById("stash");
  if (!state.stash.length) { s.innerHTML = '<p class="empty">Star a word to stash it here. Stays in this browser.</p>'; return; }
  s.innerHTML = state.stash.map((w, i) => `<span class="s"><span>${esc(w)}</span><button type="button" data-unstash="${i}" aria-label="Remove ${esc(w)}">×</button></span>`).join("");
}

function renderControls(){
  document.getElementById("chips").innerHTML = Object.entries(POOLS).map(([k, p]) => {
    if (k === "yours" && !POOLS.yours.words.length) return "";
    return `<button class="chip" type="button" data-cat="${k}" aria-pressed="${state.enabled.has(k)}">${p.label}</button>`;
  }).join("");
  document.getElementById("count").innerHTML = [6, 12, 24].map(n =>
    `<button type="button" data-count="${n}" aria-pressed="${state.count === n}">${n}</button>`).join("");
  document.getElementById("mutate").innerHTML = [["Off",0],["Light",1],["Heavy",2]].map(([l, v]) =>
    `<button type="button" data-mut="${v}" aria-pressed="${state.mutate === v}">${l}</button>`).join("");
}

let toastT;
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1400);
}
function copy(text){
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast(`Copied “${text.length > 40 ? text.slice(0,40) + "…" : text}”`), () => toast("Copy blocked here — long-press the word to select it"));
  } else toast("Copy blocked here — long-press the word to select it");
}

document.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  const d = t.dataset;
  if (d.cat) {
    state.enabled.has(d.cat) ? state.enabled.delete(d.cat) : state.enabled.add(d.cat);
    store.set("wp.enabled2", [...state.enabled]); renderControls();
  } else if (d.count) {
    state.count = +d.count; store.set("wp.count", state.count); renderControls(); reroll();
  } else if (d.mut !== undefined) {
    state.mutate = +d.mut; store.set("wp.mutate2", state.mutate); renderControls();
  } else if (d.copy !== undefined) {
    useWord(state.cards[+d.copy].w);
  } else if (d.pin !== undefined) {
    const c = state.cards[+d.pin]; c.pinned = !c.pinned; renderGrid();
  } else if (d.star !== undefined) {
    const w = state.cards[+d.star].w;
    const i = state.stash.indexOf(w);
    i >= 0 ? state.stash.splice(i, 1) : state.stash.unshift(w);
    store.set("wp.stash", state.stash); renderGrid(); renderStash();
    if (i < 0) toast(`Stashed “${w}”`);
  } else if (d.rhyme !== undefined) {
    const inp = document.getElementById("rhymeInput");
    inp.value = state.cards[+d.rhyme].w; runRhyme();
    document.getElementById("finder").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  } else if (d.rcopy !== undefined) {
    useWord(d.rcopy);
  } else if (d.rmore) {
    rhymeOpen[d.rmore] = !rhymeOpen[d.rmore]; renderRhymes();
  } else if (d.unstash !== undefined) {
    state.stash.splice(+d.unstash, 1); store.set("wp.stash", state.stash); renderStash(); renderGrid();
  } else if (t.id === "reroll") reroll();
  else if (t.id === "copyStash") { state.stash.length ? copy(state.stash.join(", ")) : toast("Stash is empty"); }
  else if (t.id === "clearStash") { state.stash = []; store.set("wp.stash", []); renderStash(); renderGrid(); }
  else if (t.id === "saveCustom") {
    state.custom = document.getElementById("custom").value; store.set("wp.custom", state.custom);
    parseCustom();
    if (POOLS.yours.words.length) { state.enabled.add("yours"); store.set("wp.enabled2", [...state.enabled]); toast(`Added ${POOLS.yours.words.length} words`); }
    else toast("No words found — separate them with commas");
    renderControls(); reroll(); buildPoolCands(); runRhyme();
  }
});
