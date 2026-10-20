import cmudict, wordfreq, re
d = cmudict.dict()
block = set("""nigger nigga niggas niggers faggot faggots fag fags dyke dykes kike kikes spic spics chink chinks gook gooks wetback wetbacks tranny trannies retard retards retarded coon coons beaner beaners paki pakis raghead ragheads towelhead gypsy gyppo""".split())
rows = []
for w, prons in d.items():
    if not re.fullmatch(r"[a-z]+('[a-z]+)?", w) or w in block: continue
    z = wordfreq.zipf_frequency(w, 'en')
    if z < 1.9: continue
    if len(w) == 1 and w not in ('a','i'): continue
    rows.append((z, w, ' '.join(prons[0])))
rows.sort(key=lambda r: -r[0])
rows = rows[:42000]
with open('rhymes.txt','w') as f:
    f.write('\n'.join(f"{w}|{p}" for z,w,p in rows))
print(len(rows), rows[-1])
