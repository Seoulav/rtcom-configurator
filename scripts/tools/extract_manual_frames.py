"""XDM 국문 매뉴얼 PDF(KV08, 2025-09-02)에서 프레임 전면·후면 사진을 꺼내 웹용 WebP로 저장한다.

매뉴얼 원본은 저장소에 넣지 않는다(.source-materials/는 .gitignore 대상).
사용법: python3 scripts/tools/extract_manual_frames.py <매뉴얼 PDF>
필요 패키지: pymupdf, Pillow
결과: output/design/assets/frames/<모델>-front.webp, <모델>-rear.webp
- 사진은 (쪽 번호, 가로, 세로)로 찾는다. 매뉴얼 판이 바뀌면 이 표를 다시 확인한다.
- XDM-12 전면은 사용자 제공 고해상도 사진(prepare_xdm_images.py)을 쓰므로 여기서 만들지 않는다.
- XDM-216은 매뉴얼에 후면 사진이 없다.
"""
import io
import sys
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
FRAMES = ROOT / 'output/design/assets/frames'
PHOTOS = {
    'xdm-20-front': (6, 666, 605),
    'xdm-36-front': (9, 430, 363),
    'xdm-72-front': (10, 364, 527),
    'xdm-144-front': (11, 215, 551),
    'xdm-216-front': (12, 414, 1073),
    'xdm-12-rear': (8, 589, 223),
    'xdm-20-rear': (9, 525, 478),
    'xdm-36-rear': (9, 452, 419),
    'xdm-72-rear': (10, 400, 644),
    'xdm-144-rear': (11, 366, 1035),
}


def find_image(document, page_number, width, height):
    for info in document[page_number - 1].get_images(full=True):
        if (info[2], info[3]) == (width, height):
            data = document.extract_image(info[0])
            return Image.open(io.BytesIO(data['image'])).convert('RGB')
    raise SystemExit(f'{page_number}쪽에서 {width}x{height} 사진을 찾지 못했습니다. 매뉴얼 판을 확인하세요.')


def trim_white(image):
    """전면 사진의 흰 여백을 잘라낸다."""
    mask = image.convert('L').point(lambda value: 255 if value < 235 else 0)
    return image.crop(mask.getbbox())


def main(pdf_path):
    document = pymupdf.open(pdf_path)
    FRAMES.mkdir(parents=True, exist_ok=True)
    for name, (page, width, height) in PHOTOS.items():
        image = find_image(document, page, width, height)
        if name.endswith('-front'):
            image = trim_white(image)
        target = FRAMES / f'{name}.webp'
        image.save(target, 'WEBP', quality=88, method=6)
        print(f'{name:14} p.{page:<3} {image.size[0]}x{image.size[1]} {target.stat().st_size // 1024}KB')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
