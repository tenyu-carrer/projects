// Instagram 自動文字入れ（Canva で作った文字なしの背景に、その日の文字を載せて JPEG を作る）
//   node instagram/auto/build.mjs --from 2026-09-29 --days 60
// 出力：instagram/auto/posts/<account>/<日付>.json と instagram/auto/images/<account>/<日付>(-1|-2).jpg
// すでにある日付は作り直さない（予約済みの投稿を変えないため）。--force で作り直す（未投稿の日だけに使う）
// 必要なもの：playwright（Chromium）。PLAYWRIGHT_MODULE / CHROMIUM_PATH で場所を指定できる
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const args=Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map(s=>{const [k,...v]=s.trim().split(' ');return [k,v.join(' ')||true];}));
const jstToday=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date());
const from=args.from||jstToday();
const days=Number(args.days||30);
const force=Boolean(args.force);
const only=args.account?String(args.account).split(','):['fortune','worklife'];

const fortune=JSON.parse(readFileSync(path.join(ROOT,'content/fortune.json'),'utf8'));
const worklife=JSON.parse(readFileSync(path.join(ROOT,'content/worklife.json'),'utf8'));
const b64=f=>readFileSync(path.join(ROOT,f)).toString('base64');
const FONTS={serif500:b64('fonts/noto-serif-jp-japanese-500-normal.woff2'),serif600:b64('fonts/noto-serif-jp-japanese-600-normal.woff2'),serif700:b64('fonts/noto-serif-jp-japanese-700-normal.woff2'),sans400:b64('fonts/noto-sans-jp-japanese-400-normal.woff2')};
const BG={worklife:b64('backgrounds/worklife.jpg'),f1:b64('backgrounds/fortune-1.jpg'),f2:b64('backgrounds/fortune-2.jpg')};

// ---- 日付から決まる乱数（同じ日付なら何度作っても同じ内容） ----
const EPOCH=Date.UTC(2026,0,1);
const dayIndex=date=>Math.round((Date.parse(date+'T00:00:00Z')-EPOCH)/86400000);
function rng(seed){let a=0;for(const c of String(seed))a=(a*31+c.charCodeAt(0))|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const pick=(r,list)=>list[Math.floor(r()*list.length)];
function shuffle(r,list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
// 背景の5パターン：前の日と同じにならないようにランダムに選ぶ
function variantOf(account,date){let v=0;for(let d=0;d<=dayIndex(date);d++){const r=rng(`${account}-variant-${d}`);v=(v+1+Math.floor(r()*4))%5;}return v;}
// 星座：直近8日に出た星座は選ばない（日付から決まるランダム）
const signMemo=[];
function signOf(date){
 const d=dayIndex(date);
 for(let i=signMemo.length;i<=d;i++){const recent=signMemo.slice(Math.max(0,i-8));const pool=fortune.signs.map(s=>s.key).filter(k=>!recent.includes(k));signMemo.push(pick(rng(`sign-${i}`),pool));}
 return fortune.signs.find(s=>s.key===signMemo[d]);
}
const WEEK='日月火水木金土';
const md=date=>{const [,m,d]=date.split('-').map(Number);return {m,d,w:WEEK[new Date(date+'T12:00:00Z').getUTCDay()]};};
function birthdays(r){const out=new Set();while(out.size<3){const m=1+Math.floor(r()*12);const max=[31,28,31,30,31,30,31,31,30,31,30,31][m-1];out.add(`${m}月${1+Math.floor(r()*max)}日`);}return [...out];}

export function fortuneContent(date){
 const r=rng(`fortune-${date}`),s=signOf(date),i=Math.floor(r()*3);
 const [work,love,money]=birthdays(r);
 const adv={work:pick(r,fortune.birthdayAdvice.work),love:pick(r,fortune.birthdayAdvice.love),money:pick(r,fortune.birthdayAdvice.money)};
 return {date,sign:s,message:s.messages[i],advice:s.advice[i],detail:s.detail[i],color:pick(r,s.colors),birthdays:{work,love,money},birthdayAdvice:adv,variant:variantOf('fortune',date)};
}
export function worklifeContent(date){
 const wd=new Date(date+'T12:00:00Z').getUTCDay();
 const list=worklife.byWeekday[String(wd)];
 const e=list[Math.floor(dayIndex(date)/7)%list.length];
 return {date,...e,variant:variantOf('worklife',date)};
}

// ---- 画像のデザイン（Canva のひな形の位置・色・大きさに合わせてある） ----
const fontFace=`@font-face{font-family:S5;src:url(data:font/woff2;base64,${FONTS.serif500}) format('woff2')}
@font-face{font-family:S6;src:url(data:font/woff2;base64,${FONTS.serif600}) format('woff2')}
@font-face{font-family:S7;src:url(data:font/woff2;base64,${FONTS.serif700}) format('woff2')}
@font-face{font-family:G4;src:url(data:font/woff2;base64,${FONTS.sans400}) format('woff2')}`;
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const page=(bg,body,extra='')=>`<!doctype html><html><head><meta charset="utf-8"><style>${fontFace}
html,body{margin:0;width:1080px;height:1350px;overflow:hidden}
.bg{position:absolute;inset:0;background:url(data:image/jpeg;base64,${bg}) 0 0/1080px 1350px}
.tint{position:absolute;inset:0}
.t{position:absolute;text-align:center;white-space:pre-line;left:0;width:1080px}
.fit{white-space:nowrap}
${extra}</style></head><body>${body}</body></html>`;
const WORKLIFE_VARIANTS=[{flip:false,tint:''},{flip:true,tint:'rgba(255,190,200,.35)'},{flip:false,tint:'rgba(185,225,190,.40)'},{flip:true,tint:'rgba(185,215,245,.40)'},{flip:false,tint:'rgba(255,205,160,.40)'}];
// 占いは夜空の色を変える（金色の文字が読めるよう、やわらかく重ねる）
const FORTUNE_VARIANTS=['','rgba(40,110,255,.75)','rgba(230,70,170,.65)','rgba(20,170,170,.70)','rgba(255,150,50,.60)'];
const sparkle=`<svg width="90" height="90" viewBox="0 0 100 100" style="vertical-align:-8px;margin-left:18px"><path d="M50 0 C54 36 64 46 100 50 C64 54 54 64 50 100 C46 64 36 54 0 50 C36 46 46 36 50 0Z" fill="#f6d77a"/><path d="M84 6 C85 16 88 19 98 20 C88 21 85 24 84 34 C83 24 80 21 70 20 C80 19 83 16 84 6Z" fill="#f6d77a"/></svg>`;

function worklifeHtml(c){
 const v=WORKLIFE_VARIANTS[c.variant],{m,d,w}=md(c.date);
 return page(BG.worklife,`<div class="bg" style="${v.flip?'transform:scaleX(-1)':''}"></div>
${v.flip?'<div class="patch"></div>':''}<div class="tint" style="${v.tint?`background:${v.tint};mix-blend-mode:multiply`:''}"></div>
<div class="t" style="top:192px;font:41px/1.4 G4;letter-spacing:.05em;color:#5f7666">${m}月${d}日（${w}）</div>
<div class="t main fitbox" style="top:461px;left:150px;width:780px;height:458px;display:flex;align-items:center;justify-content:center;font:77px/1.6 S5;letter-spacing:-.03em;color:#4c3d2c">${esc(c.text)}</div>
${v.flip?'<div class="t" style="top:1147px;font:32.5px/1.4 G4;letter-spacing:.1em;color:#5f7666">今日のひとこと</div>':''}`,
 `.patch{position:absolute;top:1135px;left:360px;width:360px;height:65px;background:url(data:image/jpeg;base64,${BG.worklife}) -360px -1050px/1080px 1350px}`);
}
function fortune1Html(c){
 const {m,d}=md(c.date),tint=FORTUNE_VARIANTS[c.variant];
 return page(BG.f1,`<div class="bg"></div><div class="tint" style="${tint?`background:linear-gradient(180deg,${tint},transparent 45%,${tint});mix-blend-mode:soft-light`:''}"></div>
<div class="t" style="top:298px;font:61px/1.4 S6;color:#e8b859">${m}月${d}日 今日の運勢</div>
<div class="t fit" style="top:748px;font:114px/1.4 S6;color:#e8b859">${esc(c.sign.name)}${sparkle}</div>
<div class="t fit" style="top:940px;font:56px/1.4 S6;color:#e8b859">${esc(c.message)}</div>
<div class="t fit" style="top:1022px;font:38px/1.4 S6;color:#f3dcaa">${esc(c.advice)}</div>
<div class="t fit" style="top:1197px;font:42px/1.4 S6;color:#e8b859">ラッキーカラー：${esc(c.color)}</div>`);
}
function fortune2Html(c){
 const {m,d}=md(c.date),tint=FORTUNE_VARIANTS[c.variant];
 const box=(top,b,a)=>`<div class="t fit" style="top:${top-8}px;font:58px/1.4 S7;color:#e8c5ff">1位：${b}生まれ</div><div class="t fit" style="top:${top+68}px;font:32px/1.4 S7;color:#f6ecff">${esc(a)}</div>`;
 return page(BG.f2,`<div class="bg"></div><div class="tint" style="${tint?`background:linear-gradient(180deg,${tint},transparent 45%,${tint});mix-blend-mode:soft-light`:''}"></div>
<div class="t" style="top:40px;color:#e8c5ff;font-family:S7"><span style="font-size:170px">${m}</span><span style="font-size:127px">月</span><span style="font-size:170px">${d}</span><span style="font-size:127px">日</span></div>
${box(505,c.birthdays.work,c.birthdayAdvice.work)}${box(772,c.birthdays.love,c.birthdayAdvice.love)}${box(1022,c.birthdays.money,c.birthdayAdvice.money)}`);
}

// ---- キャプション（方針書の型） ----
const tags=list=>list.map(t=>'#'+t).join(' ');
function fortuneCaption(c){
 const {m,d,w}=md(c.date),b=c.birthdays,a=c.birthdayAdvice;
 return `【${m}月${d}日（${w}）今日の運勢】
総合運1位は…${c.sign.name}${c.sign.symbol}

${c.sign.trait}の${c.sign.name}さん。
${c.message}${c.detail}

▶ 今日のひとこと：${c.advice}
ラッキーカラー：${c.color}

▶ 2枚目は誕生日別ラッキー運
仕事運1位：${b.work}生まれ（${a.work}）
恋愛運1位：${b.love}生まれ（${a.love}）
金運1位：${b.money}生まれ（${a.money}）

当てはまったら、今日の小さな一歩を🌙

${tags(['占い','今日の運勢','星座占い',c.sign.name,'誕生日占い'])}`;
}
function worklifeCaption(c){
 return `${c.text.replace(/\n/g,'')}

${c.why}

▶ 今日ひとつだけ試すなら
${c.try}

保存して、疲れた日に見返してね🌿

${tags([...worklife.fixedTags,...c.tags])}`;
}

// ---- 実行 ----
const addDays=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
async function main(){
 const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
 const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 const tab=await browser.newPage({viewport:{width:1080,height:1350}});
 const shot=async(html,file)=>{
  await tab.setContent(html);await tab.evaluate(()=>document.fonts.ready);
  // はみ出す文字は小さくして1行（またはボックス）に収める
  await tab.evaluate(()=>{for(const el of document.querySelectorAll('.fit')){const inner=document.createElement('span');inner.style.display='inline-block';while(el.firstChild)inner.appendChild(el.firstChild);el.appendChild(inner);let s=parseFloat(getComputedStyle(el).fontSize);while(inner.offsetWidth>960&&s>20){s-=2;el.style.fontSize=s+'px';}}
   for(const el of document.querySelectorAll('.fitbox')){let s=parseFloat(getComputedStyle(el).fontSize);el.style.whiteSpace='pre';while((el.scrollWidth>el.clientWidth||el.scrollHeight>el.clientHeight)&&s>30){s-=2;el.style.fontSize=s+'px';}}});
  mkdirSync(path.dirname(file),{recursive:true});await tab.screenshot({path:file,type:'jpeg',quality:92});
 };
 let made=0;
 for(let i=0;i<days;i++){
  const date=addDays(from,i);
  for(const account of only){
   const json=path.join(ROOT,'posts',account,`${date}.json`);
   if(existsSync(json)&&!force)continue;
   const img=n=>path.join(ROOT,'images',account,`${date}${n}.jpg`);
   let post;
   if(account==='fortune'){
    const c=fortuneContent(date);
    await shot(fortune1Html(c),img('-1'));await shot(fortune2Html(c),img('-2'));
    post={account,date,images:[`${date}-1.jpg`,`${date}-2.jpg`],variant:c.variant,sign:c.sign.key,caption:fortuneCaption(c)};
   }else{
    const c=worklifeContent(date);
    await shot(worklifeHtml(c),img(''));
    post={account,date,images:[`${date}.jpg`],variant:c.variant,caption:worklifeCaption(c)};
   }
   mkdirSync(path.dirname(json),{recursive:true});writeFileSync(json,JSON.stringify(post,null,2)+'\n');made++;
   console.log(`✓ ${account} ${date}（背景${post.variant+1}）`);
  }
 }
 await browser.close();
 console.log(`作成: ${made} 件`);
}
if(process.argv[1]===fileURLToPath(import.meta.url))await main();
