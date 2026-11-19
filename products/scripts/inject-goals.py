# -*- coding: utf-8 -*-
"""完全パック（D）に「できるようになること」「ミニ演習・合格の目安」「進め方の表」を差し込む。
usage: python inject-goals.py <spec.json> [--dry]
spec: {"id":"001","intro":"...(省略可)","chapters":[{"h":"見出しの先頭文字列","goal":"...","ex":"...","min":10,"pass":"..."}]}
- products/output/NNN-D/完全パック.md を直す。products/sources/NNN.md があれば ===D 部分も同じように直す。
- すでに差し込み済み（「この手順でできるようになること」がある）なら何もしない。
- 改行コード（CRLF/LF）は元のまま。
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "products", "output")
SRC = os.path.join(ROOT, "products", "sources")
MARK = "この手順でできるようになること"
MARKS = ("この手順でできるようになること", "この章でできるようになること")


def level(line):
    m = re.match(r"^(#+) ", line)
    return len(m.group(1)) if m else 0


def transform(text, spec):
    unit = spec.get("unit", "手順")
    mark = f"この{unit}でできるようになること"
    if any(m in text for m in MARKS):
        raise SystemExit(f"{spec['id']}: すでに差し込み済み")
    lines = text.split("\n")
    chs = spec["chapters"]
    idx = []
    for c in chs:
        hits = [i for i, l in enumerate(lines) if level(l) and l.lstrip("#").strip().startswith(c["h"])]
        if len(hits) != 1:
            raise SystemExit(f"{spec['id']}: 見出し「{c['h']}」が {len(hits)} 件")
        idx.append(hits[0])
    if idx != sorted(idx):
        raise SystemExit(f"{spec['id']}: 見出しの順番が本文と違う")
    # 後ろから差し込む（行番号がずれないように）
    for c, i in reversed(list(zip(chs, idx))):
        lv = level(lines[i])
        end = len(lines)
        for j in range(i + 1, len(lines)):
            if level(lines[j]) and level(lines[j]) <= lv:
                end = j
                break
        # 末尾の空行を飛ばした位置に演習を置く
        k = end
        while k > i + 1 and lines[k - 1].strip() == "":
            k -= 1
        ex = ["", f"> **ミニ演習（{c['min']}分）**：{c['ex']}  ", f"> **合格の目安**：{c['pass']}"]
        if k >= len(lines) or lines[k].strip() != "":
            ex.append("")
        lines[k:k] = ex
        lines[i + 1:i + 1] = ["", f"**{mark}：{c['goal']}**"]
    # 進め方の表：最初の章見出しの直前
    first = idx[0]
    lv = level(lines[first])
    total = sum(int(c["min"]) for c in chs)
    intro = spec.get("intro") or f"{len(chs)}{'つ' if len(chs) < 10 else ''}の{unit}は、どれも「できるようになること」を1つだけ決め、最後に短い演習で確かめる形にしています（2026-11-19 改訂）。前の{unit}で作ったものを次の{unit}で使うので、上から順に進めてください。演習の合計は約{total}分です。"
    block = []
    if lv <= 2:
        block += [f"{'#' * lv} 進め方：{unit}ごとの目標と演習", ""]
    block += [intro, "", f"| {unit} | できるようになること | 演習の時間 |", "|---|---|---|"]
    for n, c in enumerate(chs, 1):
        m = re.search(r"\d+", c["h"])
        label = c.get("n") or (m.group(0).lstrip("0") or "0" if m else str(n))
        block.append(f"| {label} | {c['goal']} | {c['min']}分 |")
    block.append("")
    lines[first:first] = block
    return "\n".join(lines), total


def apply(path, spec, dry, src_mode=False):
    raw = open(path, "rb").read().decode("utf-8")
    crlf = "\r\n" in raw
    text = raw.replace("\r\n", "\n")
    if src_mode:
        m = re.search(r"^===D [^\n]*\n", text, re.M)
        if not m:
            raise SystemExit(f"{path}: ===D がない")
        start = m.end()
        n = re.search(r"^===", text[start:], re.M)
        end = start + n.start() if n else len(text)
        body, total = transform(text[start:end], spec)
        text = text[:start] + body + text[end:]
    else:
        text, total = transform(text, spec)
    if crlf:
        text = text.replace("\n", "\r\n")
    if not dry:
        open(path, "wb").write(text.encode("utf-8"))
    return total


def main():
    data = json.load(open(sys.argv[1], encoding="utf-8"))
    dry = "--dry" in sys.argv
    specs = data if isinstance(data, list) else [data]
    for spec in specs:  # 1ファイルに複数番号をまとめて書いてもよい
        run_one(spec, dry)


def run_one(spec, dry):
    nid = spec["id"]
    total = apply(os.path.join(OUT, f"{nid}-D", "完全パック.md"), spec, dry)
    s = os.path.join(SRC, f"{nid}.md")
    if os.path.exists(s):
        apply(s, spec, dry, src_mode=True)
    if not dry:
        update_lesson(nid, len(spec["chapters"]), total, spec.get("unit", "手順"))
    print(f"{nid}: {len(spec['chapters'])}章・演習合計{total}分 {'(dry)' if dry else 'OK'}")


def update_lesson(nid, n, total, unit="手順"):
    """教材サイトのデータ（data/lessons/NNN.json）に、演習の時間と、できるようになることを足す。"""
    p = os.path.join(ROOT, "sites", "tenyu-skill-library", "data", "lessons", f"{nid}.json")
    if not os.path.exists(p):
        return
    d = json.load(open(p, encoding="utf-8"))
    les = d.setdefault("lesson", {})
    # 教材ページは products.json の lesson に、この JSON の lesson を「上書き」で重ねる。
    # ここに無い項目を足すと元の値が消えるので、先に products.json の値を写してから足す。
    cat = json.load(open(os.path.join(ROOT, "sites", "tenyu-skill-library", "data", "products.json"), encoding="utf-8"))
    base = next((x for x in cat["products"] if x["id"] == nid), {}).get("lesson", {})
    for key in ("duration", "outcomes", "sections"):
        if key not in les and key in base:
            les[key] = json.loads(json.dumps(base[key]))
    dur = les.get("duration", "")
    if "ミニ演習" not in dur:
        les["duration"] = (dur + "＋" if dur else "") + f"ミニ演習{n}個（約{total}分）"
    oc = les.setdefault("outcomes", [])
    line = f"{unit}ごとのミニ演習で、できたかを自分で確かめる"
    if line not in oc:
        oc.append(line)
    note = f"{n}{'つ' if n < 10 else ''}の{unit}に、それぞれ「できるようになること」を1つずつ決め、{unit}の終わりにミニ演習と合格の目安を置いています（2026-11-19 改訂）。講座本文（完全パック）の順に進めてください。"
    secs = les.get("sections", [])
    tgt = next((s for s in secs if s.get("ordered")), None) or (secs[0] if secs else None)
    if tgt is not None and "ミニ演習" not in tgt.get("body", ""):
        tgt["body"] = (tgt.get("body", "") + "\n" + note).strip() if tgt.get("body") else note
    json.dump(d, open(p, "w", encoding="utf-8", newline="\n"), ensure_ascii=False, indent=2)
    open(p, "a", encoding="utf-8").write("\n")


if __name__ == "__main__":
    main()
