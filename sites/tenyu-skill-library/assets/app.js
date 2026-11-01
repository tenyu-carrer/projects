const dataUrl = 'data/products.json';
let courseProgressKey = 'tenyu-course-progress';
let currentProduct = null;

const richProfiles = {
  '001': {
    audience: ['Canvaを初めて触る人', '投稿画像を自分で作りたい個人・小さなお店', 'デザインに時間をかけすぎたくない人'],
    brief: ['対象：朝の時間を増やしたい初心者', '伝えること：明日から試せる3つのコツ', '行動：保存して翌朝1つ試す'],
    output: ['見出し：朝の時間を増やす 3つのコツ', '小見出し：初心者向け', '補足：保存して明日試す', '強調語：「3」を金色、「朝の時間」を濃紺'],
    checks: ['キャンバスは1080×1080px', '文字は3段、色は3色、フォントは2種類以内', '25％表示でも主見出しが読める', 'PNGを書き出し、実際に開いて確認'],
    export: 'PNG｜ファイル名例：20261022_morning-tips_01.png'
  },
  '002': {
    audience: ['イベントや講座を告知したい人', '印刷物を初めて作る人', '情報が多くなりがちな担当者'],
    brief: ['対象：AIを初めて試す地域の人', '目的：体験会への申込み', '必須：日時・会場・料金・定員・申込先'],
    output: ['見出し：はじめてのAI体験会', '魅力：触ってわかる90分', '情報：10月30日 19:00／○○市民ホール', '申込：QRコード＋締切を下部に配置'],
    checks: ['A4の仕上がりサイズと塗り足しを確認', '日時・曜日・電話番号を原稿と照合', 'QRコードを紙面から実機で読む', '校正PNGと印刷用PDFを両方保存'],
    export: 'PDF（印刷）＋ PNG（確認）｜ファイル名例：event_flyer_v01'
  },
  '003': {
    audience: ['個人事業主・小さなお店', '名刺を初めて自作する人', '肩書を短く整えたい人'],
    brief: ['相手：初対面のお客様', '伝えること：何を助ける人か', '行動：QRから相談予約をする'],
    output: ['表：山田 花子／小さなお店のSNSサポート', '裏：相談予約はこちら', '連絡先：メール＋QRコード', '構成：名前を最優先、余白を十分に残す'],
    checks: ['名前と仕事が3秒で分かる', '連絡先を1文字ずつ照合', 'QRコードをスマホで実機確認', '普通紙へ原寸で試し刷り'],
    export: 'PDF（印刷）｜表裏を別ページで保存'
  },
  '004': {
    audience: ['社内提案を短くまとめたい人', '資料が文字だらけになる人', '7枚で結論まで伝えたい人'],
    brief: ['聞き手：決裁者', 'テーマ：業務改善の提案', '目的：次回の試行実施を承認してもらう'],
    output: ['1 表紙／2 現状／3 課題／4 解決策', '5 根拠／6 実行計画／7 次の行動', '各ページは見出し1つ・本文3行以内', '数字には出典、最後に決めてほしいこと'],
    checks: ['1枚につきメッセージは1つ', '結論を先に伝える', '数字・引用に出典がある', '発表時間内に声に出して確認'],
    export: 'PDF（共有）｜必要時のみPPTXも崩れを確認'
  },
  '005': {
    audience: ['電子書籍を初めて出す人', '一覧で目立つ表紙を作りたい人', '書名と副題を整理したい人'],
    brief: ['読者：AIを仕事に使い始めたい人', '悩み：文章と整理に時間がかかる', '変化：毎日の作業を短く整える'],
    output: ['書名：はじめてのAI仕事術', '副題：毎日の文章と整理を30分短くする入門', '著者名：山田 花子', '書名を最大にし、内容を表す図形は1点'],
    checks: ['販売・配布先の最新サイズに合わせる', '25％表示でも書名が読める', '著者名・シリーズ名を照合', '素材の利用条件を確認'],
    export: 'JPG または PNG｜配布先の指定を優先'
  }
};

function profileFor(product = currentProduct) {
  return product?.lesson?.richProfile || richProfiles[product?.id] || richProfiles['001'];
}

async function loadProducts() {
  const response = await fetch(dataUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`商品データを読み込めませんでした（${response.status}）`);
  return response.json();
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function downloadableHref(url = '') {
  return /\.(?:md|txt)$/i.test(url) ? `open-text.html?file=${encodeURIComponent(url)}` : url;
}

function productCard(product, index) {
  const available = product.webStatus === 'sample';
  const isUnverifiedMockup = product.id === '003';
  const previewLabel = isUnverifiedMockup ? '参考モックアップ' : '教材見本';
  const hue = ['navy', 'amber', 'sage', 'violet'][index % 4];
  const action = available
    ? `<a class="card-link" href="product.html?id=${encodeURIComponent(product.id)}"><span>教材を開く</span><b>→</b></a>`
    : '<span class="card-link disabled" aria-disabled="true"><span>Web教材 準備中</span><b>—</b></span>';

  return `
    <article class="product-card ${available ? 'available' : ''}" data-no="${escapeHtml(product.id)}">
      <div class="product-visual ${hue} ${product.previewImage ? 'has-image' : ''}">
        ${product.previewImage ? `<img src="${escapeHtml(product.previewImage)}?v=20261023-3" alt="${escapeHtml(product.shortTitle)}の${previewLabel}" loading="lazy">` : ''}
        <span class="product-number">${escapeHtml(product.id)}</span>
        <span class="visual-label">${available ? previewLabel : '準備中'}</span>
        <div class="visual-lines"><i></i><i></i><i></i></div>
      </div>
      <div class="product-card-body">
        <div class="card-top">
          <span class="product-category">${escapeHtml(product.category || (index < 20 ? 'AI DESIGN' : 'AI SKILL'))}</span>
          <span class="status-pill ${available ? 'sample' : ''}">${available ? '無料で学べます' : '制作準備中'}</span>
        </div>
        <h3>${escapeHtml(product.title)}</h3>
        <p>${escapeHtml(product.summary)}</p>
        ${action}
      </div>
    </article>`;
}

async function renderCatalog() {
  const grid = document.getElementById('product-grid');
  const message = document.getElementById('catalog-message');
  const search = document.getElementById('product-search');

  try {
    const { products } = await loadProducts();
    const visibleProducts = products.filter((item) => item.webStatus === 'sample');
    document.querySelectorAll('[data-ready-count]').forEach((node) => { node.textContent = visibleProducts.length; });
    const draw = (term = '') => {
      const query = term.trim().toLowerCase();
      const filtered = visibleProducts.filter((item) => `${item.id} ${item.title} ${item.summary}`.toLowerCase().includes(query));
      grid.innerHTML = filtered.map((product) => productCard(product, products.indexOf(product))).join('');
      message.textContent = filtered.length ? `学べる教材 ${filtered.length}件（完成済みのみ表示）` : '該当する教材はありません。';
    };
    draw();
    search.addEventListener('input', (event) => draw(event.target.value));
  } catch (error) {
    message.textContent = `${error.message} ローカルサーバーから開いてください。`;
  }
}

function buildSocialMockup() {
  return `<div class="social-preview lesson-preview">
    <span>初心者向け</span>
    <strong>朝の時間を<br><em>増やす</em> 3つのコツ</strong>
    <small>保存して明日試す →</small>
    <i class="shape shape-a"></i><i class="shape shape-b"></i>
  </div>`;
}

function buildFlyerMockup() {
  return `<div class="artifact flyer-artifact"><span>はじめての</span><strong>AI<br>体験会</strong><b>10.30 FRI<br>19:00–20:30</b><small>参加無料｜定員20名<br>○○市民ホール 2階</small><i>申込はこちら →</i></div>`;
}

function buildCardMockup() {
  return `<div class="artifact card-artifact"><div><span>小さなお店の<br>SNSサポート</span><strong>山田 花子</strong><small>HANAKO YAMADA</small></div><div><b>相談予約はこちら</b><i>QR</i><small>hello@example.jp</small></div></div>`;
}

function buildSlideMockup() {
  return `<div class="artifact slide-artifact"><div class="slide-main"><span>01 / PROPOSAL</span><strong>結論から伝える<br>7枚プレゼン</strong><small>1枚につき、メッセージはひとつ。</small></div><div class="slide-stack"><i>現状</i><i>課題</i><i>解決</i></div></div>`;
}

function buildBookMockup() {
  return `<div class="artifact book-artifact"><span>はじめての</span><strong>AI<br>仕事術</strong><b>毎日の文章と整理を<br>30分短くする入門</b><small>山田 花子</small><i></i></div>`;
}

function buildProductMockup(productId = '001') {
  const previewMap = {
    '001': 'assets/examples/001-sns-post.png',
    '002': 'assets/examples/002-event-flyer-v2.png',
    '003': 'assets/examples/003-business-card.png',
    '004': 'assets/examples/004-presentation.png',
    '005': 'assets/examples/005-ebook-cover.png',
    '011': 'assets/examples/011-coloring-sample.png'
  };
  const previewImage = currentProduct?.id === productId ? currentProduct.previewImage : previewMap[productId];
  if (previewImage) {
    const generatedStudyIds = ['007', '008', '009', '010'];
    const label = productId === '003'
      ? '架空レイアウト参考画像（QR未検証・印刷不可）'
      : generatedStudyIds.includes(productId)
        ? 'AI生成の教材参考画像'
        : '完成見本';
    return `<button class="real-example-button" type="button" data-enlarge="${previewImage}?v=20261023-4" aria-label="${label}を拡大"><img class="real-artifact-image" src="${previewImage}?v=20261023-4" alt="商品${productId}の${label}"></button>`;
  }
  if (productId === '002') return buildFlyerMockup();
  if (productId === '003') return buildCardMockup();
  if (productId === '004') return buildSlideMockup();
  if (productId === '005') return buildBookMockup();
  return buildSocialMockup();
}

function buildPromptTool(section, index) {
  const inputs = currentProduct?.lesson?.promptInputs || { target: '忙しい会社員', theme: '朝の時間の作り方', purpose: ['保存', '共感', '行動'] };
  const purposeOptions = inputs.purpose.map((value) => `<option>${escapeHtml(value)}</option>`).join('');
  return `<div class="prompt-tool">
    <div class="prompt-form" aria-label="プロンプト入力欄">
      <label>${escapeHtml(inputs.targetLabel || '誰に向けて？')}<input id="prompt-target" value="${escapeHtml(inputs.target)}"></label>
      <label>${escapeHtml(inputs.themeLabel || '何を伝える？')}<input id="prompt-theme" value="${escapeHtml(inputs.theme)}"></label>
      <label>${escapeHtml(inputs.purposeLabel || '目的')}<select id="prompt-purpose">${purposeOptions}</select></label>
      <button class="generate-button" type="button" data-generate-prompt="prompt-${index}">入力内容を反映する <span>↓</span></button>
    </div>
    <div class="prompt-box">
      <div class="prompt-toolbar"><span>YOUR PROMPT</span><button class="copy-button" type="button" data-copy="prompt-${index}">コピーする</button></div>
      <pre id="prompt-${index}">${escapeHtml(section.prompt)}</pre>
    </div>
  </div>`;
}

function buildEditorGuide() {
  const profile = profileFor();
  const visual = currentProduct.id === '001'
    ? `<button class="editor-shot" type="button" data-enlarge="assets/examples/001-editor-screen-v2.png?v=20261022-2"><img src="assets/examples/001-editor-screen-v2.png?v=20261022-2" alt="デザイン編集画面の操作例"></button>`
    : `<div class="editor-simulation"><div class="editor-top"><span>ファイル　編集　表示</span><b>ダウンロード</b></div><div class="editor-side"><i></i><i></i><i></i><i></i></div><div class="editor-canvas">${buildProductMockup(currentProduct.id)}</div></div>`;
  const guideTitle = currentProduct.id === '003' ? 'Canvaの操作位置ガイド（模式図）' : '画面のどこを触るか';
  const guideNote = currentProduct.id === '003' ? 'これはCanva実画面のキャプチャではなく、操作順の模式図です。画面名は更新されることがあります。' : '※画面例です。Canvaの表示やボタン名は更新により変わる場合があります。';
  return `<div class="editor-guide" id="editor-guide">
    <div class="editor-guide-head"><span>CANVA WORKFLOW GUIDE</span><h3>${guideTitle}</h3><p>迷ったら、①形式を選ぶ → ②中央で編集する → ③右上から保存、の順です。</p></div>
    ${visual}
    <div class="screen-callouts"><article><b>01</b><strong>左側</strong><span>テンプレート・素材・文字を選ぶ</span></article><article><b>02</b><strong>中央</strong><span>文字サイズ・色・位置を整える</span></article><article><b>03</b><strong>右上</strong><span>${escapeHtml(profile.export)}</span></article></div>
    <p class="screen-note">${guideNote}</p>
  </div>`;
}

function buildExampleOutput(profile) {
  return `<div class="output-example"><div class="output-example-head"><span>完成イメージ</span><strong>プロンプトから、ここまで具体化</strong></div><ul>${profile.output.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><p>そのまま採用せず、事実・固有名詞・数字を自分の原稿と照合してからCanvaへ移します。</p></div>`;
}

function buildRichSteps(items) {
  const profile = profileFor();
  const tips = [
    '最初に完成サイズを確定。途中で変えると配置が崩れます。',
    'テンプレートは見た目より、情報量が近いものを選びます。',
    '先に文字だけを置き、読む順番を整えます。',
    '装飾は最後。色3色・フォント2種類以内を目安にします。',
    '実寸またはスマホ相当の小ささで見直します。',
    '固有名詞・数字・リンクを元原稿と照合します。',
    `保存条件：${profile.export}`
  ];
  return `<ol class="step-list rich-step-list">${items.map((item, itemIndex) => `<li><span>${String(itemIndex + 1).padStart(2, '0')}</span><div><small>STEP ${itemIndex + 1}　目安 ${itemIndex < 2 ? '5分' : itemIndex < 5 ? '10分' : '5分'}</small><b>${escapeHtml(item)}</b><p>${escapeHtml(tips[itemIndex] || '作業後に完成物を実際の利用環境で確認します。')}</p><em>確認：${escapeHtml(profile.checks[Math.min(Math.floor(itemIndex / 2), profile.checks.length - 1)])}</em></div></li>`).join('')}</ol>`;
}

function sectionHtml(section, index) {
  const number = String(index + 1).padStart(2, '0');
  let inner = '';

  if (index === 1) {
    const profile = profileFor();
    const challenge = currentProduct?.id === '003'
      ? { title: 'まずは紙で、情報の順番を試す。', note: 'この体験ではCanvaを開かず、誰に何を伝えるかを10分で決めます。', steps: ['相手を決める', '情報を並べる', '5秒テスト'] }
      : { title: 'まずは、10分で1枚つくってみる。', note: '正解を探すより、最初の1枚を完成させることがゴールです。', steps: ['Canvaを開く', '文字を置く', '保存する'] };
    inner = `<p>${escapeHtml(section.body)}</p><div class="practice-brief"><span>練習用のお題</span><h3>迷わないように、最初の条件を固定します</h3><ul>${profile.brief.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div class="quick-challenge"><span>10 MINUTE CHALLENGE</span><strong>${challenge.title}</strong><p>${challenge.note}</p><div class="challenge-steps"><b>${challenge.steps[0]}</b><i>→</i><b>${challenge.steps[1]}</b><i>→</i><b>${challenge.steps[2]}</b></div></div>${buildEditorGuide()}`;
  } else if (index === 2) {
    const generatedStudyIds = ['007', '008', '009', '010'];
    const mockupCaption = currentProduct?.id === '003'
      ? '架空の参考モックアップ｜QR未検証・印刷不可'
      : generatedStudyIds.includes(currentProduct?.id)
        ? 'AI生成の教材参考画像｜公開前に用途・権利を確認'
        : '完成イメージ';
    const recipeItems = section.items?.length
      ? section.items
      : section.example
        ? section.example.split('／')
        : [];
    inner = `${section.body ? `<p>${escapeHtml(section.body)}</p>` : ''}<div class="workshop-grid"><div class="mockup-wrap">${buildProductMockup(currentProduct?.id)}<span class="mockup-caption">${mockupCaption}</span></div><div class="design-recipe">${recipeItems.map((item, itemIndex) => `<div><span>${String(itemIndex + 1).padStart(2, '0')}</span><p><b>${escapeHtml(item.split('：')[0])}</b><small>${escapeHtml(item.split('：').slice(1).join('：'))}</small></p></div>`).join('')}</div></div>${section.prompt ? `${buildPromptTool(section, index)}${buildExampleOutput(profileFor())}` : ''}`;
  } else if (section.prompt) {
    inner = `<p>${escapeHtml(section.body)}</p>${buildPromptTool(section, index)}${buildExampleOutput(profileFor())}`;
  } else if (section.checklist) {
    inner = `<p>全部チェックできたら、この教材は完了です。</p><div class="export-ticket"><span>書き出し形式</span><strong>${escapeHtml(profileFor().export)}</strong></div><div class="completion-list">${section.items.map((item, itemIndex) => `<label><input type="checkbox" data-progress="${itemIndex}"><span class="custom-check">✓</span><b>${escapeHtml(item)}</b></label>`).join('')}</div><div class="completion-message" id="completion-message"><span>あと${section.items.length}項目</span><strong>完成まで、もう一歩。</strong></div>`;
  } else if (index === 4) {
    inner = section.items?.length
      ? `<p>各工程に「なぜ行うか」と確認基準を付けています。上から順番に進めてください。</p>${buildRichSteps(section.items)}`
      : `<p>${escapeHtml(section.body || '')}</p>`;
  } else if (index === 5) {
    inner = section.items?.length
      ? `<div class="fix-grid">${section.items.map((item) => { const [problem, solution] = item.split('：'); return `<article><span>こんなとき</span><h3>${escapeHtml(problem)}</h3><p>${escapeHtml(solution || '')}</p></article>`; }).join('')}</div>`
      : `<p>${escapeHtml(section.body || '')}</p>`;
  } else {
    inner = `${section.body ? `<p>${escapeHtml(section.body)}</p>` : ''}${section.items?.length ? `<ul class="material-list">${section.items.map((item) => `<li><span>✓</span>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}`;
  }

  return `<section class="lesson-section" id="section-${index}" data-section="${index}">
    <div class="section-kicker"><span>LESSON ${number}</span><i></i><small>${index === 6 ? 'FINAL CHECK' : 'PRACTICE'}</small></div>
    <h2>${escapeHtml(section.title)}</h2>
    ${inner}
    <button class="section-done" type="button" data-complete-section="${index}"><span class="done-icon">✓</span><span class="done-copy"><b>このレッスンを完了する</b><small>進捗はこのブラウザに保存されます</small></span></button>
  </section>`;
}

function readProgress() {
  try { return JSON.parse(localStorage.getItem(courseProgressKey)) || { sections: [], checks: [] }; }
  catch { return { sections: [], checks: [] }; }
}

function writeProgress(progress) {
  localStorage.setItem(courseProgressKey, JSON.stringify(progress));
}

function updateProgressUi(progress) {
  const completed = new Set(progress.sections || []);
  document.querySelectorAll('[data-complete-section]').forEach((button) => {
    const done = completed.has(Number(button.dataset.completeSection));
    button.classList.toggle('is-done', done);
    button.querySelector('b').textContent = done ? '完了しました' : 'このレッスンを完了する';
  });
  document.querySelectorAll('#lesson-menu a').forEach((link, index) => link.classList.toggle('is-done', completed.has(index)));
  const sectionCount = currentProduct?.lesson?.sections?.length || 7;
  const percent = Math.round(completed.size / sectionCount * 100);
  const navBar = document.getElementById('nav-progress-bar');
  if (navBar) navBar.style.width = `${percent}%`;
  const readingBar = document.getElementById('reading-progress-bar');
  if (readingBar) readingBar.style.width = `${percent}%`;
  document.getElementById('nav-progress-text').textContent = `${completed.size} / ${sectionCount} 完了`;
  document.getElementById('header-progress').textContent = `${percent}% 完了`;
}

function enableLessonInteractions() {
  const toast = document.getElementById('toast');
  const progress = readProgress();

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = document.getElementById(button.dataset.copy).textContent;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const area = document.createElement('textarea'); area.value = text; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      }
      button.textContent = 'コピーしました ✓';
      toast.classList.add('show');
      setTimeout(() => { button.textContent = 'コピーする'; toast.classList.remove('show'); }, 1800);
    });
  });

  document.querySelectorAll('[data-generate-prompt]').forEach((button) => button.addEventListener('click', () => {
    const target = document.getElementById('prompt-target').value || '【対象】';
    const theme = document.getElementById('prompt-theme').value || '【テーマ】';
    const purpose = document.getElementById('prompt-purpose').value;
    const template = currentProduct.lesson.promptTemplate || sectionPromptFallback();
    const output = template.replaceAll('{{target}}', target).replaceAll('{{theme}}', theme).replaceAll('{{purpose}}', purpose);
    const prompt = document.getElementById(button.dataset.generatePrompt);
    if (prompt) { prompt.textContent = output; prompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }));

  document.querySelectorAll('[data-complete-section]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = Number(button.dataset.completeSection);
      const set = new Set(progress.sections || []);
      set.has(value) ? set.delete(value) : set.add(value);
      progress.sections = [...set]; writeProgress(progress); updateProgressUi(progress);
    });
  });

  document.querySelectorAll('[data-progress]').forEach((checkbox) => {
    const value = Number(checkbox.dataset.progress);
    checkbox.checked = (progress.checks || []).includes(value);
    checkbox.addEventListener('change', () => {
      const set = new Set(progress.checks || []);
      checkbox.checked ? set.add(value) : set.delete(value);
      progress.checks = [...set]; writeProgress(progress);
      const total = document.querySelectorAll('[data-progress]').length;
      const left = total - set.size;
      const message = document.getElementById('completion-message');
      message.querySelector('span').textContent = left ? `あと${left}項目` : 'ALL CLEAR';
      message.querySelector('strong').textContent = left ? '完成まで、もう一歩。' : '合格です。作品を公開できます！';
      message.classList.toggle('is-complete', left === 0);
    });
    checkbox.dispatchEvent(new Event('change'));
  });

  updateProgressUi(progress);

  const dialog = document.getElementById('image-dialog');
  const dialogImage = document.getElementById('image-dialog-image');
  document.querySelectorAll('[data-enlarge]').forEach((button) => {
    button.addEventListener('click', () => {
      dialogImage.src = button.dataset.enlarge;
      dialog.showModal();
    });
  });
  document.getElementById('image-dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}

function sectionPromptFallback() {
  return `対象：{{target}}\nテーマ：{{theme}}\n目的：{{purpose}}\n元情報にない事実は作らず、分かりやすい案を出してください。`;
}

async function renderProduct() {
  const content = document.getElementById('lesson-content');
  const id = new URLSearchParams(location.search).get('id') || '001';

  try {
    const { products } = await loadProducts();
    const product = products.find((item) => item.id === id);
    if (!product) throw new Error('商品が見つかりません。');
    if (product.webStatus !== 'sample' || !product.lesson) {
      content.innerHTML = '<div class="status-message">この教材はWeb化前です。完成済みとしては表示していません。</div>';
      return;
    }

    currentProduct = product;
    courseProgressKey = `tenyu-course-${product.id}-progress`;
    document.title = `${product.id} ${product.title} | 天祐 AI Skill Library`;
    document.querySelector('.header-course-state span').textContent = `COURSE ${product.id}`;
    document.getElementById('side-course-number').textContent = `COURSE ${product.id}`;
    document.getElementById('side-title').textContent = product.shortTitle;
    document.getElementById('side-goal').textContent = product.lesson.deliverable;
    document.getElementById('side-duration').textContent = `目安時間：${product.lesson.duration || '約60分'}`;
    document.getElementById('lesson-menu').innerHTML = product.lesson.sections.map((section, index) => `<a href="#section-${index}"><span>${String(index + 1).padStart(2, '0')}</span>${escapeHtml(section.title)}<i>✓</i></a>`).join('');
    content.innerHTML = `
      <header class="lesson-hero">
        <div class="lesson-hero-copy">
          <div class="course-label"><span>無料教材</span><b>初級</b></div>
          <p class="eyebrow">COURSE ${escapeHtml(product.id)}</p>
          <h1>${escapeHtml(product.title)}</h1>
          <p>${escapeHtml(product.lesson.goal)}</p>
          <div class="course-facts"><span><small>所要時間</small><b>${escapeHtml(product.lesson.duration || '約60分')}</b></span><span><small>レッスン</small><b>全${product.lesson.sections.length}回</b></span><span><small>完成物</small><b>${escapeHtml(product.lesson.deliverable)}</b></span></div>
        </div>
        <div class="hero-mockup"><div class="workshop-grid"><div class="mockup-wrap">${buildProductMockup(product.id)}</div></div></div>
      </header>
      <section class="outcome-panel">
        <div><span>この講座で</span><strong>できるようになること</strong></div>
        <ul>${product.lesson.outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join('')}</ul>
      </section>
      <section class="course-overview">
        <article><span>FOR YOU</span><h2>この教材がおすすめの人</h2><ul>${profileFor(product).audience.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>
        <article><span>YOU WILL GET</span><h2>教材に入っているもの</h2><ul>${product.id === '003' ? '<li>架空の参考モックアップ（QR未検証・印刷不可）</li><li>Canva操作位置の模式図と7手順</li>' : ['007', '008', '009', '010'].includes(product.id) ? '<li>AI生成の教材参考画像（拡大表示対応）</li><li>制作画面例と7工程の詳しい手順</li>' : '<li>完成見本画像（拡大表示対応）</li><li>Canva画面例と7工程の詳しい手順</li>'}<li>入力式・ワンクリックコピーのプロンプト</li><li>失敗例・修正方法・完成チェック</li></ul></article>
      </section>
      <section class="course-roadmap"><div><span>LESSON ROADMAP</span><h2>完成までの道筋</h2><p>読むだけではなく、各レッスンで手を動かして1つの完成物を仕上げます。</p></div><ol>${product.lesson.sections.map((section, index) => `<li><a href="#section-${index}"><b>${String(index + 1).padStart(2, '0')}</b><span>${escapeHtml(section.title)}</span><small>${index === 0 ? '準備' : index === 6 ? '検品' : '実践'}</small></a></li>`).join('')}</ol></section>
      ${product.lesson.downloads?.length ? `<section class="download-library" id="downloads"><div><span>DOWNLOADS</span><h2>実際に使える付属ファイル</h2><p>説明だけではなく、制作と検品に使うファイルをそのまま開けます。</p></div><div>${product.lesson.downloads.map((item) => `<a href="${escapeHtml(downloadableHref(item.url))}" target="_blank" rel="noopener"><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.note)}</small><span>開く ↗</span></a>`).join('')}</div></section>` : ''}
      ${product.lesson.sections.map(sectionHtml).join('')}
      <section class="official-links"><div><span>REFERENCE</span><h2>公式情報を確認する</h2><p>サイズ・保存形式・素材の利用条件は、公開前に公式情報で確認してください。</p></div><div>${product.lesson.officialLinks.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)} <span>↗</span></a>`).join('')}</div></section>
      <p class="source-note">原本：${escapeHtml(product.source)}　／　教材確認日：2026-10-23　／　実機制作・QR・印刷の確認前の試作教材です。</p>`;
    enableLessonInteractions();
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ block: 'start' }));
    }
  } catch (error) {
    content.innerHTML = `<div class="status-message">${escapeHtml(error.message)} ローカルサーバーから開いてください。</div>`;
  }
}

const page = document.body.dataset.page;
if (page === 'catalog') renderCatalog();
if (page === 'product') renderProduct();
