"""제품 문서 PDF 쪽을 팝업 미리보기용 WebP로 그린다(0.113, 사용자 결정 2026-09-28 "카탈로그는 이미지 방식").

data/products/*.json 의 documents 가운데 "preview": "image" 인 문서마다
output/design/assets/docs/<file> 의 쪽을 200dpi로 그려 output/design/assets/products/<file 이름>-p<N>.webp 로 저장하고,
그 파일 이름 목록을 documents[].previewImages 에 적는다. 카탈로그 원본이 바뀌어 split_catalog_by_product.py 로
제품별 PDF를 다시 만들었다면 이 스크립트도 다시 실행한다.

필요: pip install pymupdf pillow
사용: python scripts/tools/render_doc_previews.py
"""
import json, pathlib, io
import pymupdf
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
DOCS = ROOT / 'output/design/assets/docs'
OUT = ROOT / 'output/design/assets/products'
DPI, QUALITY = 200, 80

for path in sorted((ROOT / 'data/products').glob('*.json')):
    if path.name == 'index.json':
        continue
    product = json.loads(path.read_text(encoding='utf-8'))
    changed = False
    for doc in product.get('documents', []):
        if doc.get('preview') != 'image' or not doc.get('file'):
            continue
        pdf = pymupdf.open(DOCS / doc['file'])
        stem = doc['file'].rsplit('.', 1)[0]
        names = []
        for n, page in enumerate(pdf, 1):
            pix = page.get_pixmap(dpi=DPI)
            img = Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')
            name = f'{stem}-p{n}.webp'
            img.save(OUT / name, quality=QUALITY, method=6)
            names.append(name)
            print(f'{name} {img.width}x{img.height} {(OUT / name).stat().st_size // 1024}KB')
        if doc.get('previewImages') != names:
            doc['previewImages'] = names
            changed = True
    if changed:
        path.write_text(json.dumps(product, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print('updated', path.name)
