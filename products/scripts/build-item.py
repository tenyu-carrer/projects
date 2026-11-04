# -*- coding: utf-8 -*-
"""Split one item source file into products/output and web lesson data.
usage: python build_item.py <source.md>
Source format: blocks starting with lines '===KIND name'.
KIND: A, B, C, D (markdown files into NNN-X/), ASSET (into NNN-D/assets/),
JSON (lesson json, downloads auto-filled), PNG (diagram spec json -> NNN-D/assets/<name>).
"""
import json, os, re, shutil, sys
from PIL import Image, ImageDraw, ImageFont

# リポジトリの場所は、このファイルの位置（products/scripts）から自動で決める（Windows・Mac共通）
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "products", "output")
SITE = os.path.join(ROOT, "sites", "tenyu-skill-library")
import os as _os
def _pick(*paths):
    for _p in paths:
        if _os.path.exists(_p):
            return _p
    raise FileNotFoundError("日本語フォントが見つかりません: " + ", ".join(paths))
# Windows（游ゴシック）でも Mac（ヒラギノ）でも動くようにする
FONT = _pick(r"C:\Windows\Fonts\YuGothM.ttc", "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc", "/System/Library/Fonts/Hiragino Sans GB.ttc", "/Library/Fonts/Arial Unicode.ttf")
FONTB = _pick(r"C:\Windows\Fonts\YuGothB.ttc", "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc", "/System/Library/Fonts/Hiragino Sans GB.ttc", "/Library/Fonts/Arial Unicode.ttf")


def font(size, bold=False):
    return ImageFont.truetype(FONTB if bold else FONT, size)


def wrap(draw, text, f, width):
    lines, cur = [], ""
    for ch in text:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        if draw.textlength(cur + ch, font=f) > width:
            lines.append(cur); cur = ch
        else:
            cur += ch
    if cur:
        lines.append(cur)
    return lines


def render_png(spec, path):
    if spec.get("layout", "flow") != "flow":
        import importlib.util
        sp = importlib.util.spec_from_file_location("illustrations", os.path.join(os.path.dirname(os.path.abspath(__file__)), "illustrations.py"))
        m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
        return m.render(spec, path)
    W, H = spec.get("size", [1500, 860])
    img = Image.new("RGB", (W, H), "#fbfaf7")
    d = ImageDraw.Draw(img)
    d.text((48, 36), spec["title"], font=font(40, True), fill="#1f2a37")
    if spec.get("subtitle"):
        d.text((48, 92), spec["subtitle"], font=font(22), fill="#5b6472")
    rows = spec["rows"]
    top, bottom = 150, H - 70
    rh = (bottom - top) / len(rows)
    palette = ["#e8f1fb", "#eef7ec", "#fdf1e3", "#f5edf9", "#fdeaea", "#eaf6f6"]
    edge = ["#5b8fd1", "#5aa564", "#d9963a", "#9a6cc0", "#d06666", "#3f9c9c"]
    for ri, row in enumerate(rows):
        y0 = top + ri * rh
        d.text((48, y0 + 8), row["label"], font=font(22, True), fill="#1f2a37")
        boxes = row["boxes"]
        x0, x1 = 260, W - 48
        gap = 18
        bw = (x1 - x0 - gap * (len(boxes) - 1)) / len(boxes)
        for bi, b in enumerate(boxes):
            bx = x0 + bi * (bw + gap)
            c = bi % len(palette) if row.get("rainbow", True) else ri % len(palette)
            d.rounded_rectangle([bx, y0, bx + bw, y0 + rh - 18], radius=14, fill=palette[c], outline=edge[c], width=3)
            head, _, detail = b.partition("｜")
            ty = y0 + 12
            for line in wrap(d, head, font(21, True), bw - 24)[:2]:
                d.text((bx + 12, ty), line, font=font(21, True), fill="#1f2a37")
                ty += 29
            for line in wrap(d, detail, font(18), bw - 24)[:4]:
                d.text((bx + 12, ty), line, font=font(18), fill="#3d4654")
                ty += 25
            if bi < len(boxes) - 1 and row.get("arrows", True):
                ax = bx + bw + 2
                ay = y0 + (rh - 18) / 2
                d.polygon([(ax, ay - 8), (ax + gap - 4, ay), (ax, ay + 8)], fill="#8a94a3")
    d.text((48, H - 48), spec.get("footer", "架空の教材用図解。実データ・実投稿・外部AIの結果ではありません。"), font=font(18), fill="#7a8291")
    img.save(path, "PNG")


def main(src):
    text = open(src, encoding="utf-8").read()
    no = re.search(r"(\d{3})", os.path.basename(src)).group(1)
    blocks = re.split(r"^===", text, flags=re.M)[1:]
    lesson = None
    downloads = []
    dl_dir = os.path.join(SITE, "assets", "downloads", no)
    os.makedirs(dl_dir, exist_ok=True)
    preview = None
    for blk in blocks:
        head, _, body = blk.partition("\n")
        kind, _, name = head.strip().partition(" ")
        name = name.strip()
        body = body.rstrip() + "\n"
        if kind in ("A", "B", "C", "D"):
            d = os.path.join(OUT, f"{no}-{kind}")
            os.makedirs(d, exist_ok=True)
            p = os.path.join(d, name)
            if os.path.exists(p) and "--force" not in sys.argv:
                raise SystemExit(f"exists, not overwriting: {p}")
            open(p, "w", encoding="utf-8").write(body)
        elif kind == "ASSET":
            d = os.path.join(OUT, f"{no}-D", "assets"); os.makedirs(d, exist_ok=True)
            open(os.path.join(d, name), "w", encoding="utf-8").write(body)
        elif kind == "PNG":
            d = os.path.join(OUT, f"{no}-D", "assets"); os.makedirs(d, exist_ok=True)
            spec = json.loads(body)
            render_png(spec, os.path.join(d, name))
            if spec.get("cover"):
                preview = name
            else:
                preview = preview or name
        elif kind == "JSON":
            lesson = json.loads(body)
    if lesson is None:
        raise SystemExit("no JSON block")
    # downloads: assets, C files, D extras
    notes = lesson.pop("downloadNotes", {})
    def add(path, fname):
        shutil.copyfile(path, os.path.join(dl_dir, fname))
        label, note = notes.get(fname, [fname, ""])
        downloads.append({"label": label, "note": note, "url": f"assets/downloads/{no}/{fname}"})
    ad = os.path.join(OUT, f"{no}-D", "assets")
    for f in sorted(os.listdir(ad)) if os.path.isdir(ad) else []:
        add(os.path.join(ad, f), f)
    cd = os.path.join(OUT, f"{no}-C")
    for f in sorted(os.listdir(cd)):
        add(os.path.join(cd, f), f)
    dd = os.path.join(OUT, f"{no}-D")
    for f in sorted(os.listdir(dd)):
        if f not in ("完全パック.md", "assets"):
            add(os.path.join(dd, f), f)
    lesson["lesson"]["downloads"] = downloads
    if preview:
        lesson["previewImage"] = f"assets/downloads/{no}/{preview}"
    lesson.setdefault("source", f"products/output/{no}-D/完全パック.md")
    lesson.setdefault("webStatus", "sample")
    lesson.setdefault("access", {"mode": "sample", "utageProductId": None})
    open(os.path.join(SITE, "data", "lessons", f"{no}.json"), "w", encoding="utf-8").write(json.dumps(lesson, ensure_ascii=False, separators=(",", ":")) + "\n")
    pack = open(os.path.join(dd, "完全パック.md"), encoding="utf-8").read()
    print(no, "pack chars", len(pack), "downloads", len(downloads))


if __name__ == "__main__":
    main(sys.argv[1])
