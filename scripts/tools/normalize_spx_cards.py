"""SPX 카드 판넬 사진 좌우 간격 통일 (0.137.0).

사용자 요청(2026-09-29): "SPX-HOS10, HOS12, COS12 좌우 간격 동일하게 수정해".
카탈로그 사진마다 나사·귀 크기와 포트 앞뒤 여백이 달라, 카드 선택 팝업에서 포트 묶음이 왼쪽·오른쪽으로 다르게 치우쳐 보였다.
카드마다 포트 묶음(포트 첫 줄~마지막 줄)만 잘라, 모두 같은 크기(1240x88)의 판넬 한가운데(좌우 여백 같음)에 붙이고
양쪽 끝에는 같은 크기의 나사를 그린다. 포트 사진은 그대로 옮겨 붙이므로 포트 모양·개수는 원본과 같다.
원본 사진은 output/design/assets/cards/originals/에 보관하지 않는다(git 기록에 있음). 다시 만들려면 git에서 원본을 되살린 뒤 실행한다.
필요 패키지: pillow, numpy
사용법: python3 scripts/tools/normalize_spx_cards.py
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DIR = 'output/design/assets/cards/'
W, H = 1240, 88
# 카드별 포트 묶음 상자(원본 픽셀 좌표 x0, x1, y0, y1)와 패딩. 밝기·초록 커넥터 기준으로 잰 값.
PORTS = {
    'SPX-HIS8': (92, 1084, 37, 61),
    'SPX-HOS10': (117, 1110, 36, 65),
    'SPX-HOS12': (118, 1130, 35, 64),
    'SPX-COS12': (91, 1105, 8, 64),
}
PADX, PADY = 12, 10
SCREW_X = 34  # 나사 중심 x(양쪽 대칭)


def screw(size=34):
    s = size * 4
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i in range(s // 2, 0, -1):
        t = i / (s / 2)
        v = int(120 + 110 * (1 - t))
        d.ellipse([s / 2 - i, s / 2 - i, s / 2 + i, s / 2 + i], fill=(v, v, v + 4, 255))
    d.ellipse([s * 0.18, s * 0.18, s * 0.82, s * 0.82], outline=(70, 72, 76, 255), width=s // 22)
    d.rectangle([s * 0.28, s * 0.47, s * 0.72, s * 0.53], fill=(60, 62, 66, 255))
    d.rectangle([s * 0.47, s * 0.28, s * 0.53, s * 0.72], fill=(60, 62, 66, 255))
    return img.resize((size, size), Image.LANCZOS)


def build(name):
    src = Image.open(DIR + name + '.webp').convert('RGB')
    arr = np.array(src).astype(int)
    x0, x1, y0, y1 = PORTS[name]
    box = (x0 - PADX, max(0, y0 - PADY), x1 + PADX, min(src.height, y1 + PADY))
    crop = src.crop(box)
    c = np.array(crop).astype(int)
    edge = np.concatenate([c[0], c[-1], c[:, 0], c[:, -1]])
    bg = tuple(int(v) for v in np.median(edge, axis=0))
    out = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(out)
    d.rectangle([0, 0, W - 1, H - 1], outline=tuple(min(255, v + 22) for v in bg), width=2)
    # 포트 묶음을 가운데에: 왼쪽 여백 = 오른쪽 여백
    px = (W - crop.width) // 2
    py = (H - crop.height) // 2
    mask = Image.new('L', crop.size, 255)
    md = ImageDraw.Draw(mask)
    f = 8
    for i in range(f):
        v = int(255 * i / f)
        md.rectangle([i, i, crop.width - 1 - i, crop.height - 1 - i], outline=v)
    out.paste(crop, (px, py), mask.filter(ImageFilter.GaussianBlur(1)))
    sc = screw()
    for cx in (SCREW_X, W - SCREW_X):
        out.paste(sc, (cx - sc.width // 2, H // 2 - sc.height // 2), sc)
    return out, (px, W - px - crop.width)


def blank():
    out = Image.new('RGB', (W, H), (16, 25, 31))
    d = ImageDraw.Draw(out)
    d.rectangle([0, 0, W - 1, H - 1], outline=(38, 47, 53), width=2)
    sc = screw()
    for cx in (SCREW_X, W - SCREW_X):
        out.paste(sc, (cx - sc.width // 2, H // 2 - sc.height // 2), sc)
    return out


if __name__ == '__main__':
    for name in PORTS:
        img, margins = build(name)
        img.save(DIR + name + '.webp', 'WEBP', quality=92, method=6)
        print(name, img.size, '좌·우 여백', margins)
    blank().save(DIR + 'SPX-BLANK.webp', 'WEBP', quality=92, method=6)
    print('SPX-BLANK', (W, H))
