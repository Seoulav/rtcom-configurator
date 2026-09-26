"""RTCom 종합 카탈로그 PDF(docs/*.pdf)에서 XDM 연동 전송기 사진을 꺼내 WebP로 저장한다.

사용법: python3 scripts/tools/extract_catalog_extenders.py   (필요 패키지: pymupdf, Pillow)
결과: output/design/assets/extenders/<모델>.webp (배경 투명)
사진은 (쪽 번호, 가로, 세로)로 찾는다. 카탈로그 판이 바뀌면 이 표를 다시 확인한다.
"""
import io
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / 'output/design/assets/extenders'
PHOTOS = {
    'xdm-ctr100': (10, 278, 180),
    'xdm-ctr100-pse': (10, 261, 142),
    'xdm-ct103': (11, 79, 179),
    'xdm-cr103': (11, 81, 173),
    'xdm-ft101': (12, 256, 167),
    'xdm-fr101': (12, 233, 153),
}


def main():
    document = pymupdf.open(next((ROOT / 'docs').glob('*.pdf')))
    TARGET.mkdir(parents=True, exist_ok=True)
    for name, (page, width, height) in PHOTOS.items():
        info = next((item for item in document[page - 1].get_images(full=True) if (item[2], item[3]) == (width, height)), None)
        if info is None:
            raise SystemExit(f'{page}쪽에서 {width}x{height} 사진을 찾지 못했습니다. 카탈로그 판을 확인하세요.')
        image = Image.open(io.BytesIO(document.extract_image(info[0])['image'])).convert('RGB')
        if info[1]:  # 투명 마스크(smask)
            image.putalpha(Image.open(io.BytesIO(document.extract_image(info[1])['image'])).convert('L'))
        image = image.crop(image.getchannel('A').getbbox()) if image.mode == 'RGBA' else image
        path = TARGET / f'{name}.webp'
        image.save(path, 'WEBP', quality=88, method=6)
        print(f'{name:16} p.{page:<3} {image.size[0]}x{image.size[1]} {path.stat().st_size // 1024}KB')


if __name__ == '__main__':
    main()
