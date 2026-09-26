"""SPX 국문 사용자 매뉴얼(250805KOR)에서 SPX 자산을 추출한다.

- 카드 판넬 4종(매뉴얼 pp.10–11) → output/design/assets/cards/SPX-*.webp, SPX-BLANK.webp(M3236 후면 사진의 실제 블랭크 판넬)
- 메인프레임 5종 전면·후면 사진(매뉴얼 pp.5–9) → output/design/assets/frames/spx-*-front.webp, spx-*-rear.webp
후면 사진은 원본 픽셀 크기를 그대로 유지한다. src/app.js의 rearPhotos 슬롯 좌표가 원본 픽셀 기준이기 때문이다.
매뉴얼 원본은 저장소에 넣지 않는다(.source-materials/는 .gitignore 대상).
이전 카탈로그 스캔 기반 추출(extract_spx_catalog_cards.py)을 대체한다.
사용법: python3 scripts/tools/extract_spx_manual_assets.py <SPX 매뉴얼 PDF>
필요 패키지: pymupdf, Pillow, numpy, scipy
"""
import importlib.util
import io
import sys
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
CARDS = ROOT / 'output/design/assets/cards'
FRAMES = ROOT / 'output/design/assets/frames'
# (PDF 쪽 번호, 쪽 안 이미지 위치(PDF 좌표 왼쪽·위)) → 파일 이름. 쪽 안에서 위치로 이미지를 고른다.
CARD_IMAGES = {
    'SPX-HIS8': (10, (87, 142)),
    'SPX-HOS10': (10, (87, 453)),
    'SPX-HOS12': (11, (87, 111)),
    'SPX-COS12': (11, (88, 388)),
}
# M3236 후면 사진(1135×772) 속 블랭크 판넬의 나사 줄 한 칸(왼쪽, 위, 오른쪽, 아래). 카드 줄 간격과 같은 55px 높이.
BLANK_BOX = (124, 237, 932, 292)
# 매뉴얼에서 검은 배경 위에 찍힌 판넬. 흰 배경용 faceplate_band 대신 배경을 투명하게 뺀다.
BLACK_BACKED = {'SPX-HOS10', 'SPX-HOS12'}
FRAME_IMAGES = {
    'spx-m810-front': (7, (183, 466)),
    'spx-m810-rear': (7, (183, 533)),
    'spx-m1620-front': (8, (54, 94)),
    'spx-m1620-rear': (8, (299, 94)),
    'spx-m3236-front': (5, (111, 208)),
    'spx-m3236-rear': (6, (104, 195)),
    'spx-m2472-front': (9, (107, 114)),
    'spx-m2472-rear': (9, (322, 114)),
    'spx-m24120-front': (9, (113, 464)),
    'spx-m24120-rear': (9, (317, 464)),
}


def load_prepare():
    spec = importlib.util.spec_from_file_location('prepare', ROOT / 'scripts/tools/prepare_xdm_images.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def image_at(document, page_no, origin):
    page = document[page_no - 1]
    for info in page.get_images(full=True):
        for rect in page.get_image_rects(info[0]):
            if abs(rect.x0 - origin[0]) < 3 and abs(rect.y0 - origin[1]) < 3:
                return Image.open(io.BytesIO(document.extract_image(info[0])['image'])).convert('RGB')
    raise SystemExit(f'p.{page_no} {origin} 위치의 이미지를 찾지 못했습니다.')


def black_backed_plate(image, threshold=12):
    """검은 배경 위에 찍힌 판넬(HOS10·HOS12)에서 테두리와 이어진 검은 배경을 투명하게 하고 판넬 영역만 남긴다."""
    from scipy import ndimage
    import numpy as np
    gray = np.asarray(image.convert('L'))
    labels, _ = ndimage.label(gray < threshold)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    background = np.isin(labels, list(border))
    rgba = np.dstack([np.asarray(image.convert('RGB')), np.where(background, 0, 255).astype('uint8')])
    ys, xs = np.where(~background)
    return Image.fromarray(rgba, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def main(pdf_path):
    faceplate_band = load_prepare().faceplate_band
    document = pymupdf.open(pdf_path)
    for name, (page_no, origin) in CARD_IMAGES.items():
        source = image_at(document, page_no, origin)
        plate = black_backed_plate(source) if name in BLACK_BACKED else faceplate_band(source)
        plate.save(CARDS / f'{name}.webp', 'WEBP', quality=88, method=6)
        print(f'card  {name:16} {plate.size[0]}x{plate.size[1]}')
    for name, (page_no, origin) in FRAME_IMAGES.items():
        image = image_at(document, page_no, origin)
        if name == 'spx-m3236-rear':
            # 빈 슬롯 커버: M3236 후면 사진 가운데의 실제 블랭크 판넬에서 위쪽 나사 줄을 카드 한 칸 높이(55px)로 잘라 쓴다.
            blank = image.crop(BLANK_BOX)
            blank.save(CARDS / 'SPX-BLANK.webp', 'WEBP', quality=88, method=6)
            print(f'card  {"SPX-BLANK":16} {blank.size[0]}x{blank.size[1]} (M3236 후면 블랭크 판넬)')
        image.save(FRAMES / f'{name}.webp', 'WEBP', quality=86, method=6)
        print(f'frame {name:16} {image.size[0]}x{image.size[1]}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
