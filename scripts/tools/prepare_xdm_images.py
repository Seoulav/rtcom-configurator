"""XDM 카드 판넬·프레임 원본 사진을 웹용 WebP로 가공한다.

원본은 저장소에 넣지 않는다(.source-materials/는 .gitignore 대상).
사용법: python3 scripts/tools/prepare_xdm_images.py <원본 폴더>
  <원본 폴더>/in/*.png, out/*.png  : 카드 후면 판넬 사진 (파일 이름 = 카드 모델명)
  <원본 폴더>/frame/XDM-12.png ... : 프레임 전면 사진
결과: output/design/assets/cards/<모델>.webp, output/design/assets/frames/<모델>-front.webp
필요 패키지: Pillow
"""
import sys
from pathlib import Path
from PIL import Image

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
    for path in sorted((source / 'frame').glob('*.png')):
        frame = Image.open(path).convert('RGBA')
        frame = frame.crop(frame.getchannel('A').getbbox())
        size = save_webp(frame, ROOT / 'output/design/assets/frames' / f'{path.stem.lower()}-front.webp', FRAME_WIDTH)
        print(f'frame {path.stem:12} {size[0]}x{size[1]}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
