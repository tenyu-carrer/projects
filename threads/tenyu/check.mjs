// @tenyu_kun 作り置きの品質チェック（2026-10-27・オーナー「品質確認から」）
// 使い方: node threads/tenyu/check.mjs   → 問題があれば理由を出して終了コード1
// 機械で見るもの: 長さ・絵文字の数・書き出しのかぶり・共感から入る型・AIっぽい言い回し・リンク・問いかけ締めの多さ・作り置き同士の似すぎ・qa の印
// 人が見るもの（qa の印を付ける前に必ず）: 全文を読む／体験談は事実だけ（作り話の「僕は〜しました」はNG）／AIの機能の説明が正しいか／最近の投稿と話題がかぶっていないか
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const file=path.join(path.dirname(fileURLToPath(import.meta.url)),'queue.json');
const {items=[]}=JSON.parse(fs.readFileSync(file,'utf8'));
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());

const seg=new Intl.Segmenter('ja',{granularity:'grapheme'});
const emojiCount=t=>[...seg.segment(t)].filter(s=>/\p{Extended_Pictographic}/u.test(s.segment)).length;
const norm=t=>String(t||'').replace(/https?:\/\/\S+/gi,'').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu,'').replace(/[\p{P}\p{S}\s]/gu,'');
const bg=s=>{const m=new Map();for(let i=0;i<s.length-1;i++){const g=s.slice(i,i+2);m.set(g,(m.get(g)||0)+1);}return m;};
const sim=(a,b)=>{const A=bg(a),B=bg(b);let x=0,t=0;for(const v of A.values())t+=v;for(const v of B.values())t+=v;for(const [g,v] of A)x+=Math.min(v,B.get(g)||0);return t?2*x/t:0;};
const lastLine=t=>t.trim().split('\n').filter(Boolean).pop()||'';
const endsWithQuestion=t=>/[？?]\s*[\p{Extended_Pictographic}\u{FE0F}\u{200D}\s]*$/u.test(lastLine(t));

// オーナーの決まり（共通ルール.md）と 10/26・10/27 の振り返りから
const BANNED=[
 [/^[^\n]*(ありますよね|わかります)/,'共感から入る型（10/26 反応0の型）'],
 [/とよく聞かれ/,'確かめていない「よく聞かれる」'],
 [/することができます|いかがでしたか|ぜひ参考に|いかがでしょうか/,'AIっぽい言い回し'],
 [/https?:\/\//,'リンク（作り置きは朝・夜。記事紹介は昼の ChatGPT 枠）']
];

const problems=[];
const upcoming=items.filter(i=>i.date>=today).sort((a,b)=>(a.date+a.slot).localeCompare(b.date+b.slot));
for(const it of upcoming){
 const t=String(it.text||'');const id=it.id;
 const len=[...seg.segment(t)].length;
 if(len<100||len>300)problems.push(`${id}: 長さ ${len}字（100〜300字）`);
 const e=emojiCount(t);if(e<3||e>6)problems.push(`${id}: 絵文字 ${e}個（3〜6個）`);
 for(const [re,why] of BANNED)if(re.test(t))problems.push(`${id}: ${why}`);
 if(!it.qa)problems.push(`${id}: qa の印がない（全文を読み、事実・機能の説明を確かめてから付ける）`);
}
// 書き出しのかぶり（最初の6文字）と、作り置き同士の似すぎ
for(let i=0;i<upcoming.length;i++)for(let j=i+1;j<upcoming.length;j++){
 const a=upcoming[i],b=upcoming[j];
 if(norm(a.text).slice(0,6)===norm(b.text).slice(0,6))problems.push(`${a.id} と ${b.id}: 書き出しが同じ`);
 const s=sim(norm(a.text),norm(b.text));if(s>=0.5)problems.push(`${a.id} と ${b.id}: 似すぎ（${s.toFixed(2)}）`);
}
// 問いかけ締めは多くても4割、2本続けない
const q=upcoming.filter(i=>endsWithQuestion(i.text));
if(upcoming.length&&q.length/upcoming.length>0.4)problems.push(`問いかけ締めが多い（${q.length}/${upcoming.length}）`);
for(let i=1;i<upcoming.length;i++)if(endsWithQuestion(upcoming[i].text)&&endsWithQuestion(upcoming[i-1].text))problems.push(`${upcoming[i-1].id} と ${upcoming[i].id}: 問いかけ締めが2本続く`);

console.log(`対象 ${upcoming.length}本（${today} 以降）・問いかけ締め ${q.length}本`);
if(problems.length){console.log('NG:\n- '+problems.join('\n- '));process.exit(1);}
console.log('OK: すべて合格');
