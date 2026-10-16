#!/usr/bin/env python3
"""알티컴 매뉴얼 DOCX를 공개용 PDF로 바꾼다(0.215, 사용자 결정 2026-10-14 "제가 PDF로 변환").

사용법:
  python3 scripts/tools/docx_manual_to_pdf.py <입력.docx> <출력.pdf> "<문서 제목>" --fonts <글꼴 폴더> [--work <작업 폴더>]

순서(근거·결과는 docs/implementation/MANUALS_DOCX_0.215.md):
1. DOCX 복사본에서 Word가 넣은 Noto Sans KR 내장 글꼴 참조를 지운다. 내장본은 쓰인 글자만 남긴 가변 글꼴이라
   LibreOffice가 가장 가는 굵기(Thin)로 그리고 없는 글자는 상자(☒)로 나온다.
2. Word가 마지막으로 나눈 쪽 위치(lastRenderedPageBreak)를 실제 쪽 나눔으로 바꾼다. LibreOffice는 Word보다 줄을
   조금 촘촘히 그려 쪽 나눔이 밀리므로, Word와 같은 쪽 구성을 고정한다. 표 안 위치, 바로 앞에 쪽·구역 나눔이 있어
   글이 없는 위치는 건너뛴다. "목차" 단락 앞에 글이 있으면 쪽 나눔을 넣는다(Word가 위치를 남기지 않는 쪽).
3. LibreOffice(soffice --headless)로 PDF를 만든다. --fonts 폴더에는 Google Fonts에서 받은 Noto Sans KR
   400·500·700·800 TTF를 Word 문서가 부르는 이름("Noto Sans KR", "Noto Sans KR Medium", "Noto Sans KR ExtraBold")으로
   바꿔 둔다(OFL 글꼴, 저장소에는 넣지 않음).
4. PDF 속성에서 제목만 남기고 작성자·만든 프로그램·변환 프로그램·날짜·XMP를 지운다(PyMuPDF).
"""
import argparse
import os
import re
import shutil
import subprocess
import tempfile
import zipfile


def strip_noto_embeds(src, dst):
    zin = zipfile.ZipFile(src)
    font_table = zin.read('word/fontTable.xml').decode('utf8')

    def fix(match):
        block = match.group(0)
        if 'Noto Sans KR' in block:
            block = re.sub(r'<w:embed(Regular|Bold|Italic|BoldItalic)\b[^>]*/>', '', block)
        return block

    font_table = re.sub(r'<w:font\b.*?</w:font>', fix, font_table, flags=re.S)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = font_table.encode('utf8') if item.filename == 'word/fontTable.xml' else zin.read(item.filename)
            zout.writestr(item, data)


def pin_word_pages(src, dst):
    zin = zipfile.ZipFile(src)
    xml = zin.read('word/document.xml').decode('utf8')
    has_text = lambda part: re.search(r'<w:t[ >][^<]*\S', part)
    toc = re.search(r'(<w:p(?:\s[^>]*)?>)((?:(?!</w:p>).)*?<w:t[^>]*>목차</w:t>)', xml, re.S)
    if toc:
        start = max(xml.rfind('<w:br w:type="page"/>', 0, toc.start()), xml.rfind('<w:sectPr', 0, toc.start()), 0)
        if has_text(xml[start:toc.start()]):
            ppr = re.match(r'\s*<w:pPr>.*?</w:pPr>', toc.group(2), re.S)
            cut = toc.start(2) + (ppr.end() if ppr else 0)
            xml = xml[:cut] + '<w:r><w:br w:type="page"/></w:r>' + xml[cut:]
    tables = [(m.start(), m.end()) for m in re.finditer(r'<w:tbl>.*?</w:tbl>', xml, re.S)]
    in_table = lambda pos: any(a <= pos < b for a, b in tables)
    parts, last, prev_break, made = [], 0, 0, 0
    pattern = r'<w:lastRenderedPageBreak/>|<w:br w:type="page"/>|<w:pPr>(?:(?!</w:pPr>).)*?<w:sectPr'
    for match in re.finditer(pattern, xml, re.S):
        if not match.group(0).startswith('<w:last'):
            prev_break = match.end()
            continue
        if in_table(match.start()) or not has_text(xml[prev_break:match.start()]):
            continue
        parts += [xml[last:match.start()], '<w:br w:type="page"/>']
        last = prev_break = match.end()
        made += 1
    parts.append(xml[last:])
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = ''.join(parts).encode('utf8') if item.filename == 'word/document.xml' else zin.read(item.filename)
            zout.writestr(item, data)
    return made


def convert(docx, out_dir, fonts, work):
    home = os.path.join(work, 'lohome')
    os.makedirs(home, exist_ok=True)
    conf = os.path.join(work, 'fonts.conf')
    with open(conf, 'w', encoding='utf8') as handle:
        handle.write('<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig>\n'
                     '  <include ignore_missing="yes">/etc/fonts/fonts.conf</include>\n'
                     f'  <dir>{os.path.abspath(fonts)}</dir>\n</fontconfig>\n')
    env = dict(os.environ, HOME=home, FONTCONFIG_FILE=conf)
    subprocess.run(['soffice', '--headless', '--norestore', '--convert-to', 'pdf', '--outdir', out_dir, docx],
                   env=env, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=600)
    return os.path.join(out_dir, os.path.splitext(os.path.basename(docx))[0] + '.pdf')


def clean_metadata(src, dst, title):
    import pymupdf
    doc = pymupdf.open(src)
    doc.set_metadata({'title': title, 'author': '', 'subject': '', 'keywords': '', 'creator': '',
                      'producer': '', 'creationDate': '', 'modDate': ''})
    doc.del_xml_metadata()
    doc.save(dst, garbage=4, deflate=True, clean=True)
    return pymupdf.open(dst).page_count


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('docx')
    parser.add_argument('pdf')
    parser.add_argument('title')
    parser.add_argument('--fonts', required=True, help='이름을 맞춘 Noto Sans KR TTF 폴더')
    parser.add_argument('--work', help='작업 폴더(기본: 임시 폴더)')
    args = parser.parse_args()
    work = args.work or tempfile.mkdtemp(prefix='docx2pdf-')
    os.makedirs(work, exist_ok=True)
    stem = os.path.splitext(os.path.basename(args.pdf))[0]
    stripped = os.path.join(work, stem + '-fonts.docx')
    pinned = os.path.join(work, stem + '.docx')
    strip_noto_embeds(args.docx, stripped)
    made = pin_word_pages(stripped, pinned)
    raw = convert(pinned, work, args.fonts, work)
    pages = clean_metadata(raw, args.pdf, args.title)
    print(f'{args.pdf}: {pages}쪽, 쪽 나눔 고정 {made}곳')
    if not args.work:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == '__main__':
    main()
