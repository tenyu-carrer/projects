# usage: insert.py item.md marker_heading_text addition_file
import sys,re
p,marker,addf=sys.argv[1:4]
t=open(p,encoding='utf-8').read(); add=open(addf,encoding='utf-8').read().rstrip()+"\n\n"
i=t.index('===D 完全パック.md'); j=t.index('\n===',i+5)
pack=t[i:j]
k=pack.index(marker); k=pack.rfind('\n## ',0,k)+1
pack=pack[:k]+add+pack[k:]
n=[0]
def ren(m):
    n[0]+=1; return f"## {n[0]}｜"
pack=re.sub(r'^## \d+｜',ren,pack,flags=re.M)
t=t[:i]+pack+t[j:]; open(p,'w',encoding='utf-8').write(t)
