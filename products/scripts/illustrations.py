# -*- coding: utf-8 -*-
"""Topic-specific cover illustrations for 商品マスター180 (flat, hand-made look).
Called from build-item.py when a PNG spec has "layout" other than "flow".
Layouts: phone, timeline, calendar, chat, wave, cards.
"""
import math
from PIL import Image, ImageDraw, ImageFont

FONT = r"C:\Windows\Fonts\YuGothM.ttc"
FONTB = r"C:\Windows\Fonts\YuGothB.ttc"
INK = "#1f2a37"
SUB = "#5b6472"
THEMES = {
    "warm": {"bg": "#f6efe6", "accent": ["#e07a5f", "#f2cc8f", "#81b29a", "#3d405b", "#c9a7d8"]},
    "cool": {"bg": "#eef3f6", "accent": ["#4f8fc0", "#9cc5a1", "#f4a261", "#2a4d69", "#e9c46a"]},
    "fresh": {"bg": "#f1f6ee", "accent": ["#6a994e", "#f4a259", "#5b8e7d", "#bc4b51", "#8cb369"]},
    "night": {"bg": "#1e2230", "accent": ["#f6bd60", "#84a59d", "#f28482", "#a3c4f3", "#cdb4db"]},
    "pink": {"bg": "#fbeff1", "accent": ["#d1495b", "#edae49", "#00798c", "#30638e", "#8e7dbe"]},
}


def font(size, bold=False):
    return ImageFont.truetype(FONTB if bold else FONT, size)


def wrap(d, text, f, width):
    text = "".join(ch for ch in text if ord(ch) < 0x1F000 and not 0x2600 <= ord(ch) <= 0x27BF)
    lines, cur = [], ""
    for ch in text:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        if d.textlength(cur + ch, font=f) > width:
            lines.append(cur); cur = ch
        else:
            cur += ch
    if cur:
        lines.append(cur)
    return lines


def text_block(d, xy, text, size, width, color=INK, bold=False, max_lines=4, gap=6):
    x, y = xy
    f = font(size, bold)
    for line in wrap(d, text, f, width)[:max_lines]:
        d.text((x, y), line, font=f, fill=color)
        y += size + gap
    return y


def base(spec):
    W, H = spec.get("size", [1500, 860])
    th = THEMES.get(spec.get("theme", "warm"), THEMES["warm"])
    img = Image.new("RGB", (W, H), th["bg"])
    d = ImageDraw.Draw(img)
    dark = spec.get("theme") == "night"
    title_c = "#f4f1ea" if dark else INK
    d.text((56, 40), spec["title"], font=font(38, True), fill=title_c)
    if spec.get("subtitle"):
        d.text((56, 94), spec["subtitle"], font=font(21), fill="#c8ccd6" if dark else SUB)
    foot = spec.get("footer", "架空の教材用イラスト。実データ・実投稿ではありません。")
    d.text((56, H - 42), foot, font=font(16), fill="#9aa1ad" if dark else "#8a919c")
    return img, d, W, H, th, dark


def phone(spec, path):
    img, d, W, H, th, dark = base(spec)
    screens = spec["screens"]
    n = len(screens)
    pw, ph = 300, 600
    gap = (W - 112 - n * pw) / max(n - 1, 1) if n > 1 else 0
    top = 150
    for i, s in enumerate(screens):
        if spec.get("notes") and n < 3:
            x = 56 + i * (pw + 60)
        else:
            x = 56 + i * (pw + gap) if n > 1 else (W - pw) / 2
        acc = s.get("color", th["accent"][i % len(th["accent"])])
        d.rounded_rectangle([x, top, x + pw, top + ph], radius=38, fill="#20242e")
        sx0, sy0, sx1, sy1 = x + 14, top + 34, x + pw - 14, top + ph - 34
        d.rounded_rectangle([sx0, sy0, sx1, sy1], radius=22, fill="#ffffff")
        d.rounded_rectangle([x + pw / 2 - 40, top + 14, x + pw / 2 + 40, top + 22], radius=4, fill="#3a3f4b")
        # header row: avatar + name
        d.ellipse([sx0 + 14, sy0 + 14, sx0 + 46, sy0 + 46], fill=acc)
        d.text((sx0 + 56, sy0 + 18), s.get("header", "account"), font=font(17, True), fill=INK)
        # image area
        ix0, iy0, ix1, iy1 = sx0 + 10, sy0 + 58, sx1 - 10, sy0 + 58 + s.get("image_h", 250)
        iw, ih = int(ix1 - ix0), int(iy1 - iy0)
        pic = Image.new("RGB", (iw, ih), acc)
        pd = ImageDraw.Draw(pic)
        for k in range(3):  # soft shapes to look like a photo/illustration
            r = 34 + k * 20
            cx = iw * (0.22 + 0.3 * k)
            cy = ih - 10 - k * 18
            pd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=th["accent"][(i + k + 1) % len(th["accent"])])
        mask = Image.new("L", (iw, ih), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, iw - 1, ih - 1], radius=14, fill=255)
        img.paste(pic, (int(ix0), int(iy0)), mask)
        if s.get("overlay"):
            ov = s["overlay"]
            f = font(26, True)
            lines = wrap(d, ov, f, ix1 - ix0 - 40)[:2]
            bh = 40 * len(lines) + 16
            by = iy0 + 26
            d.rounded_rectangle([ix0 + 14, by, ix1 - 14, by + bh], radius=10, fill="#ffffff")
            yy = by + 8
            for ln in lines:
                d.text((ix0 + 26, yy), ln, font=f, fill=INK)
                yy += 40
        y = iy1 + 14
        for ln in s.get("lines", [])[:5]:
            y = text_block(d, (sx0 + 16, y), ln, 17, sx1 - sx0 - 32, color=INK, max_lines=2, gap=4) + 6
        if s.get("tag"):
            tw = d.textlength(s["tag"], font=font(16, True)) + 28
            d.rounded_rectangle([sx0 + 14, sy1 - 46, sx0 + 14 + tw, sy1 - 14], radius=16, fill=acc)
            d.text((sx0 + 28, sy1 - 42), s["tag"], font=font(16, True), fill="#ffffff")
        if s.get("label"):
            lc = "#f4f1ea" if dark else INK
            lw = d.textlength(s["label"], font=font(20, True))
            d.text((x + pw / 2 - lw / 2, top + ph + 12), s["label"], font=font(20, True), fill=lc)
    # side notes
    if spec.get("notes") and n < 3:
        nx = 56 + n * (pw + 60) + 40
        y = 190
        for note in spec["notes"]:
            d.rounded_rectangle([nx, y, W - 56, y + 96], radius=16, fill="#ffffff")
            text_block(d, (nx + 20, y + 16), note, 21, W - 56 - nx - 40, max_lines=3)
            y += 116
    img.save(path, "PNG")


def timeline(spec, path):
    img, d, W, H, th, dark = base(spec)
    tracks = spec["tracks"]
    x0, x1 = 300, W - 70
    th_h = 150
    top = max(160, (H - th_h * len(tracks)) / 2 + 20)
    for ti, tr in enumerate(tracks):
        y = top + ti * th_h
        lc = "#f4f1ea" if dark else INK
        text_block(d, (56, y + 14), tr["label"], 22, 220, color=lc, bold=True, max_lines=2)
        total = tr["total"]
        d.rounded_rectangle([x0, y + 10, x1, y + th_h - 40], radius=12, fill="#2a2f3d" if dark else "#ffffff")
        for si, seg in enumerate(tr["segments"]):
            a = x0 + (x1 - x0) * seg["start"] / total
            b = x0 + (x1 - x0) * seg["end"] / total
            col = seg.get("color", th["accent"][si % len(th["accent"])])
            d.rounded_rectangle([a + 2, y + 16, b - 2, y + th_h - 46], radius=10, fill=col)
            if seg.get("text"):
                text_block(d, (a + 10, y + 24), seg["text"], 18, max(b - a - 18, 40), color="#ffffff", bold=True, max_lines=3, gap=3)
        for t in tr.get("ticks", []):
            tx = x0 + (x1 - x0) * t / total
            d.text((tx - 12, y + th_h - 34), tr.get("tick_fmt", "{}").format(t), font=font(15), fill="#9aa1ad" if dark else SUB)
    img.save(path, "PNG")


def calendar(spec, path):
    img, d, W, H, th, dark = base(spec)
    days = spec.get("days", 31)
    start = spec.get("start_weekday", 0)
    names = ["月", "火", "水", "木", "金", "土", "日"]
    x0, y0 = 56, 150
    cw = (W - 112) / 7
    rows = math.ceil((start + days) / 7)
    ch = (H - 210 - 40) / rows
    for i, n in enumerate(names):
        d.text((x0 + i * cw + cw / 2 - 10, y0), n, font=font(20, True), fill=INK)
    entries = spec.get("entries", {})
    for day in range(1, days + 1):
        idx = start + day - 1
        r, c = divmod(idx, 7)
        cx, cy = x0 + c * cw, y0 + 36 + r * ch
        d.rounded_rectangle([cx + 4, cy + 4, cx + cw - 4, cy + ch - 4], radius=10, fill="#ffffff")
        d.text((cx + 12, cy + 8), str(day), font=font(16, True), fill=SUB)
        e = entries.get(str(day))
        if e:
            col = e[1] if len(e) > 1 else th["accent"][day % len(th["accent"])]
            d.rounded_rectangle([cx + 10, cy + 32, cx + cw - 10, cy + ch - 10], radius=8, fill=col)
            text_block(d, (cx + 16, cy + 36), e[0], 15, cw - 34, color="#ffffff", bold=True, max_lines=2, gap=2)
    if spec.get("legend"):
        lx = W - 56
        for name, col in reversed(spec["legend"]):
            tw = d.textlength(name, font=font(17)) + 40
            lx -= tw + 16
            d.rounded_rectangle([lx, 100, lx + 22, 122], radius=5, fill=col)
            d.text((lx + 30, 100), name, font=font(17), fill=INK)
    img.save(path, "PNG")


def chat(spec, path):
    img, d, W, H, th, dark = base(spec)
    y = 160
    maxw = W * 0.55
    for i, m in enumerate(spec["messages"]):
        f = font(21)
        lines = wrap(d, m["text"], f, maxw - 48)[:4]
        bh = 30 * len(lines) + 34 + (26 if m.get("name") else 0)
        bw = min(maxw, max(d.textlength(l, font=f) for l in lines) + 48)
        right = m.get("side") == "right"
        col = m.get("color", th["accent"][0] if right else "#ffffff")
        tc = "#ffffff" if right else INK
        x = W - 56 - bw - 70 if right else 56 + 70
        av = (W - 56 - 54) if right else 56
        d.ellipse([av, y, av + 54, y + 54], fill=th["accent"][(i + 2) % len(th["accent"])])
        d.rounded_rectangle([x, y, x + bw, y + bh], radius=22, fill=col)
        yy = y + 14
        if m.get("name"):
            d.text((x + 24, yy), m["name"], font=font(16, True), fill=tc)
            yy += 26
        for l in lines:
            d.text((x + 24, yy), l, font=f, fill=tc)
            yy += 30
        if m.get("note"):
            nx = 56 + 70 if right else x + bw + 20
            d.text((nx if not right else x - d.textlength(m["note"], font=font(16)) - 20, y + bh - 24), m["note"], font=font(16), fill=SUB)
        y += bh + 22
        if y > H - 120:
            break
    img.save(path, "PNG")


def wave(spec, path):
    img, d, W, H, th, dark = base(spec)
    x0, x1 = 80, W - 80
    mid = H / 2 + 30
    total = spec.get("seconds", 60)
    for s in spec.get("segments", []):
        a = x0 + (x1 - x0) * s["start"] / total
        b = x0 + (x1 - x0) * s["end"] / total
        col = s.get("color", th["accent"][0])
        d.rounded_rectangle([a, mid - 200, b, mid + 200], radius=14, fill=col)
        lw = d.textlength(s["label"], font=font(20, True))
        d.rounded_rectangle([a, mid - 250, a + lw + 24, mid - 212], radius=10, fill=col)
        d.text((a + 12, mid - 246), s["label"], font=font(20, True), fill=INK)
    seed = spec.get("seed", 7)
    n = 220
    bw = (x1 - x0) / n
    for i in range(n):
        t = i / n
        amp = (math.sin(t * 37 + seed) * 0.5 + math.sin(t * 91 + seed * 2) * 0.3 + 0.6)
        for q in spec.get("quiet", []):
            if q[0] <= t * total <= q[1]:
                amp *= 0.12
        h = 150 * abs(amp)
        col = "#f4f1ea" if dark else "#3d405b"
        d.rounded_rectangle([x0 + i * bw + 1, mid - h, x0 + i * bw + bw - 1, mid + h], radius=2, fill=col)
    for t in spec.get("ticks", []):
        tx = x0 + (x1 - x0) * t / total
        d.text((tx - 14, mid + 214), spec.get("tick_fmt", "{}秒").format(t), font=font(16), fill="#9aa1ad" if dark else SUB)
    img.save(path, "PNG")


def cards(spec, path):
    img, d, W, H, th, dark = base(spec)
    cs = spec["cards"]
    n = len(cs)
    gap = 28
    cw = (W - 112 - gap * (n - 1)) / n
    maxl = max(len(c.get("lines", [])) for c in cs)
    ch_ = min(H - 260, 150 + maxl * 70)
    top = max(160, (H - ch_) / 2 + 20)
    bot = top + ch_
    for i, c in enumerate(cs):
        x = 56 + i * (cw + gap)
        rot_off = (i % 2) * 14
        col = c.get("color", th["accent"][i % len(th["accent"])])
        d.rounded_rectangle([x + 6, top + rot_off + 8, x + cw + 6, bot + rot_off - 20 + 8], radius=20, fill="#00000018" if False else "#d9d2c5")
        d.rounded_rectangle([x, top + rot_off, x + cw, bot + rot_off - 20], radius=20, fill="#ffffff")
        d.rounded_rectangle([x, top + rot_off, x + cw, top + rot_off + 70], radius=20, fill=col)
        d.rectangle([x, top + rot_off + 50, x + cw, top + rot_off + 70], fill=col)
        text_block(d, (x + 20, top + rot_off + 18), c["head"], 22, cw - 40, color="#ffffff", bold=True, max_lines=1)
        y = top + rot_off + 90
        for ln in c.get("lines", []):
            d.ellipse([x + 20, y + 9, x + 30, y + 19], fill=col)
            y = text_block(d, (x + 40, y), ln, 19, cw - 60, max_lines=3, gap=4) + 10
    img.save(path, "PNG")


LAYOUTS = {"phone": phone, "timeline": timeline, "calendar": calendar, "chat": chat, "wave": wave, "cards": cards}


def render(spec, path):
    LAYOUTS[spec["layout"]](spec, path)
