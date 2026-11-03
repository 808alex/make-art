# Make Art

A music-making workspace for writing over beats: a lyrics studio with a beat player, rhyme finder, word generator and tracklist builder, all on one screen.

> Working name. It may change before launch.

**Use it in your browser:** https://808alex.github.io/make-art/ (landing page) · https://808alex.github.io/make-art/app/ (the app)

No account and nothing to install. Everything you write is saved in the browser you're using; use **Download backup** / **Restore backup** in the studio to move it to another browser.

## Features

**Studio**
- Lyrics editor that autosaves, with multiple songs
- Rhyme colours: words in the same rhyme family get the same highlight
- Syllable count on every bar
- Beat time marks (`[1:24]`), jump to a mark, and loop the section between marks
- An Options menu with tick boxes for rhyme colours, syllables, overused words and vault suggestions
- Keys: `Space` plays/pauses and `←` `→` skip 5 seconds (only when you're not typing)

**Writing habits**
- Words you lean on across all your songs get a wavy underline, with a "used a lot" list (e.g. "drip ×12 in 3 songs"); tap one to find it in the song

**Beat credits** (in the Beat dropdown, next to the beat controls)
- Producer, link, licence type and notes saved with each song's beat
- Flags beats that aren't cleared for release; tapes show the producer and count uncleared tracks, and copied tracklists include "prod."

**Beat player**
- Load MP3, WAV, M4A and other audio files: pick one, drag it anywhere onto the page, or paste a copied file
- BPM and key detection the moment a beat loads, shown in the player next to Keep pitch (adjusted for speed, and for pitch when pitch follows speed), plus tap tempo
- A–B loop, speed from 0.7× to 1.25×, with or without keeping the pitch
- Bar and beat counter

**Bar vault**
- Save a loose bar or two the moment it hits you
- Save the line you're on, or a selection, straight from a song
- Search your bars, filter by what they rhyme with, add one into the song you're writing
- While you write, the vault suggests saved bars that rhyme with your line or share its topic

**EP / Album**
- Group songs into an EP or album, reorder tracks, see the total runtime, get name ideas, copy the tracklist

**Rhyme finder**
- Perfect rhymes, slant rhymes and multis, scored 0–100
- Phrase mode: type 2–3 words and get phrases that match the whole flow
- Results grouped into Everyday, Brands & buzz, Archive pieces and Rare & distinct

**First-run tour**
- A short walkthrough of the app the first time it opens (skippable, reopen with How it works), including where your work is saved

**Looks**
- Five colour themes, each a pair: Classic (cobalt + marigold), Grape (violet + lime), Moss (green + pink), Lagoon (teal + coral), Cherry (red + sky blue)
- Every theme works in light and dark, following your device setting
- Motion: smooth scrolling on desktop, click ripples, staggered results, scroll reveals, and a play button and logo sticker that pulse with the beat

**Word generator** (its own tab next to Rhymes)
- Mostly calm everyday words, mixed with slang, labels, cars and places
- Pin and stash words, add your own

## Project layout

```
index.html        page markup (no <html>/<head>; the host adds that)
css/styles.css    layout and components; colour themes and font tokens at the top
css/look.css      theme picker and all motion
js/engine.js      rhyme engine: pronunciations, scoring, phrase builder
js/sayings.js     sayings used by the phrase column
js/generator.js   word pools, generator, stash, shared helpers (esc, toast, copy)
js/finder.js      rhyme finder UI
js/studio.js      songs, saving and sync, beat loading and upload, player basics
js/extras.js      rhyme colours, syllables, A–B loop, speed, BPM/key, tapes
js/vault.js       bar vault
js/credits.js     beat credits (producer, link, licence)
js/insights.js    vault suggestions while writing, overused words
js/backup.js      download / restore a backup file (browser-only mode)
site/             landing page for GitHub Pages (plus favicon and screenshot)
tools/build_site.py  builds the Pages site into _site/
js/look.js        theme switch, click ripples, scroll reveal, smooth scroll, beat pulse
data/rhymes.txt   ~42k words with encoded pronunciations (built by tools/)
tools/            scripts that build data/rhymes.txt
```

The scripts are plain browser scripts that load in order and share globals. There is no build step.

## Running locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000. Locally, songs save in your browser only.

## The website (GitHub Pages)

`tools/build_site.py` builds `_site/`: the landing page from `site/` at the root and the app at `/app/` (it wraps `index.html` in a full HTML document and copies `css/`, `js/` and `data/`). `tools/publish_pages.sh` builds it and pushes the result to the `gh-pages` branch, which GitHub Pages serves.

To turn it on once: repo **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` / `(root)` → Save**. After that, run `tools/publish_pages.sh` whenever you want the website updated.

## Saving and sync

There are two ways the same code saves your work:

- **On the website (or opened locally):** everything is saved in that browser: songs, EPs and the vault in localStorage, beats in IndexedDB. Nothing is sent anywhere. Backup files move songs, EPs and the vault between browsers (not beats).
- **As a Claude artifact:** songs, EPs, the vault and beats sync through the artifact's built-in storage, which is private to each signed-in Claude user:

- Songs: one document per song in the `data/users/<id>` collection
- Tapes: one document with id `tapes` in the same collection
- Bar vault: one document with id `vault` in the same collection
- Beats: uploaded as MP4/WebM audio (MP3/WAV are converted in the browser first)

All of this lives in `js/studio.js` (`initCloud`, `saveSong`, `applySnapshot`, `syncBeat`) and in `saveTapes` in `js/extras.js`. To launch as a standalone website, replace that layer with your own backend (for example Supabase for auth, database and file storage). The rest of the app doesn't depend on it.

## Rebuilding the rhyme dictionary

```
pip install cmudict wordfreq
python3 tools/build_dict.py   # writes rhymes.txt
python3 tools/enc.py          # compresses it to rhymes.dat, then copy to data/rhymes.txt
```

## Licence

The code is MIT licensed (see `LICENSE`): anyone can use, change and share it, as long as they keep the copyright notice crediting Alexander Zudins (808alex).

The word list in `data/rhymes.txt` is the one exception: it's shared under CC BY-SA 4.0 because its word ranking comes from wordfreq (see `data/NOTICE.md`).

## Credits

- Pronunciations: CMU Pronouncing Dictionary (BSD-style licence)
- Word ranking: word frequencies from [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer (data CC BY-SA 4.0)
- MP4 audio muxing: `mp4-muxer` (MIT), loaded from jsDelivr
- Smooth scrolling: `lenis` (MIT), loaded from jsDelivr
- Fonts: Rubik Mono One, Manrope and JetBrains Mono, all from Google Fonts (OFL)
