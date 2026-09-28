#!/usr/bin/env python3
"""input_doc 자료 분류 도우미 (2026-09-28, docs/implementation/LOCAL_INPUT_DOC_WORKFLOW.md).

사용자가 로컬 input_doc/ 폴더에 넣은 자료를 읽어 제조사·모델·문서 종류를 추정하고,
정해진 이름 규칙으로 input_doc/<제조사>/<종류>/ 아래로 옮긴 뒤 input_doc/INDEX.md에 기록한다.

  python scripts/input_doc.py scan
      input_doc/ 맨 위의 새 자료를 읽어 추정 결과를 JSON으로 출력한다(파일은 옮기지 않음).
  python scripts/input_doc.py file "<파일>" --maker RTCOM --kind Manual --model HD-13U [--version Ver1.2] [--note "..."]
      파일을 input_doc/RTCOM/manual/RTcom_Manual_HD-13U_Ver1.2.pdf 로 옮기고 INDEX.md에 한 줄 남긴다.
      같은 이름이 있으면 덮어쓰지 않고 _2, _3을 붙인다. --dry-run이면 옮기지 않고 새 경로만 출력한다.

추정 결과는 참고용이다. Claude는 PDF 쪽 그림·사진을 직접 보고 최종 판단한다.
PDF 읽기에는 pypdf가 필요하다(pip install pypdf). 없으면 파일 이름만으로 추정한다.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = Path(os.environ.get("INPUT_DOC_DIR") or ROOT / "input_doc").resolve()
IGNORED = {"README.md", "INDEX.md", ".gitkeep", ".DS_Store", "Thumbs.db", "desktop.ini"}
# 종류별 하위 폴더. 파일 이름의 두 번째 칸에도 이 종류 이름을 그대로 쓴다(기존 .source-materials 규칙과 같음).
KINDS = {
    "Manual": "manual",
    "Catalog": "catalog",
    "ProductSheet": "sheet",
    "Drawing": "drawing",
    "Photo": "photo",
    "Other": "other",
}
# 폴더 이름(대문자)과 파일 이름 앞머리. RTCOM은 기존 원본 이름(RTcom_Manual_...)을 따른다.
PREFIX = {"RTCOM": "RTcom"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".tif", ".tiff"}


def known_models() -> list[str]:
    """제품 데이터와 구성기 카드 목록에서 모델명을 모은다(긴 이름부터 맞춰 보도록 정렬)."""
    models: set[str] = set()
    for file in (ROOT / "data" / "products").glob("*.json"):
        if file.name == "index.json":
            continue
        try:
            data = json.loads(file.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        for field in ("model", "productName"):
            for part in re.split(r"\s*/\s*|\s*\(\s*|\s*\)\s*", str(data.get(field, ""))):
                if re.fullmatch(r"[A-Z0-9][A-Z0-9-]{2,}", part.strip()):
                    models.add(part.strip())
        for alias in data.get("aliases", []) or []:
            models.add(str(alias))
    catalog = ROOT / "src" / "catalog.js"
    if catalog.exists():
        models.update(re.findall(r"'((?:XDM|SPX|VDM)-[A-Z0-9-]+)'", catalog.read_text(encoding="utf-8")))
    return sorted(models, key=len, reverse=True)


def pdf_text(path: Path, pages: int = 3) -> tuple[str, dict, int]:
    try:
        from pypdf import PdfReader  # type: ignore
    except ImportError:
        return "", {"warning": "pypdf 없음: pip install pypdf"}, 0
    try:
        reader = PdfReader(str(path))
        meta = {k.lstrip("/"): str(v) for k, v in (reader.metadata or {}).items() if k in ("/Title", "/Author", "/Creator", "/ModDate")}
        text = "\n".join((reader.pages[i].extract_text() or "") for i in range(min(pages, len(reader.pages))))
        return text, meta, len(reader.pages)
    except Exception as error:  # 손상·암호 PDF도 목록에는 남긴다
        return "", {"warning": f"PDF 읽기 실패: {error}"}, 0


def guess(path: Path, models: list[str]) -> dict:
    ext = path.suffix.lower()
    text, meta, page_count = pdf_text(path) if ext == ".pdf" else ("", {}, 0)
    haystack = f"{path.stem}\n{meta.get('Title', '')}\n{text}".upper().replace("_", "-")
    found = [m for m in models if re.search(rf"(?<![A-Z0-9-]){re.escape(m)}(?![A-Z0-9-])", haystack)]
    # 긴 이름에 포함된 짧은 이름(예: XDM-CT103 안의 CT103)은 뺀다.
    found = [m for m in found if not any(m != other and m in other for other in found)]
    lower = f"{path.stem} {meta.get('Title', '')} {text[:800]}".lower()
    if ext in IMAGE_EXT:
        kind = "Photo"
    elif re.search(r"매뉴얼|manual|user'?s guide|사용\s*설명서", lower):
        kind = "Manual"
    elif re.search(r"카탈로그|catalog|catalogue", lower):
        kind = "Catalog"
    elif re.search(r"제품\s*시트|제품\s*안내|product\s*sheet|datasheet|data sheet", lower):
        kind = "ProductSheet"
    elif re.search(r"assy|도면|drawing|dwg", lower):
        kind = "Drawing"
    else:
        kind = "Other"
    maker = "RTCOM" if re.search(r"rtcom|알티컴|right technology", lower) or found else ""
    version = ""
    # 판 번호는 본문이 아니라 파일 이름·PDF 제목에서만 찾는다(본문의 "HDMI v2.0" 같은 규격 표기를 판 번호로 읽지 않도록).
    match = re.search(r"ver(?:sion)?\.?\s*(\d+(?:\.\d+)+)|(?<![A-Z])(KV\.?\s*\d+(?:\.\d+)?)", f"{path.stem} {meta.get('Title', '')}", re.I)
    if match:
        version = f"Ver{match.group(1)}" if match.group(1) else match.group(2).replace(" ", "").replace(".", "")
    return {
        "file": str(path.relative_to(INPUT)),
        "size": path.stat().st_size,
        "pages": page_count,
        "meta": meta,
        "guess": {"maker": maker, "kind": kind, "models": found[:6], "version": version},
        "textPreview": re.sub(r"\s+", " ", text)[:600],
    }


def sha16(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()[:16]


def archived() -> dict[str, str]:
    """INDEX.md에 기록된 sha256 앞 16자리 → 보관 위치. 같은 파일이 이름만 바꿔 다시 들어왔는지 확인할 때 쓴다."""
    index = INPUT / "INDEX.md"
    found: dict[str, str] = {}
    if index.exists():
        for line in index.read_text(encoding="utf-8").splitlines():
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 8 and re.fullmatch(r"[0-9a-f]{16}", cells[7]) and not cells[2].startswith("_duplicates/"):
                found.setdefault(cells[7], cells[2])
    return found


def scan() -> int:
    if not INPUT.exists():
        print(json.dumps({"inputDoc": str(INPUT), "files": [], "note": "input_doc 폴더 없음"}, ensure_ascii=False, indent=1))
        return 0
    models = known_models()
    files = [p for p in sorted(INPUT.iterdir()) if p.is_file() and p.name not in IGNORED and not p.name.startswith("~$")]
    done = archived()
    results = []
    for p in files:
        item = guess(p, models)
        item["sha256"] = sha16(p)
        if item["sha256"] in done:
            item["duplicateOf"] = done[item["sha256"]]
        results.append(item)
    print(json.dumps({"inputDoc": str(INPUT), "files": results}, ensure_ascii=False, indent=1))
    return 0


def safe_part(value: str) -> str:
    value = re.sub(r"[\\/:*?\"<>|\s]+", "-", value.strip())
    return re.sub(r"-{2,}", "-", value).strip("-.")


def target_for(src: Path, maker: str, kind: str, model: str, version: str, suffix: str) -> Path:
    maker_dir = safe_part(maker).upper()
    parts = [PREFIX.get(maker_dir, safe_part(maker)), kind, safe_part(model)]
    if version:
        parts.append(safe_part(version))
    if suffix:
        parts.append(safe_part(suffix))
    folder = INPUT / maker_dir / KINDS[kind]
    base = "_".join(parts)
    ext = src.suffix.lower()
    candidate = folder / f"{base}{ext}"
    n = 2
    while candidate.exists() and candidate.resolve() != src.resolve():
        candidate = folder / f"{base}_{n}{ext}"
        n += 1
    return candidate


def file_one(args: argparse.Namespace) -> int:
    src = Path(args.path)
    if not src.is_absolute():
        src = (INPUT / src) if (INPUT / src).exists() else src.resolve()
    src = src.resolve()
    if not src.is_file():
        print(f"파일 없음: {args.path}", file=sys.stderr)
        return 1
    if INPUT not in src.parents:
        print(f"input_doc 밖의 파일은 옮기지 않습니다: {src}", file=sys.stderr)
        return 1
    if args.kind not in KINDS:
        print(f"--kind는 {', '.join(KINDS)} 중 하나", file=sys.stderr)
        return 1
    digest = sha16(src)
    duplicate = archived().get(digest)
    if duplicate:
        # 내용이 같은 파일이 이미 보관돼 있으면 새로 보관하지 않고 _duplicates/로 옮겨 둔다(지우지 않음).
        dest = INPUT / "_duplicates" / src.name
        n = 2
        while dest.exists():
            dest = INPUT / "_duplicates" / f"{src.stem}_{n}{src.suffix}"
            n += 1
        args.note = f"이미 보관됨: {duplicate}" + (f" · {args.note}" if args.note else "")
    else:
        dest = target_for(src, args.maker, args.kind, args.model, args.version or "", args.suffix or "")
    rel = dest.relative_to(INPUT).as_posix()
    if args.dry_run:
        print(rel)
        return 0
    dest.parent.mkdir(parents=True, exist_ok=True)
    original = src.relative_to(INPUT).as_posix()
    shutil.move(str(src), str(dest))
    index = INPUT / "INDEX.md"
    if not index.exists():
        index.write_text("# input_doc 분류 기록\n\n| 날짜 | 원래 이름 | 새 위치 | 제조사 | 종류 | 모델 | 버전 | sha256(앞 16자리) | 메모 |\n|---|---|---|---|---|---|---|---|---|\n", encoding="utf-8")
    row = [dt.date.today().isoformat(), original, rel, args.maker.upper(), args.kind, args.model, args.version or "", digest, (args.note or "").replace("|", "/")]
    with index.open("a", encoding="utf-8") as handle:
        handle.write("| " + " | ".join(row) + " |\n")
    print(f"{rel}  (중복: {duplicate})" if duplicate else rel)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("scan", help="새 자료를 읽어 추정 결과를 JSON으로 출력")
    one = sub.add_parser("file", help="자료 하나를 규칙 이름으로 제조사 폴더에 옮김")
    one.add_argument("path")
    one.add_argument("--maker", required=True, help="제조사 폴더 이름(예: RTCOM)")
    one.add_argument("--kind", required=True, help="|".join(KINDS))
    one.add_argument("--model", required=True, help="대표 모델명(예: HD-13U, XDM-CT103-CR103)")
    one.add_argument("--version", help="판 표기(예: Ver1.2, KV01)")
    one.add_argument("--suffix", help="사진 면 등 추가 구분(예: Tx-Front)")
    one.add_argument("--note", help="INDEX.md 메모")
    one.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    return scan() if args.command == "scan" else file_one(args)


if __name__ == "__main__":
    sys.exit(main())
