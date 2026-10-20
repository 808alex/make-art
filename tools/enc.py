CONS = "B CH D DH F G HH JH K L M N NG P R S SH T TH V W Y Z ZH".split()
VOW = "AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW".split()
syms = CONS + [v+s for v in VOW for s in "012"]
chars = [c for c in map(chr, range(33,127)) if c not in "|\\\"'`"]
m = dict(zip(syms, chars))
print(''.join(chars[:len(syms)]))
out=[]
for line in open('rhymes.txt').read().split('\n'):
    w,p = line.split('|')
    out.append(w+'|'+''.join(m[x] for x in p.split()))
open('rhymes.dat','w').write('\n'.join(out))
