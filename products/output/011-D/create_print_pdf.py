from pathlib import Path

from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


HERE = Path(__file__).resolve().parent
SOURCE = HERE / "assets" / "011-coloring-sample-reading-nook.png"
OUTPUT = HERE / "011-coloring-sample-A4.pdf"

page_width, page_height = A4
margin = 12 / 25.4 * 72

with Image.open(SOURCE) as image:
    image_width, image_height = image.size

available_width = page_width - margin * 2
available_height = page_height - margin * 2
scale = min(available_width / image_width, available_height / image_height)
draw_width = image_width * scale
draw_height = image_height * scale
x = (page_width - draw_width) / 2
y = (page_height - draw_height) / 2

pdf = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
pdf.setTitle("011 AI Coloring Page Sample - Reading Nook")
pdf.drawImage(
    ImageReader(str(SOURCE)),
    x,
    y,
    width=draw_width,
    height=draw_height,
    preserveAspectRatio=True,
    mask="auto",
)
pdf.showPage()
pdf.save()
print(OUTPUT)

