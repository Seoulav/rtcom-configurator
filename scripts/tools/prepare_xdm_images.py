"""XDM 카드 판넬·프레임 원본 사진을 웹용 WebP로 가공한다.

원본은 저장소에 넣지 않는다(.source-materials/는 .gitignore 대상).
사용법: python3 scripts/tools/prepare_xdm_images.py <원본 폴더>
  <원본 폴더>/in/*.png, out/*.png  : 카드 후면 판넬 사진 (파일 이름 = 카드 모델명)
  <원본 폴더>/frame/XDM-12.png     : 프레임 전면 사진 (XDM-12만 사용)
결과: output/design/assets/cards/<모델>.webp, cards/XDM-BLANK.webp(빈 슬롯 커버 합성), output/design/assets/frames/<모델>-front.webp
필요 패키지: Pillow
"""
import random
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps

CARD_WIDTH = 1200
FRAME_WIDTH = 1200
ROOT = Path(__file__).resolve().parents[2]


def faceplate_band(image):
    """판넬 금속면만 남긴다. 위로 튀어나온 기판 부품과 흰 배경을 제외한다."""
    rgba = image.convert('RGBA')
    background = Image.new('RGBA', rgba.size, (255, 255, 255, 0))
    mask = Image.eval(rgba.convert('L'), lambda v: 255 if v < 225 else 0)  # 흰 배경 제외
    alpha = rgba.getchannel('A').point(lambda v: 255 if v > 200 else 0)
    rgba = rgba.crop(Image.composite(mask, background.getchannel('A'), alpha).getbbox())  # 사물 영역 먼저 자르기
    width, height = rgba.size
    pixels = rgba.load()

    def solid(x, y):
        r, g, b, a = pixels[x, y]
        return a > 200 and min(r, g, b) < 225  # 투명·흰 배경이 아닌 부분

    step = max(1, width // 400)
    samples = range(0, width, step)
    coverage = [sum(solid(x, y) for x in samples) / len(samples) for y in range(height)]
    # 판넬 안의 얇은 밝은 줄에서 끊기지 않도록, 폭의 2%보다 짧은 틈은 이어서 한 덩어리로 본다.
    gap_limit = max(2, width // 50)
    bands, start, last = [], None, None
    for y, value in enumerate(coverage):
        if value > 0.85:
            if start is None or y - last > gap_limit:
                if start is not None:
                    bands.append((start, last + 1))
                start = y
            last = y
    if start is not None:
        bands.append((start, last + 1))
    best = max(bands, key=lambda band: band[1] - band[0])
    top, bottom = best
    rows = range(top, bottom, max(1, (bottom - top) // 12))
    columns = [x for x in range(width) if sum(solid(x, y) for y in rows) >= len(rows) * 0.5]
    left, right = min(columns), max(columns) + 1
    return rgba.crop((left, top, right, bottom))


def build_blank_plate():
    """실물 블랭크 커버 사진이 없어 WOS100 판넬의 나사 끝부분과 매끈한 금속면으로 빈 슬롯 커버를 합성한다."""
    source = Image.open(ROOT / 'output/design/assets/cards/XDM-WOS100.webp').convert('RGBA')
    width, height = source.size
    end_width, feather = 95, 20
    metal = source.crop((240, 0, 360, height)).convert('RGB')  # 1·2번 포트 사이의 빈 금속면
    pixels = metal.load()
    rows = [tuple(sum(pixels[x, y][c] for x in range(metal.width)) // metal.width for c in range(3)) for y in range(height)]
    random.seed(7)
    plate = Image.new('RGB', (width, height))
    target = plate.load()
    for y in range(height):
        for x in range(width):
            noise = random.randint(-4, 4)
            target[x, y] = tuple(max(0, min(255, value + noise)) for value in rows[y])
    plate = plate.filter(ImageFilter.GaussianBlur(0.6)).convert('RGBA')
    end = source.crop((0, 0, end_width, height))
    mask = Image.new('L', (end_width, height), 255)
    mask_pixels = mask.load()
    for x in range(end_width - feather, end_width):
        for y in range(height):
            mask_pixels[x, y] = int(255 * (end_width - x) / feather)
    plate.paste(end, (0, 0), mask)
    plate.paste(ImageOps.mirror(end), (width - end_width, 0), ImageOps.mirror(mask))
    return plate


def save_webp(image, target, width):
    target.parent.mkdir(parents=True, exist_ok=True)
    if image.width > width:
        image = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
    image.save(target, 'WEBP', quality=82, method=6)
    return image.size


def main(source):
    source = Path(source)
    for path in sorted(list((source / 'in').glob('*.png')) + list((source / 'out').glob('*.png'))):
        plate = faceplate_band(Image.open(path))
        size = save_webp(plate, ROOT / 'output/design/assets/cards' / f'{path.stem}.webp', CARD_WIDTH)
        print(f'card  {path.stem:12} {size[0]}x{size[1]}')
    size = save_webp(build_blank_plate(), ROOT / 'output/design/assets/cards/XDM-BLANK.webp', CARD_WIDTH)
    print(f'card  {"XDM-BLANK":12} {size[0]}x{size[1]} (합성)')
    # 나머지 프레임 사진은 매뉴얼 PDF에서 가져온다(extract_manual_frames.py). 사용자 제공 사진 중 정면·고해상도인 XDM-12만 쓴다.
    for path in sorted((source / 'frame').glob('XDM-12.png')):
        frame = Image.open(path).convert('RGBA')
        frame = frame.crop(frame.getchannel('A').getbbox())
        size = save_webp(frame, ROOT / 'output/design/assets/frames' / f'{path.stem.lower()}-front.webp', FRAME_WIDTH)
        print(f'frame {path.stem:12} {size[0]}x{size[1]}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
