// ---- Rhyme engine ----
const RH = (() => {
  const CONS = "B CH D DH F G HH JH K L M N NG P R S SH T TH V W Y Z ZH".split(" ");
  const VOW = "AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW".split(" ");
  const SYMS = CONS.concat(...VOW.map(v => [v + "0", v + "1", v + "2"]));
  const CHARS = "!#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghi";
  const DEC = {}; SYMS.forEach((s, i) => DEC[CHARS[i]] = s);

  // consonant features: [manner, place, voiced]
  const CF = {
    P:["stop","lab",0],B:["stop","lab",1],T:["stop","alv",0],D:["stop","alv",1],K:["stop","vel",0],G:["stop","vel",1],
    CH:["aff","pal",0],JH:["aff","pal",1],F:["fric","lab",0],V:["fric","lab",1],TH:["fric","den",0],DH:["fric","den",1],
    S:["sib","alv",0],Z:["sib","alv",1],SH:["sib","pal",0],ZH:["sib","pal",1],HH:["fric","glot",0],
    M:["nas","lab",1],N:["nas","alv",1],NG:["nas","vel",1],L:["liq","alv",1],R:["liq","ret",1],W:["gl","lab",1],Y:["gl","pal",1]
  };
  function csim(a, b) {
    if (a === b) return 1;
    const x = CF[a], y = CF[b]; if (!x || !y) return 0;
    const close = (m, n) => m === n || (m === "sib" && n === "aff") || (m === "aff" && n === "sib") || (m === "stop" && n === "aff") || (m === "aff" && n === "stop");
    if (x[0] === y[0] && x[1] === y[1]) return 0.85;           // voicing pair: t/d, s/z
    if (x[0] === y[0]) return x[0] === "nas" ? 0.8 : (x[0] === "liq" ? 0.6 : 0.7); // same manner: p/t/k, m/n
    if (close(x[0], y[0])) return 0.55;
    if (x[1] === y[1] && x[2] === y[2]) return 0.35;
    return 0.15;
  }
  const VN = {};
  const near = (a, b, s) => { VN[a + b] = s; VN[b + a] = s; };
  [["IH","IY",.6],["IH","EH",.6],["EH","AE",.65],["AE","AA",.5],["AA","AO",.85],["AA","AH",.6],["AH","UH",.6],["AH","ER",.45],
   ["UH","UW",.65],["OW","AO",.55],["OW","UW",.45],["EY","EH",.6],["EY","IY",.45],["AY","AA",.4],["AY","AE",.35],["AW","AA",.4],
   ["AW","AE",.35],["OY","AO",.45],["OY","AY",.45],["ER","UH",.4],["AH","EH",.4],["AH","IH",.4],["AO","AH",.5],["OW","AH",.35]]
   .forEach(r => near(...r));
  const WEAK = new Set(["AH","IH","IY","ER","UH"]);
  function vsim(a, b, unstressed) {
    if (a === b) return 1;
    let s = VN[a + b] || 0;
    if (unstressed) {
      if (WEAK.has(a) && WEAK.has(b)) s = Math.max(s, 0.75);
      else s = Math.max(s, s ? s + 0.15 : 0.2);
    }
    return Math.min(s, 1);
  }
  const isSZ = p => p === "S" || p === "Z";
  // word-final consonant cluster
  function clusterSim(a, b) {
    if (!a.length && !b.length) return 1;
    if (!a.length || !b.length) return 0.3;
    let A = a, B = b, plural = 1;
    if (A.length !== B.length) {
      if (A.length > B.length && isSZ(A[A.length - 1])) { A = A.slice(0, -1); plural = 0.9; }
      else if (B.length > A.length && isSZ(B[B.length - 1])) { B = B.slice(0, -1); plural = 0.9; }
      if (!A.length || !B.length) return 0.3 * plural + (A.length === B.length ? 0.6 : 0);
    }
    const last = csim(A[A.length - 1], B[B.length - 1]);
    const n = Math.max(A.length, B.length) - 1;
    if (n === 0) return last * plural;
    let rest = 0;
    for (let k = 1; k <= n; k++) {
      const x = A[A.length - 1 - k], y = B[B.length - 1 - k];
      rest += (x && y) ? csim(x, y) : 0.4;
    }
    return (0.6 * last + 0.4 * rest / n) * plural;
  }
  // consonants between two vowels (often crossing a word gap): the closing sound matters most
  function linkSim(a, b) {
    if (!a.length && !b.length) return 1;
    if (!a.length || !b.length) return 0.45;
    const first = csim(a[0], b[0]), last = csim(a[a.length - 1], b[b.length - 1]);
    const lenPen = Math.abs(a.length - b.length) > 1 ? 0.9 : 1;
    return (0.65 * first + 0.35 * last) * lenPen;
  }

  // phoneme list -> syllables [{v, s, c:[consonants after vowel]}]
  function syllabify(ph) {
    const syl = []; const onset = [];
    for (const p of ph) {
      const st = p.match(/\d$/);
      if (st) syl.push({ v: p.slice(0, -1), s: +st[0], c: [] });
      else (syl.length ? syl[syl.length - 1].c : onset).push(p);
    }
    return { syl, onset };
  }
  function tailStart(syl) {
    for (let i = syl.length - 1; i >= 0; i--) if (syl[i].s === 1) return i;
    for (let i = syl.length - 1; i >= 0; i--) if (syl[i].s === 2) return i;
    return Math.max(0, syl.length - 1);
  }
  function fromStart(syl, t) {
    return { syl, tail: syl.slice(t), pre: t > 0 ? syl[t - 1] : null, pre2: t > 1 ? syl[t - 2] : null };
  }
  // single-word style: rhyme part runs from the last stressed vowel
  function prep(ph) {
    const { syl } = syllabify(ph);
    if (!syl.length) return null;
    return fromStart(syl, tailStart(syl));
  }
  // last-n-syllables view of any candidate (used when the target is a phrase)
  function lastN(syl, n) {
    const t = Math.max(0, syl.length - n);
    return fromStart(syl, t);
  }

  // score candidate C against target T; returns {score, multi}
  function score(T, C) {
    const n = T.tail.length, m = C.tail.length;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      const a = T.tail[i];
      const bv = i < m ? C.tail[i] : null;
      const wv = (i === 0 || a.s === 1) ? 3 : 2, wc = i === n - 1 ? 2.5 : 1.2;
      num += wv * (bv ? vsim(a.v, bv.v, a.s === 0 && (!bv || bv.s === 0)) : 0);
      if (i === n - 1) num += wc * clusterSim(a.c, C.tail[m - 1].c);
      else num += wc * (bv ? linkSim(a.c, bv.c) : 0);
      den += wv + wc;
    }
    let s = num / den;
    const diff = Math.abs(n - m);
    if (diff === 1) s *= 0.8; else if (diff > 1) s *= 0.6;
    // a stressed beat landing on a weak syllable breaks the flow a little
    if (T.tail[0].s > 0 && C.tail[0] && C.tail[0].s === 0) s *= 0.92;
    let multi = 0;
    if (T.pre && C.pre) {
      multi = vsim(T.pre.v, C.pre.v, false);
      if (T.pre2 && C.pre2) multi = (multi * 2 + vsim(T.pre2.v, C.pre2.v, false)) / 3 + 0.15 * (vsim(T.pre2.v, C.pre2.v, false) > 0.9);
    }
    return { score: Math.round(Math.min(1, s) * 100), multi };
  }

  // ---- dictionary ----
  let words = [], pron = new Map(), rev = [], bySyl = [];
  const PHRASE_POOL = 7000;
  const JUNK = new Set("lol uh huh um er le la el ca de du un ms mr mrs dr st vs etc ii iii iv ok hmm ah eh oh aw mm ha hey nah tho pm am cm km kg mg ml tv dvd cd pc ye da di les des der das del los ab ad ac ap ar ax ba bc ce co cv dc ed em en es fa fi ft gi hr hq ie id ii il im io ja jr ka ki lb lo ma mo mt na ne nj ny pa pe pi po pr ps pt qc qi re rs sa sc se si sr ta te ti tx uk um un ur va vi wa wi xi ye yi ga hong kong".split(" "));
  const WEAK_END = new Set("the a an of to and or but as at by for from in into on onto than that with your my his her its our their is was are were be been am has had have".split(" "));
  function load(text) {
    const lines = text.split("\n");
    words = new Array(lines.length);
    bySyl = [];
    for (let i = 0; i < lines.length; i++) {
      const [w, code] = lines[i].split("|");
      const ph = [...code].map(ch => DEC[ch]);
      pron.set(w, ph);
      const S = syllabify(ph).syl;
      const o = { w, ph, rank: i, S, P: S.length ? fromStart(S, tailStart(S)) : null };
      words[i] = o;
      if (i < PHRASE_POOL && S.length && S.length <= 4 && w.length > 1 && !JUNK.has(w)) (bySyl[S.length] = bySyl[S.length] || []).push(o);
    }
    rev = words.map(o => [o.w.split("").reverse().join(""), o]).sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  }
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const tokens = s => norm(s).split(/[^a-z']+/).filter(Boolean);

  // letter-based fallbacks for the part of an unknown word that no dictionary ending covers
  const LV = { ee:"IY",ea:"IY",ie:"IY",oo:"UW",ai:"EY",ay:"EY",ei:"EY",ey:"EY",ou:"AW",ow:"AW",oa:"OW",oe:"OW",au:"AO",aw:"AO",oi:"OY",oy:"OY",ue:"UW",ew:"UW",
    a:"AE",e:"EH",i:"IH",o:"AA",u:"AH",y:"IY" };
  const LC2 = { ch:"CH",sh:"SH",th:"TH",ph:"F",ck:"K",ng:"NG",qu:"K W",wh:"W",gh:"" };
  const LC1 = { b:"B",c:"K",d:"D",f:"F",g:"G",h:"HH",j:"JH",k:"K",l:"L",m:"M",n:"N",p:"P",q:"K",r:"R",s:"S",t:"T",v:"V",w:"W",x:"K S",y:"Y",z:"Z" };
  function lettersToCons(str) {
    const out = []; let i = 0;
    str = str.replace(/(.)\1/g, "$1");
    while (i < str.length) {
      const two = str.slice(i, i + 2);
      if (LC2[two] !== undefined) { if (LC2[two]) out.push(...LC2[two].split(" ")); i += 2; continue; }
      const one = LC1[str[i]]; if (one) out.push(...one.split(" ")); i++;
    }
    return out;
  }
  function vowelOf(g) { return LV[g] || LV[g.slice(0, 2)] || LV[g[0]] || "AH"; }

  // guess pronunciation of an unknown word: borrow the sound of the longest matching dictionary ending,
  // then sound out whatever comes before it letter by letter
  function guess(w) {
    const r = w.split("").reverse().join("");
    let lo = 0, hi = rev.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (rev[mid][0] < r) lo = mid + 1; else hi = mid; }
    let best = null, bestL = 0;
    for (let k = Math.max(0, lo - 40); k < Math.min(rev.length, lo + 40); k++) {
      const s = rev[k][0]; let L = 0;
      while (L < s.length && L < r.length && s[L] === r[L]) L++;
      if (L > bestL || (L === bestL && best && rev[k][1].rank < best.rank)) { bestL = L; best = rev[k][1]; }
    }
    if (!best || bestL < 2) return null;
    const suffix = w.slice(w.length - bestL), prefix = w.slice(0, w.length - bestL);
    const groupsS = (suffix.match(/[aeiouy]+/g) || []).length || 1;
    const { syl } = syllabify(best.ph);
    const take = syl.slice(Math.max(0, syl.length - groupsS)).map(x => ({ ...x, c: [...x.c] }));
    const hasStress = take.some(x => x.s === 1);
    const out = [];
    // prefix: consonants + vowel groups, carrying the suffix's leading consonants as the last coda
    const parts = prefix.match(/[aeiouy]+|[^aeiouy]+/g) || [];
    const lead = (suffix.match(/^[^aeiouy]+/) || [""])[0];
    const vIdx = parts.map((p, i) => /^[aeiouy]/.test(p) ? i : -1).filter(i => i >= 0);
    parts.forEach((p, i) => {
      if (/^[aeiouy]/.test(p) && !(i === 0 && p === "y")) {
        const stressed = !hasStress && i === vIdx[vIdx.length - 1];
        out.push(vowelOf(p) + (stressed ? 1 : (hasStress ? 2 : 0)));
      } else out.push(...lettersToCons(p));
    });
    if (vIdx.length) out.push(...lettersToCons(lead));
    if (!hasStress && !vIdx.length) take[0].s = 1;
    for (const x of take) { out.push(x.v + x.s); out.push(...x.c); }
    return out;
  }
  function wordPron(t) {
    let p = pron.get(t) || pron.get(t.replace(/'/g, ""));
    if (p) return { p, g: false };
    p = guess(t.replace(/'/g, ""));
    return p ? { p, g: true } : null;
  }

  // Candidate phrases (brands, sayings): stress-based view + full syllables for phrase targets
  function prepCandidate(text) {
    const toks = tokens(text); if (!toks.length) return null;
    let ph = [];
    toks.forEach((t, i) => {
      const r = wordPron(t); if (!r) return;
      ph = ph.concat(i < toks.length - 1 ? r.p.map(x => x.replace(/1$/, "2")) : r.p);
    });
    if (!ph.length) return null;
    const S = syllabify(ph).syl;
    return { S, P: fromStart(S, tailStart(S)) };
  }

  // Target: one word -> classic rhyme tail; 2+ words -> the whole flow from the first stressed beat (max 4 syllables)
  function prepTarget(text) {
    const toks = tokens(text);
    if (!toks.length) return null;
    let ph = [], guessed = false, wordStarts = [];
    for (const t of toks) {
      const r = wordPron(t); if (!r) continue;
      if (r.g) guessed = true;
      wordStarts.push(syllabify(ph).syl.length);
      ph = ph.concat(r.p);
    }
    if (!ph.length) return null;
    const syl = syllabify(ph).syl;
    if (!syl.length) return null;
    if (toks.length === 1) {
      const T = fromStart(syl, tailStart(syl));
      return { T, phrase: false, guessed, words: toks };
    }
    // first stressed syllable of the phrase
    let t = syl.findIndex(x => x.s > 0); if (t < 0) t = 0;
    if (syl.length - t > 4) {
      t = syl.length - 4;
      const k = syl.findIndex((x, i) => i >= t && x.s > 0);
      if (k >= 0 && syl.length - k >= 2) t = k;
    }
    return { T: fromStart(syl, t), phrase: true, guessed, words: toks };
  }

  function scoreWord(Q, o) {
    if (!Q.phrase) return score(Q.T, o.P);
    const n = Q.T.tail.length;
    return score(Q.T, o.S.length >= n ? lastN(o.S, n) : fromStart(o.S, 0));
  }
  function scoreCand(Q, c) {
    if (!Q.phrase) return score(Q.T, c.P);
    const n = Q.T.tail.length;
    return score(Q.T, c.S.length >= n ? lastN(c.S, n) : fromStart(c.S, 0));
  }

  // ---- phrase builder: split the target's syllables into 2-3 word slots and fill each slot ----
  function splits(n) {
    const out = [];
    const rec = (left, acc) => {
      if (left === 0) { if (acc.length >= 2) out.push(acc); return; }
      if (acc.length === 3) return;
      for (let s = 1; s <= Math.min(3, left); s++) rec(left - s, acc.concat(s));
    };
    rec(n, []);
    return out;
  }
  function segScore(seg, S, isFirst, isFinal, nextLink) {
    const k = seg.length;
    const W = isFirst ? S.slice(S.length - k) : S;
    if (W.length !== k) return 0;
    let num = 0, den = 0;
    for (let i = 0; i < k; i++) {
      const a = seg[i], b = W[i];
      const wv = a.s > 0 ? 3 : 2;
      num += wv * vsim(a.v, b.v, a.s === 0 && b.s === 0); den += wv;
      if (a.s > 0 && b.s === 0) num -= 0.6;
      if (i < k - 1) { num += 1.2 * linkSim(a.c, b.c); den += 1.2; }
    }
    const lastT = seg[k - 1].c, lastW = W[k - 1].c;
    if (isFinal) { num += 2.5 * clusterSim(lastT, lastW); den += 2.5; }
    else {
      // the word's own ending should match the start of the gap; the next word supplies the rest
      const s = !lastW.length ? (lastT.length ? 0.6 : 1) : (lastT.length ? csim(lastT[0], lastW[0]) * (lastW.length > lastT.length ? 0.8 : 1) : 0.35);
      num += 1.5 * s; den += 1.5;
    }
    return num / den;
  }
  function buildPhrases(Q, min, exclude) {
    const tail = Q.T.tail, n = tail.length;
    if (n < 2) return [];
    const target = new Set(Q.words);
    const lastTarget = Q.words[Q.words.length - 1];
    const seen = new Set(), out = [];
    const cache = new Map();
    const topFor = (a, b, isFirst, isFinal, K) => {
      const key = a + "," + b + "," + isFirst + "," + isFinal + "," + K;
      if (cache.has(key)) return cache.get(key);
      const seg = tail.slice(a, b), k = seg.length, res = [];
      const pools = isFirst ? bySyl.slice(k) : [bySyl[k]];
      for (const pool of pools) for (const o of pool || []) {
        if (isFinal && (o.w === lastTarget || WEAK_END.has(o.w))) continue;
        if (isFirst && o.S.length > k + 1) continue;
        const s = segScore(seg, o.S, isFirst, isFinal);
        if (s >= 0.78) res.push({ o, s, k: s + 0.06 * (1 - o.rank / PHRASE_POOL) + (target.has(o.w) ? -0.1 : 0) });
      }
      res.sort((x, y) => y.k - x.k);
      const top = res.slice(0, K);
      cache.set(key, top);
      return top;
    };
    for (const sp of splits(n)) {
      const K = sp.length === 2 ? 16 : 7;
      const slots = []; let a = 0;
      sp.forEach((size, i) => { slots.push(topFor(a, a + size, i === 0, i === sp.length - 1, K)); a += size; });
      if (slots.some(s => !s.length)) continue;
      const combo = (i, acc) => {
        if (i === slots.length) {
          const ws = acc.map(x => x.o.w);
          const text = ws.join(" ");
          if (seen.has(text) || exclude.has(text)) return;
          if (ws.every(w => target.has(w))) return;
          if (new Set(ws).size < ws.length) return;
          seen.add(text);
          // keep the original stress pattern so stressed beats line up
          const S = []; acc.forEach(x => S.push(...x.o.S));
          const r = score(Q.T, lastN(S, n));
          if (r.score < min) return;
          const avgRank = acc.reduce((t, x) => t + x.o.rank, 0) / acc.length;
          out.push({ w: text, s: r.score, m: r.multi, k: r.score + 6 * r.multi + 8 * (1 - avgRank / PHRASE_POOL) - (acc.length - 2) * 5 - 8 * ws.filter(w => target.has(w)).length });
        } else for (const x of slots[i]) combo(i + 1, acc.concat(x));
      };
      combo(0, []);
    }
    out.sort((x, y) => y.k - x.k);
    // keep the list varied: cap repeats of the same last word
    const lastCount = {}, firstCount = {}, final = [];
    for (const r of out) {
      const ws = r.w.split(" "), l = ws[ws.length - 1], f = ws[0];
      if ((lastCount[l] || 0) >= 3 || (firstCount[f] || 0) >= 2) continue;
      lastCount[l] = (lastCount[l] || 0) + 1; firstCount[f] = (firstCount[f] || 0) + 1;
      final.push(r);
      if (final.length >= 150) break;
    }
    return final;
  }

  const READ = { AA:"ah",AE:"a",AH:"uh",AO:"aw",AW:"ow",AY:"eye",EH:"eh",ER:"er",EY:"ay",IH:"i",IY:"ee",OW:"oh",OY:"oy",UH:"oo",UW:"oo",
    B:"b",CH:"ch",D:"d",DH:"th",F:"f",G:"g",HH:"h",JH:"j",K:"k",L:"l",M:"m",N:"n",NG:"ng",P:"p",R:"r",S:"s",SH:"sh",T:"t",TH:"th",V:"v",W:"w",Y:"y",Z:"z",ZH:"zh" };
  function readable(T) { return T.tail.map(x => READ[x.v] + x.c.map(c => READ[c]).join("")).join("·"); }

  // rhyme-family similarity for colouring: the vowels carry it, endings only nudge
  function familySim(A, B) {
    const a = A.tail, b = B.tail;
    if (a.length !== b.length) return 0;
    let v = 0;
    for (let i = 0; i < a.length; i++) {
      const s = vsim(a[i].v, b[i].v, i > 0);
      if (i === 0 && s < 0.85) return 0;
      v += s;
    }
    v /= a.length;
    const c = clusterSim(a[a.length - 1].c, b[b.length - 1].c);
    return v * 0.85 + c * 0.15;
  }
  const infoCache = new Map();
  function wordInfo(raw) {
    const t = norm(raw).replace(/’/g, "'");
    if (infoCache.has(t)) return infoCache.get(t);
    let r = null;
    const w = t ? wordPron(t) : null;
    if (w) { const S = syllabify(w.p).syl; if (S.length) r = { P: fromStart(S, tailStart(S)), n: S.length, guessed: w.g }; }
    infoCache.set(t, r);
    return r;
  }
  return { load, prepTarget, prepCandidate, scoreWord, scoreCand, buildPhrases, readable, norm, tokens, wordInfo, score, familySim,
    get words() { return words; }, loaded: () => words.length > 0 };
})();
