"""XDM·VDM 카드 판넬 사진의 가로:세로 비율을 제품군 안에서 똑같이 맞춘다 (0.137.0).

사용자 요청(2026-09-29): "다른 제품군 모든 입출력 슬롯 크기 맞춰". 폭은 그대로 두고 높이만 제품군 기준 비율(XDM 9.8:1, VDM 5.7:1)에
맞게 세로로 최대 3.5% 늘이거나 줄인다. SPX는 scripts/tools/normalize_spx_cards.py(1240x88)가 따로 맞춘다.
사용법: python3 scripts/tools/normalize_card_ratios.py
"""
import glob
from PIL import Image

RATIO = {'XDM': 9.8, 'VDM': 5.7}
for path in sorted(glob.glob('output/design/assets/cards/*.webp')):
    name = path.split('/')[-1][:-5]
    fam = name.split('-')[0] if name.split('-')[0] in RATIO else ('VDM' if name.split('-')[0] in {'CIS4', 'COS4', 'FIS4', 'FOS4', 'HIS4', 'HOS4', 'HOS4S', 'QOS4S', 'SIS4', 'SOS4'} else None)
    if not fam:
        continue
    im = Image.open(path)
    h = round(im.width / RATIO[fam])
    if h == im.height:
        continue
    im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB').resize((im.width, h), Image.LANCZOS).save(path, 'WEBP', quality=92, method=6)
    print(name, im.size, '->', (im.width, h))
