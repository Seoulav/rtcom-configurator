"""XDM 입력 카드 6종(HI100·HIS100·DPI100·CIS100·FIS100·SIS100) 판넬 사진 가로 위치 맞추기 (0.138.0).

사용자 요청(2026-09-29): "xdm입력카드 좀 더 가로폭 맞춰줘". 카탈로그 사진마다 포트·5핀 커넥터가 몇 픽셀씩 다른 위치에 찍혀 있어,
구성기 03 카드 슬롯에서 세로로 쌓으면 가로 줄이 어긋나 보인다. 5핀 커넥터(초록색)의 가로 분포를 기준 카드(HI100)와 맞추는
가로 방향 이동·늘이기(x' = a·x + b)를 카드마다 구하고, 판넬 좌우 끝과 5핀 커넥터 첫·마지막 열을 기준 카드와 같은 위치로 구간별로 늘여 적용한다. 세로는 건드리지 않고, 포트 모양은 그대로다.
원본은 git 기록에 있다(재실행하면 이미 맞춰진 카드는 거의 변하지 않는다).
필요 패키지: pillow, numpy
사용법: python3 scripts/tools/align_xdm_input_cards.py [--dry]
"""
import sys
import numpy as np
from PIL import Image

DIR = 'output/design/assets/cards/'
REF = 'XDM-HI100'
CARDS = ['XDM-HI100', 'XDM-HIS100', 'XDM-DPI100', 'XDM-CIS100', 'XDM-FIS100', 'XDM-SIS100']


def profile(name):
    a = np.array(Image.open(DIR + name + '.webp').convert('RGB')).astype(float)
    g = a[:, :, 1] - (a[:, :, 0] + a[:, :, 2]) / 2
    g = np.clip(g - 10, 0, None)
    h = g.shape[0]
    p = g[int(h * .25):int(h * .9)].sum(axis=0)
    p[:200] = 0
    p[1120:] = 0
    k = np.ones(9) / 9
    return np.convolve(p, k, mode='same')


def best_affine(ref, cur):
    xs = np.arange(len(ref))
    best = (1.0, 0.0, -1)
    for a in np.arange(0.985, 1.0151, 0.001):
        for b in np.arange(-14, 14.1, 0.5):
            # cur를 x' = a*x + b 로 옮긴 프로필: x' 위치의 값 = cur[(x'-b)/a]
            src = (xs - b) / a
            ok = (src >= 0) & (src <= len(cur) - 1)
            moved = np.interp(src[ok], xs, cur)
            score = float(np.dot(moved, ref[ok]) / (np.linalg.norm(moved) * np.linalg.norm(ref[ok]) + 1e-9))
            if score > best[2]:
                best = (float(a), float(b), score)
    return best


def extent(name):
    """판넬(불투명 부분)의 왼쪽·오른쪽 끝 x."""
    al = np.array(Image.open(DIR + name + '.webp').convert('RGBA'))[:, :, 3]
    cols = np.where((al > 128).mean(axis=0) > 0.5)[0]
    return float(cols.min()), float(cols.max())


def warp(name, a, b, ref_ext, ref_inner):
    """왼쪽 끝·5핀 커넥터 첫 열·마지막 열·오른쪽 끝 4점을 기준 카드의 같은 점에 맞추는 가로 구간별 늘이기(세로는 그대로)."""
    im = Image.open(DIR + name + '.webp').convert('RGBA')
    w, h = im.size
    l, r = extent(name)
    # 기준 카드의 5핀 좌우 끝(ref_inner)을 이 카드 좌표로 옮긴 값: x_card = (x_ref - b) / a
    src = [l, (ref_inner[0] - b) / a, (ref_inner[1] - b) / a, r]
    dst = [ref_ext[0], ref_inner[0], ref_inner[1], ref_ext[1]]
    xs = np.arange(w, dtype=float)
    # 출력 x에서 가져올 원본 x (구간 밖은 양 끝 기울기로 연장)
    sx = np.interp(xs, dst, src)
    sx[xs < dst[0]] = src[0] + (xs[xs < dst[0]] - dst[0])
    sx[xs > dst[-1]] = src[-1] + (xs[xs > dst[-1]] - dst[-1])
    sx = np.clip(sx, 0, w - 1)
    arr = np.array(im).astype(float)
    alpha = arr[:, :, 3:4] / 255.0
    pm = np.concatenate([arr[:, :, :3] * alpha, arr[:, :, 3:4]], axis=2)  # 알파 곱한 값으로 섞어 가장자리 색 번짐 방지
    i0 = np.floor(sx).astype(int)
    i1 = np.minimum(i0 + 1, w - 1)
    t = (sx - i0)[None, :, None]
    o = pm[:, i0, :] * (1 - t) + pm[:, i1, :] * t
    a_out = o[:, :, 3:4]
    rgb = np.where(a_out > 0, o[:, :, :3] / np.maximum(a_out / 255.0, 1e-6), 0)
    return Image.fromarray(np.clip(np.concatenate([rgb, a_out], axis=2), 0, 255).astype(np.uint8), 'RGBA')


if __name__ == '__main__':
    dry = '--dry' in sys.argv
    ref = profile(REF)
    ref_ext = extent(REF)
    ref_inner = (238.0, 1090.0)  # 기준 카드(HI100) 5핀 커넥터 첫 열 왼쪽·마지막 열 오른쪽(눈으로 잰 값, 프로필 맞춤 기준점)
    for name in CARDS:
        if name == REF:
            continue
        a, b, score = best_affine(ref, profile(name))
        print(f'{name}: 배율 {a:.3f}, 이동 {b:+.1f}px, 일치도 {score:.3f}')
        if not dry:
            warp(name, a, b, ref_ext, ref_inner).save(DIR + name + '.webp', 'WEBP', quality=92, method=6)
