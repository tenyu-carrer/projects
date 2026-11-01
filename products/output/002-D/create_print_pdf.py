from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas


HERE = Path(__file__).resolve().parent
OUTPUT = HERE / "002-event-flyer-A4-preview.pdf"
W, H = A4
NAVY = HexColor("#142746")
BLUE = HexColor("#213C64")
GOLD = HexColor("#C39A50")
CREAM = HexColor("#F8F4EA")
INK = HexColor("#192842")
MUTED = HexColor("#687385")

pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
pdfmetrics.registerFont(UnicodeCIDFont("HeiseiMin-W3"))
GOTHIC = "HeiseiKakuGo-W5"
MINCHO = "HeiseiMin-W3"

c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
c.setTitle("002 Canvaでチラシ・ポスターを作る方法 - A4完成見本")
c.setAuthor("天祐 AI Skill Library")

# Warm paper with a strong, quiet header panel.
c.setFillColor(CREAM)
c.rect(0, 0, W, H, fill=1, stroke=0)
c.setFillColor(NAVY)
c.rect(0, H - 190, W, 190, fill=1, stroke=0)
c.setFillColor(BLUE)
c.circle(W + 8, H - 135, 105, fill=1, stroke=0)
c.setStrokeColor(GOLD)
c.setLineWidth(1.6)
c.circle(W + 8, H - 135, 126, fill=0, stroke=1)

# Visible sample marking so the fictional data cannot be mistaken for an event announcement.
c.setFillColor(GOLD)
c.roundRect(43, H - 50, 92, 21, 10, fill=1, stroke=0)
c.setFillColor(NAVY)
c.setFont(GOTHIC, 8)
c.drawCentredString(89, H - 43, "架空サンプル")
c.setFillColor(HexColor("#E4C987"))
c.setFont(GOTHIC, 8)
c.drawRightString(W - 43, H - 43, "FLYER DESIGN / A4")

c.setFillColor(white)
c.setFont(MINCHO, 19)
c.drawString(43, H - 91, "はじめての")
c.setFont(GOTHIC, 38)
c.drawString(41, H - 137, "AI体験会")
c.setStrokeColor(GOLD)
c.setLineWidth(1.4)
c.line(43, H - 157, W - 43, H - 157)
c.setFillColor(HexColor("#E4C987"))
c.setFont(GOTHIC, 8)
c.drawString(43, H - 176, "日時・会場・申込方法を、ひと目で伝えるレイアウト例")

# Event facts panel.
c.setFillColor(INK)
c.setFont(GOTHIC, 8)
c.drawString(47, H - 225, "WHEN")
c.setFont(MINCHO, 25)
c.drawString(47, H - 258, "開催日を入力")
c.setStrokeColor(GOLD)
c.setLineWidth(0.8)
c.line(47, H - 274, W - 47, H - 274)

facts = [
    ("日時", "開始・終了時刻を入力"),
    ("会場", "会場名・階数を入力"),
    ("料金", "参加費・定員を入力"),
]
y = H - 302
for label, value in facts:
    c.setFillColor(GOLD)
    c.circle(56, y + 2, 10, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont(GOTHIC, 5.5)
    c.drawCentredString(56, y, label)
    c.setFillColor(INK)
    c.setFont(GOTHIC, 10)
    c.drawString(75, y - 2, value)
    y -= 35

# Value statement and three short takeaways.
c.setFillColor(NAVY)
c.roundRect(43, H - 468, W - 86, 58, 11, fill=1, stroke=0)
c.setFillColor(HexColor("#E4C987"))
c.setFont(GOTHIC, 8)
c.drawString(59, H - 431, "この体験会でできること")
c.setFillColor(white)
c.setFont(MINCHO, 15)
c.drawString(59, H - 454, "AIを使った画像と文章づくりを体験")

c.setFillColor(INK)
c.setFont(GOTHIC, 10)
takeaways = ["専門知識なしで最初の操作を体験", "自分の題材で短い文章を作る", "家に帰って試す一歩を持ち帰る"]
y = H - 503
for i, item in enumerate(takeaways, 1):
    c.setFillColor(GOLD)
    c.circle(54, y + 3, 8, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont(GOTHIC, 7)
    c.drawCentredString(54, y + 1, str(i))
    c.setFillColor(INK)
    c.setFont(GOTHIC, 10)
    c.drawString(72, y, item)
    y -= 27

# Clear application block. This is intentionally not a QR code.
block_y = 88
c.setFillColor(white)
c.roundRect(43, block_y, W - 86, 92, 12, fill=1, stroke=0)
c.setStrokeColor(GOLD)
c.setLineWidth(1)
c.roundRect(56, block_y + 14, 64, 64, 7, fill=0, stroke=1)
c.setFillColor(GOLD)
c.setFont(GOTHIC, 7)
c.drawCentredString(88, block_y + 50, "申込欄")
c.setFillColor(MUTED)
c.setFont(GOTHIC, 6)
c.drawCentredString(88, block_y + 36, "QRを実URLで")
c.drawCentredString(88, block_y + 25, "作成して差替え")
c.setFillColor(NAVY)
c.setFont(GOTHIC, 12)
c.drawString(137, block_y + 59, "申込方法を入力")
c.setFillColor(MUTED)
c.setFont(GOTHIC, 8)
c.drawString(137, block_y + 40, "URL・締切・問い合わせ先を忘れずに")
c.setFillColor(GOLD)
c.roundRect(137, block_y + 12, 142, 20, 10, fill=1, stroke=0)
c.setFillColor(NAVY)
c.setFont(GOTHIC, 7)
c.drawCentredString(208, block_y + 19, "申込はこちら →")

c.setFillColor(MUTED)
c.setFont(GOTHIC, 6.5)
c.drawCentredString(W / 2, 57, "架空サンプルです。配布前に実情報・申込先・利用条件へ差し替えてください。")
c.setFillColor(GOLD)
c.rect(0, 0, W, 9, fill=1, stroke=0)

c.showPage()
c.save()
print(OUTPUT)

