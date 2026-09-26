"""VDM 국문 매뉴얼(KV07, 2025-12-19)과 사용자 제공 VDM-48X 사진에서 구성기용 WebP 자산을 만든다.

사용법: python3 scripts/tools/extract_vdm_assets.py <VDM 매뉴얼 PDF> <VDM-48X.jpg>
필요 패키지: pymupdf, Pillow. 원본은 저장소에 넣지 않는다(.source-materials/는 .gitignore 대상).
결과:
- output/design/assets/cards/<카드 ID>.webp : 구성기 VDM 카드 10종 판넬, VDM-BLANK.webp(합성)
- output/design/assets/frames/vdm-16x-front.webp, vdm-16x-rear.webp(사진), vdm-48x-front.webp
- output/design/assets/frames/vdm-<모델>-rear.webp : 8X·32X·48X·64X·80X·128X·180X·256X 후면 선 도면
"""
import importlib.util
import io
import sys
from pathlib import Path

import pymupdf
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[2]
CARDS = ROOT / 'output/design/assets/cards'
FRAMES = ROOT / 'output/design/assets/frames'
# 구성기 카드 ID → 매뉴얼 보드 사진 쪽 번호(2.3 Input / 2.4 Output Boards Specifications)
BOARD_PAGES = {
    'HIS4-U': 21, 'CIS4-U': 23, 'FIS4-U': 24, 'SIS4-U': 29,  # 매뉴얼의 SDI 입력 보드는 VDM-SIS4(p.28) 하나뿐
    'HOS4-U': 31, 'COS4-U': 35, 'FOS4-U': 36, 'SOS4': 43, 'QOS4S-U': 44, 'HOS4S-UW': 45,
}
FRONT_16X = (6, 763, 353)
REAR_16X = (7, 628, 418)
# 후면 선 도면: 모델 → (PDF 쪽, 원본 이미지 크기, 이미지 안의 후면 영역(왼쪽, 위, 오른쪽, 아래)).
# 16X만 실물 사진(p.7)이 있고, 나머지는 2.2 Router Frame Specifications의 선 도면을 쓴다.
# 구성기 rearPhotos 좌표는 이 잘린 도면의 원본 픽셀 기준이므로 크기를 바꾸지 않는다.
REAR_DRAWINGS = {
    '8x': (12, (641, 243), (4, 22, 641, 217)),
    '32x': (14, (976, 473), (518, 0, 976, 473)),
    '48x': (15, (976, 677), (528, 0, 976, 677)),
    '64x': (16, (976, 819), (525, 0, 976, 819)),
    '80x': (17, (250, 639), (6, 4, 245, 635)),
    '128x': (18, (976, 1176), (499, 0, 976, 1176)),
    '180x': (19, (171, 640), (0, 1, 170, 637)),
    '256x': (20, (976, 777), (504, 0, 976, 777)),
}


def load_faceplate_band():
    spec = importlib.util.spec_from_file_location('prepare', ROOT / 'scripts/tools/prepare_xdm_images.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.faceplate_band


def largest_image(document, page_number, size=None):
    images = document[page_number - 1].get_images(full=True)
    if size:
        images = [item for item in images if (item[2], item[3]) == size]
    info = max(images, key=lambda item: item[2] * item[3])
    return Image.open(io.BytesIO(document.extract_image(info[0])['image'])).convert('RGB')


def blank_from(source):
    """HIS4-U 판넬의 나사 끝부분과 줄별 중간값 색으로 빈 슬롯 커버를 만든다."""
    source = source.convert('RGBA')
    width, height = source.size
    end_width = max(8, round(width * 0.075))
    rgb = source.convert('RGB')
    pixels = rgb.load()
    # 판넬이 거의 균일한 검정이라, 줄마다 전체 폭의 중간값 색을 쓰면 포트·글자의 영향을 받지 않는다.
    rows = []
    for y in range(height):
        values = sorted(pixels[x, y] for x in range(end_width, width - end_width))
        rows.append(values[len(values) // 2])
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


def trim_white(image):
    mask = image.convert('L').point(lambda value: 255 if value < 235 else 0)
    return image.crop(mask.getbbox())


def save(image, path, width=None):
    if width and image.width > width:
        image = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
    image.save(path, 'WEBP', quality=86, method=6)
    print(f'{path.name:22} {image.size[0]}x{image.size[1]} {path.stat().st_size // 1024}KB')
    return image


def main(pdf_path, photo_48x):
    faceplate_band = load_faceplate_band()
    document = pymupdf.open(pdf_path)
    for card_id, page in BOARD_PAGES.items():
        plate = save(faceplate_band(largest_image(document, page)), CARDS / f'{card_id}.webp', 1000)
        if card_id == 'HIS4-U':
            save(blank_from(plate), CARDS / 'VDM-BLANK.webp')
    FRAMES.mkdir(parents=True, exist_ok=True)
    save(trim_white(largest_image(document, FRONT_16X[0], FRONT_16X[1:])), FRAMES / 'vdm-16x-front.webp', 1000)
    # 매뉴얼 설명 번호(①~⑦)와 지시선을 빼고 장비 본체만 남긴다. 구성기 rearPhotos 좌표는 이 잘린 사진(449x278) 기준이다.
    save(largest_image(document, REAR_16X[0], REAR_16X[1:]).crop((100, 76, 549, 354)), FRAMES / 'vdm-16x-rear.webp')
    save(trim_white(Image.open(photo_48x).convert('RGB')), FRAMES / 'vdm-48x-front.webp', 900)
    for model, (page, size, box) in REAR_DRAWINGS.items():
        save(largest_image(document, page, size).crop(box), FRAMES / f'vdm-{model}-rear.webp')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
