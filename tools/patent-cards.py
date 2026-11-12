# Renders patents/NN/og.jpg, the 1200x630 preview card LinkedIn, Slack and others show
# for each patent page. Reads the patent list from projects.js.
#   python tools/patent-cards.py        (needs: pip install playwright pillow; playwright install chromium)
import json, pathlib, subprocess, base64, io
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
patents = json.loads(subprocess.check_output(
    ["node", "-e", "const w={};new Function('window',require('fs').readFileSync('projects.js','utf8'))(w);"
     "process.stdout.write(JSON.stringify(w.PATENTS.filter(p=>p.number)))"], cwd=ROOT))

def page_crop(p):
    im = Image.open(ROOT / p["dir"] / "p01.webp").convert("RGB")
    top = im.crop((0, 0, im.width, int(im.width * 1.2)))  # the header block, title, inventors and abstract
    buf = io.BytesIO(); top.save(buf, "JPEG", quality=88)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

TPL = """<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,500..800&family=Big+Shoulders+Display:wght@900&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#1d36d6;color:#efe4cc;font-family:Archivo,sans-serif;position:relative}
body:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(239,228,204,.07) 0 2px,transparent 2px 9px)}
.sheet{position:absolute;left:58px;top:64px;width:470px;height:560px;background:#faf6ec;transform:rotate(-3deg);
  box-shadow:10px 12px 0 rgba(14,22,74,.35);overflow:hidden;border:2px solid #efe4cc}
.sheet img{width:100%;display:block;mix-blend-mode:multiply}
.txt{position:absolute;left:600px;right:56px;top:70px}
.k{font:600 15px/1.4 "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.num{margin-top:14px;font:600 26px/1 "JetBrains Mono",monospace;letter-spacing:.02em}
h1{margin-top:26px;font:900 66px/.92 "Big Shoulders Display",sans-serif;text-transform:uppercase;letter-spacing:.005em}
.who{position:absolute;left:600px;bottom:62px;font-weight:700;font-size:22px}
.who span{display:block;font-weight:500;font-size:17px;opacity:.85;margin-top:4px}
.star{position:absolute;right:56px;bottom:58px;width:56px;height:56px;fill:#efe4cc}
</style></head><body>
<div class="sheet"><img src="__IMG__"></div>
<div class="txt"><p class="k">Published patent application</p><p class="num">__NUM__</p><h1>__TITLE__</h1></div>
<p class="who">Anshul Panigrahi<span>Co-inventor · __OFFICE__ · __DATE__</span></p>
<svg class="star" viewBox="-50 -50 100 100"><path d="M0 -50 C3 -12 12 -3 50 0 C12 3 3 12 0 50 C-3 12 -12 3 -50 0 C-12 -3 -3 -12 0 -50Z"/></svg>
</body></html>"""

with sync_playwright() as pw:
    b = pw.chromium.launch(channel="chrome")
    page = b.new_page(viewport={"width": 1200, "height": 630})
    for p in patents:
        html = (TPL.replace("__IMG__", page_crop(p)).replace("__NUM__", p["number"]).replace("__TITLE__", p["short"])
                .replace("__OFFICE__", "Indian Patent Office").replace("__DATE__", "Published " + p["published"]))
        page.set_content(html, wait_until="networkidle")
        page.wait_for_timeout(300)
        out = ROOT / p["dir"] / "og.jpg"
        png = page.screenshot()
        Image.open(io.BytesIO(png)).convert("RGB").save(out, "JPEG", quality=86, optimize=True, progressive=True)
        print("wrote", out.relative_to(ROOT), out.stat().st_size // 1024, "KB")
    b.close()
