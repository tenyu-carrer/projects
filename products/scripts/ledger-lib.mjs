// 商品台帳の共通処理。マスター（master-v1.0.md）が正本。番号と名前は変えない。
export const TIERS = {
  A: "無料（体験版・入門教材・サンプル）",
  B: "魚（完成品・制作代行）",
  C: "釣り竿（プロンプト・テンプレート・ツール）",
  D: "釣り竿の作り方（実践講座・制作方法・販売方法）",
};

export const STATUSES = ["企画", "試作", "検査合格", "承認待ち", "販売中", "停止", "商品化しない"];

// マスターの本文から { no, name, part } の一覧を取り出す
export function parseMaster(text) {
  const genres = [];
  let part = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const p = line.match(/^【(第\d+部)｜(.+)】$/);
    if (p) { part = `${p[1]}｜${p[2]}`; continue; }
    const g = line.match(/^(\d{3})｜(.+)$/);
    if (g) genres.push({ no: g[1], name: g[2].trim(), part });
  }
  return genres;
}

export function emptyRow(genre, tier) {
  return {
    id: `${genre.no}-${tier}`,
    no: genre.no,
    tier,
    tier_label: TIERS[tier],
    genre_name: genre.name,
    part: genre.part,
    product_name: null,
    target: null,
    deliverables: [],
    price_hypothesis_jpy: tier === "A" ? 0 : null,
    cost: { external_jpy: null, notes: null },
    status: "企画",
    quality: { checked_at: null, result: null, issues: [] },
    rights: { services: [], terms_urls: [], checked_at: null, commercial_use: "不明", resale: "不明", notes: null },
    buyer_terms: null,
    utage: { funnel_id: null, step_id: null, page_id: null, product_id: null, product_detail_id: null, site_id: null, course_id: null, delivery: null },
    sales_url: null,
    sales: { count: 0, revenue_jpy: 0, updated_at: null },
    approval: { approved_by: null, approved_at: null },
    history: [],
  };
}

// 既存の台帳の進捗を残したまま、マスターの番号・名前に合わせて並べ直す
export function buildLedger(genres, existing = []) {
  const byId = new Map(existing.map((r) => [r.id, r]));
  const rows = [];
  for (const g of genres) {
    for (const tier of Object.keys(TIERS)) {
      const base = emptyRow(g, tier);
      const old = byId.get(base.id);
      rows.push(old ? { ...base, ...old, genre_name: g.name, part: g.part, tier_label: TIERS[tier] } : base);
    }
  }
  return rows;
}

// 台帳のチェック。問題の一覧を返す（空なら合格）
export function checkLedger(rows, genres) {
  const errors = [];
  const nos = genres.map((g) => g.no);
  if (new Set(nos).size !== nos.length) errors.push("マスターに重複した番号がある");
  nos.forEach((no, i) => {
    const want = String(i + 1).padStart(3, "0");
    if (i < 180 && no !== want) errors.push(`マスターの番号が連続していない：${want} の位置に ${no}`);
  });
  if (genres.length < 180) errors.push(`マスターのジャンルが180件未満（${genres.length}件）`);
  const nameByNo = new Map(genres.map((g) => [g.no, g.name]));
  const ids = new Set();
  for (const r of rows) {
    if (!/^\d{3}-[ABCD]$/.test(r.id)) errors.push(`${r.id}：ID の形が違う`);
    if (ids.has(r.id)) errors.push(`${r.id}：ID が重複`);
    ids.add(r.id);
    if (nameByNo.get(r.no) !== r.genre_name) errors.push(`${r.id}：ジャンル名がマスターと違う`);
    if (!STATUSES.includes(r.status)) errors.push(`${r.id}：status「${r.status}」は使えない`);
    const advanced = ["検査合格", "承認待ち", "販売中"].includes(r.status);
    if (advanced && r.quality?.result !== "合格") errors.push(`${r.id}：品質検査に合格していないのに「${r.status}」`);
    if (advanced && r.tier !== "A" && r.rights?.commercial_use !== "可") errors.push(`${r.id}：商用利用が「可」と確認できていないのに「${r.status}」`);
    if (r.status === "販売中" && !r.approval?.approved_at) errors.push(`${r.id}：オーナー承認なしで「販売中」`);
    if (r.status === "販売中" && !r.sales_url) errors.push(`${r.id}：販売中なのに販売 URL がない`);
    if (r.sales_url && !r.sales_url.startsWith("https://info.career-design.co.jp/")) errors.push(`${r.id}：販売 URL は info.career-design.co.jp を使う`);
  }
  const expected = genres.length * 4;
  if (rows.length !== expected) errors.push(`台帳の行数が ${rows.length}（${expected} のはず）`);
  return errors;
}
