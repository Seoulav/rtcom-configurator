"""알티컴 홈페이지 VDM EXTENDER 게시판의 전송기 사진을 구성기용 WebP(배경 투명)로 만든다.

원본: http://rtcomav.com/kor/bbs/board.php?bo_table=vdm_extender (wr_id 12~15)의 제품 사진
  /kor/images/vdm-ct104-u.jpg, vdm-cr104-u.jpg, vdm-ft101-u.jpg, fr101-u.jpg
원본은 .source-materials/vdm-extenders/에 두고 저장소에는 넣지 않는다.
사용법: python3 scripts/tools/prepare_vdm_extenders.py [원본 폴더]
결과: output/design/assets/extenders/vdm-<모델>.webp
필요 패키지: Pillow, numpy, scipy
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / 'output/design/assets/extenders'
SOURCES = {
    'vdm-ct104-u': 'vdm-ct104-u.jpg',
    'vdm-cr104-u': 'vdm-cr104-u.jpg',
    'vdm-ft101-u': 'vdm-ft101-u.jpg',
    'vdm-fr101-u': 'vdm-fr101-u.jpg',
}


def cut_background(image, tolerance=10):
    """테두리와 이어진 밝은 회색 배경(약 RGB 242)을 투명하게 하고 제품 영역만 남긴다."""
    rgb = np.asarray(image.convert('RGB')).astype(int)
    background = rgb[0, 0]
    near = (np.abs(rgb - background).max(axis=2) <= tolerance)
    labels, _ = ndimage.label(near)
    border = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    mask = np.isin(labels, list(border))
    rgba = np.dstack([rgb.astype('uint8'), np.where(mask, 0, 255).astype('uint8')])
    ys, xs = np.where(~mask)
    return Image.fromarray(rgba, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def main(source):
    source = Path(source)
    TARGET.mkdir(parents=True, exist_ok=True)
    for name, file in SOURCES.items():
        image = cut_background(Image.open(source / file))
        if image.width > 480:
            image = image.resize((480, round(image.height * 480 / image.width)), Image.LANCZOS)
        path = TARGET / f'{name}.webp'
        image.save(path, 'WEBP', quality=88, method=6)
        print(f'{name:14} {image.size[0]}x{image.size[1]} {path.stat().st_size // 1024}KB')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else ROOT / '.source-materials/vdm-extenders')
