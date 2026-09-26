"""SPX 카탈로그(스캔 PDF) 4쪽에서 SPX 카드 판넬을 잘라 WebP로 저장하고, SPX 블랭크 커버를 합성한다.

사용자 제공 고해상도 SPX 후면 사진을 받으면 그 사진에서 다시 자르는 것이 좋다(현재는 임시 자산).
카탈로그 원본은 저장소에 넣지 않는다(.source-materials/는 .gitignore 대상).
사용법: python3 scripts/tools/extract_spx_catalog_cards.py <SPX 카탈로그 PDF>
필요 패키지: pymupdf, Pillow
"""
import importlib.util
import io
import sys
from pathlib import Path

import pymupdf
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[2]
CARDS = ROOT / 'output/design/assets/cards'
# 카탈로그 4쪽 이미지(2481x3509) 안의 카드 영역. 이름은 구성기 카드 ID를 따른다.
BOXES = {
    'SPX-HIS8': (170, 765, 1080, 855),
    'SPX-COS12': (170, 1350, 1080, 1445),
    'SPX-HOS10': (170, 1770, 1080, 1860),
    'SPX-HOS12': (170, 2235, 1080, 2325),
}


def load_faceplate_band():
    spec = importlib.util.spec_from_file_location('prepare', ROOT / 'scripts/tools/prepare_xdm_images.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.faceplate_band


def blank_from(source):
    """HIS8 판넬의 나사 끝부분과 나사·포트 사이 금속면으로 빈 슬롯 커버를 만든다."""
    source = source.convert('RGBA')
    width, height = source.size
    end_width = 52
    metal = source.crop((44, 0, 62, height)).convert('RGB')
    pixels = metal.load()
    rows = [tuple(sum(pixels[x, y][c] for x in range(metal.width)) // metal.width for c in range(3)) for y in range(height)]
    plate = Image.new('RGB', (width, height))
    target = plate.load()
    for y in range(height):
        for x in range(width):
            target[x, y] = rows[y]
    plate = plate.filter(ImageFilter.GaussianBlur(0.5)).convert('RGBA')
    end = source.crop((0, 0, end_width, height))
    plate.paste(end, (0, 0))
    plate.paste(ImageOps.mirror(end), (width - end_width, 0))
    return plate


def main(pdf_path):
    faceplate_band = load_faceplate_band()
    document = pymupdf.open(pdf_path)
    info = document[3].get_images(full=True)[0]
    page = Image.open(io.BytesIO(document.extract_image(info[0])['image'])).convert('RGB')
    for name, box in BOXES.items():
        plate = faceplate_band(page.crop(box))
        plate.save(CARDS / f'{name}.webp', 'WEBP', quality=86, method=6)
        print(f'{name:10} {plate.size[0]}x{plate.size[1]}')
        if name == 'SPX-HIS8':
            blank = blank_from(plate)
            blank.save(CARDS / 'SPX-BLANK.webp', 'WEBP', quality=86, method=6)
            print(f'{"SPX-BLANK":10} {blank.size[0]}x{blank.size[1]} (합성)')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
