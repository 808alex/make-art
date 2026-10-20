# Make Art

A music-making workspace for writing over beats: a lyrics studio with a beat player, rhyme finder, word generator and tracklist builder, all on one screen.

> Working name. It may change before launch.

## Features

**Studio**
- Lyrics editor that autosaves, with multiple songs
- Rhyme colours: words in the same rhyme family get the same highlight
- Syllable count on every bar
- Beat time marks (`[1:24]`), jump to a mark, and loop the section between marks
- Shortcuts: `Esc` play/pause · `Alt+←/→` 5 s back/forward · `Alt+R` rhyme the last word · `Alt+T` mark time · `[` `]` set loop A/B

**Beat player**
- Load MP3, WAV, M4A and other audio files
- BPM and key detection, plus tap tempo
- A–B loop, speed from 0.7× to 1.25×, with or without keeping the pitch
- Bar and beat counter

**Tapes**
- Group songs into a tape or EP, reorder tracks, see the total runtime, get name ideas, copy the tracklist

**Rhyme finder**
- Perfect rhymes, slant rhymes and multis, scored 0–100
- Phrase mode: type 2–3 words and get phrases that match the whole flow
- Results grouped into Everyday, Brands & buzz, Archive pieces and Rare & distinct

**Word generator**
- Mostly calm everyday words, mixed with slang, labels, cars and places
- Pin and stash words, add your own

## Project layout

```
index.html        page markup (no <html>/<head>; the host adds that)
css/styles.css    all styles, colour tokens at the top, light and dark themes
js/engine.js      rhyme engine: pronunciations, scoring, phrase builder
js/sayings.js     sayings used by the phrase column
js/generator.js   word pools, generator, stash, shared helpers (esc, toast, copy)
js/finder.js      rhyme finder UI
js/studio.js      songs, saving and sync, beat loading and upload, player basics
js/extras.js      rhyme colours, syllables, A–B loop, speed, BPM/key, tapes
data/rhymes.txt   ~42k words with encoded pronunciations (built by tools/)
tools/            scripts that build data/rhymes.txt
```

The scripts are plain browser scripts that load in order and share globals. There is no build step.

## Running locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Locally, songs save in your browser only.

## Saving and sync

Right now the app is published as a Claude artifact. Songs, tapes and beats sync through the artifact's built-in storage, which is private to each signed-in user:

- Songs: one document per song in the `data/users/<id>` collection
- Tapes: one document with id `tapes` in the same collection
- Beats: uploaded as MP4/WebM audio (MP3/WAV are converted in the browser first)

All of this lives in `js/studio.js` (`initCloud`, `saveSong`, `applySnapshot`, `syncBeat`) and in `saveTapes` in `js/extras.js`. To launch as a standalone website, replace that layer with your own backend (for example Supabase for auth, database and file storage). The rest of the app doesn't depend on it.

## Rebuilding the rhyme dictionary

```
pip install cmudict wordfreq
python3 tools/build_dict.py   # writes rhymes.txt
python3 tools/enc.py          # compresses it to rhymes.dat, then copy to data/rhymes.txt
```

## Credits and licences to sort before launch

- Pronunciations: CMU Pronouncing Dictionary (BSD-style licence)
- Word ranking: frequencies from the `wordfreq` package. Its data is CC BY-SA 4.0, so before a public launch either credit it properly or re-rank the words from a source with a looser licence.
- MP4 audio muxing: `mp4-muxer` (MIT), loaded from jsDelivr
- Fonts: Rubik Mono One, Manrope and JetBrains Mono, all from Google Fonts (OFL)
