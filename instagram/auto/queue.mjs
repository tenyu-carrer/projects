// 自動で作った投稿（instagram/auto/posts）を予約箱（instagram-queue ブランチの queue.json）に入れる
//   node instagram/auto/queue.mjs --sha <画像が入ったコミット> --queue <queue.json のパス> [--from 2026-09-29]
// ・すでに同じ日・同じアカウントの予約があれば入れない（Claude が作った特別な投稿を優先・二重投稿防止）
// ・publishAt は各日の 06:50 JST。投稿は本部 Vercel の毎朝の Cron が予約IDごとに1回だけ行う
// ・publishAt が7日より前の予約は、予約箱から片づける（投稿済みの記録は本部に残る）
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const args=Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map(s=>{const [k,...v]=s.trim().split(' ');return [k,v.join(' ')||true];}));
if(!/^[0-9a-f]{40}$/.test(String(args.sha||'')))throw new Error('--sha に40桁のコミットIDを指定してください');
if(!args.queue||!existsSync(args.queue))throw new Error('--queue に queue.json のパスを指定してください');
const jstToday=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
const from=args.from||jstToday;
const RAW=`https://raw.githubusercontent.com/tenyu-carrer/projects/${args.sha}/instagram/auto/images`;

const queue=JSON.parse(readFileSync(args.queue,'utf8'));
queue.items=Array.isArray(queue.items)?queue.items:[];
const cutoff=Date.now()-7*86400000;
const before=queue.items.length;
queue.items=queue.items.filter(i=>Date.parse(i.publishAt)>=cutoff);
const removed=before-queue.items.length;
let added=0;
for(const account of ['fortune','worklife']){
 const dir=path.join(ROOT,'posts',account);
 if(!existsSync(dir))continue;
 for(const file of readdirSync(dir).filter(f=>/^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort()){
  const date=file.slice(0,10);
  if(date<from)continue;
  const ymd=date.replace(/-/g,'');
  if(queue.items.some(i=>String(i.id).startsWith(`${ymd}-${account}`)))continue;
  const post=JSON.parse(readFileSync(path.join(dir,file),'utf8'));
  const urls=post.images.map(n=>`${RAW}/${account}/${n}`);
  queue.items.push({id:`${ymd}-${account}-auto`,account,publishAt:`${date}T06:50:00+09:00`,caption:post.caption,...(urls.length>1?{imageUrls:urls}:{imageUrl:urls[0]})});
  added++;
 }
}
queue.items.sort((a,b)=>Date.parse(a.publishAt)-Date.parse(b.publishAt)||String(a.account).localeCompare(String(b.account)));
writeFileSync(args.queue,JSON.stringify(queue,null,2)+'\n');
console.log(`予約に追加: ${added} 件 / 古い予約を片づけ: ${removed} 件 / 予約の合計: ${queue.items.length} 件`);
