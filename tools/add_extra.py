#!/usr/bin/env python3
"""Append the pronunciations in tools/extra_words.txt to data/rhymes.txt.

data/rhymes.txt is ranked by how common each word is, so these go on the end as the rarest
entries. Words already in the file are skipped, so it's safe to run more than once
(for example after rebuilding the dictionary with build_dict.py and enc.py).
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONS = "B CH D DH F G HH JH K L M N NG P R S SH T TH V W Y Z ZH".split()
VOW = "AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW".split()
syms = CONS + [v + s for v in VOW for s in "012"]
chars = [c for c in map(chr, range(33, 127)) if c not in "|\\\"'`"]
enc = dict(zip(syms, chars))

dict_path = ROOT / "data" / "rhymes.txt"
lines = dict_path.read_text(encoding="utf-8").rstrip("\n").split("\n")
have = {l.split("|")[0] for l in lines}
added = 0
for row in (ROOT / "tools" / "extra_words.txt").read_text(encoding="utf-8").splitlines():
    if not row.strip() or row.startswith("#"):
        continue
    word, ph = row.split("|")
    if word in have:
        continue
    lines.append(word + "|" + "".join(enc[x] for x in ph.split()))
    have.add(word)
    added += 1
dict_path.write_text("\n".join(lines), encoding="utf-8")
print(f"Added {added} words to data/rhymes.txt")
