"""제품별 카탈로그 PDF 만들기 (0.97.0).

사용자 결정(2026-09-28, 질문 응답 "제품별로 잘라 공개"): 공개 중인 전체 카탈로그 46쪽판
output/design/assets/docs/rtcom-catalog-2026.pdf에서 제품마다 data/products/<id>.json의
catalogPages 쪽만 뽑아 output/design/assets/docs/<id>-catalog.pdf로 저장한다.
쪽 내용은 바꾸지 않고 그대로 복사한다(텍스트·이미지 재압축 없음).

사용법: python3 scripts/tools/split_catalog_by_product.py [--check]
  --check  파일을 쓰지 않고, 이미 있는 제품별 PDF의 쪽 수·쪽 내용이 원본과 같은지만 확인한다.
필요 패키지: pymupdf (pip install pymupdf)
"""
import glob
import json
import os
import re
import sys

import pymupdf

SOURCE = 'output/design/assets/docs/rtcom-catalog-2026.pdf'
OUT_DIR = 'output/design/assets/docs'
# catalogPages가 다른 제품 쪽까지 묶고 있는 경우, "해당 제품만 보이게"(사용자 요청 2026-09-28) 범위를 좁힌다.
#  - xdm: 4~12쪽 중 10~12쪽은 XDM 전송기(CTR100·CT103·FT101) 쪽이다. 전송기는 각자 제품별 PDF가 있으므로 메인프레임·카드 4~9쪽만 쓴다.
#  - spx-rx-tx: 15쪽은 SPX 메인프레임 사양 쪽이고 SPX-TX/RX 사양은 16쪽이다(기존 카탈로그 버튼도 16쪽을 열었다).
PAGE_OVERRIDES = {'xdm': '4-9', 'spx-rx-tx': '16'}


def page_range(text):
    """'4–12', '13-16', '21' 형태를 [4, ..., 12]로 바꾼다."""
    parts = [int(p) for p in re.split(r'\s*[–-]\s*', str(text).strip()) if p]
    return list(range(parts[0], parts[-1] + 1)) if parts else []


def targets():
    for path in sorted(glob.glob('data/products/*.json')):
        if path.endswith('index.json'):
            continue
        item = json.load(open(path, encoding='utf-8'))
        pages = page_range(PAGE_OVERRIDES.get(item['id']) or item.get('catalogPages') or '')
        if pages:
            yield item['id'], item.get('model') or item['id'], pages


def main():
    check = '--check' in sys.argv
    src = pymupdf.open(SOURCE)
    bad = 0
    for pid, model, pages in targets():
        out = os.path.join(OUT_DIR, f'{pid}-catalog.pdf')
        if check:
            if not os.path.exists(out):
                print('MISSING', out); bad += 1; continue
            doc = pymupdf.open(out)
            same = doc.page_count == len(pages) and all(doc[i].get_text() == src[p - 1].get_text() for i, p in enumerate(pages))
            print('OK' if same else 'DIFF', out, pages[0], pages[-1]); bad += 0 if same else 1
            continue
        doc = pymupdf.open()
        doc.insert_pdf(src, from_page=pages[0] - 1, to_page=pages[-1] - 1)
        span = f'{pages[0]}' if len(pages) == 1 else f'{pages[0]}~{pages[-1]}'
        doc.set_metadata({'title': f'RTCOM {model} · 알티컴 종합 카탈로그 2026 {span}쪽', 'author': 'RTCOM', 'subject': 'rtcom-catalog-2026.pdf 발췌'})
        doc.save(out, garbage=3, deflate=True)
        print('WROTE', out, span, f'{os.path.getsize(out) // 1024}KB')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
