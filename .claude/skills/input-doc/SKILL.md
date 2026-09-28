---
name: input-doc
description: 로컬 input_doc/ 폴더에 사용자가 넣은 자료(매뉴얼·카탈로그·제품 안내서·도면·사진 PDF/이미지)를 읽어 제조사 폴더로 분류하고, 규칙 이름으로 바꾸고, 필요한 곳(제품 사진·제품 데이터·공개 PDF)에 반영한다. 세션 시작 알림에 input_doc 새 자료가 보이거나, 사용자가 "input_doc 정리", "자료 넣었어", "폴더에 넣어놨어"라고 하면 사용한다.
---

# input_doc 자료 정리

사용자 지시(2026-09-28): "내가 로컬폴더에 자료를 넣어두면 네가 읽어서 제목을 바꾸고 경로를 옮겨서 알아서 작업하도록 해. 폴더는 root에 input_doc … 제조사 폴더를 만들어서 분류하고, 내용을 읽어서 제목을 바꾸고, 필요하면 네가 경로를 변경해서 이동시켜서 작업을 해."

`input_doc/`는 Git에 올라가지 않는 로컬 전용 보관함입니다(`.gitignore`). 이 폴더의 파일은 사용자가 직접 넣은 자료이므로, 분류·이름 변경·이동은 묻지 않고 진행합니다. 다만 **공개 저장소에 PDF를 올리는 일은 되돌릴 수 없으므로** 아래 5단계의 확인을 거칩니다.

## 1. 새 자료 확인

```bash
python scripts/input_doc.py scan      # Windows에서 python이 없으면 py scripts\input_doc.py scan
```

- 결과 JSON의 `guess`(제조사·종류·모델·판 번호)는 파일 이름과 PDF 앞 3쪽 글자로 추정한 값입니다. 그대로 믿지 말고 확인합니다.
- `duplicateOf`가 있으면 이미 보관된 파일과 내용이 같습니다. 6단계 기록에 "중복"으로 적고 반영 작업은 하지 않습니다.
- PDF는 Read 도구로 표지·사양표 쪽을 직접 보고, 이미지는 Read 도구로 열어 제품·면(정면·후면·Tx·Rx)을 확인합니다.

## 2. 제조사·종류·모델 판단

- **제조사 폴더**: `RTCOM`, 다른 회사 자료면 그 회사 이름을 영문 대문자로 씁니다(예: `SAMSUNG`). 판단할 수 없으면 `_unsorted`에 두고 사용자에게 묻습니다.
- **종류**: `Manual`(사용자 매뉴얼), `Catalog`(카탈로그 전체 또는 쪽 발췌), `ProductSheet`(제품 안내서·시트), `Drawing`(ASSY·도면·구성도), `Photo`(제품 사진), `Other`
- **모델**: `data/products/*.json`의 `model` 표기를 그대로 씁니다(예: `HD-13U`, `XDM-CT103`, `OBUX-1C`). 송수신기 한 쌍을 다룬 자료는 제품 id 표기처럼 이어 씁니다(예: `CT103-U-H-CR103-U`).
- **판 번호**: 원래 파일 이름이나 PDF 제목의 `Ver.1.2`, `KV01` 등을 `Ver1.2`, `KV01`로 씁니다. 본문에서 찾을 수 없으면 비워 둡니다(추측하지 않음).
- **사진 추가 구분**: `--suffix Tx-Front`, `Rx-Rear`, `Front`, `Rear`처럼 면을 적습니다.

## 3. 이름 변경·이동

```bash
python scripts/input_doc.py file "<input_doc 안 파일>" --maker RTCOM --kind Manual --model HD-13U --version Ver1.2 --note "원래 이름에서 판 번호 확인"
```

- 결과 위치: `input_doc/RTCOM/manual/RTcom_Manual_HD-13U_Ver1.2.pdf`
  - 이름 규칙은 `.source-materials/`와 같습니다: `<제조사>_<종류>_<모델>[_<판>][_<구분>].<확장자>`
- 같은 이름이 있으면 `_2`를 붙이고, 내용이 같은 파일이면 `input_doc/_duplicates/`로 옮깁니다. 어떤 경우에도 파일을 지우지 않습니다.
- 모든 이동은 `input_doc/INDEX.md`에 기록됩니다(날짜, 원래 이름, 새 위치, sha256 앞 16자리).

## 4. 필요한 곳에 반영 ("알아서 작업")

자료 종류에 따라 다음을 진행합니다. 원본은 `input_doc/<제조사>/…`에 그대로 두고, 저장소에는 **가공본이나 필요한 값만** 넣습니다.

| 자료 | 반영 | 확인 없이 진행 |
|---|---|---|
| 제품 사진 | 기존 고해상도 사진 교체 절차(흰 배경으로 잘라 `output/design/assets/products/<id>-*.webp`, 앞면·뒷면 합성, `portMap` 좌표 재측정)대로 교체 | 예 (지금까지 사용자 사진 교체와 같은 방식) |
| 매뉴얼·제품 안내서·도면 | `data/products/<id>.json`과 대조해 **근거가 분명한 정정**(사양·EDID·딥 스위치·단자)을 반영하고, `sources`에 `input_doc/RTCOM/manual/… (로컬 보관, 배포 제외)`로 출처를 남김 | 근거가 분명한 정정만. 해석이 갈리거나 기존 사용자 결정과 다르면 선택지와 추천안을 보여 주고 묻습니다 |
| 카탈로그 | 카탈로그 쪽 번호·사양 대조 | 대조·보고는 예, 값 변경은 위와 같음 |
| 제조사 문서 PDF 공개 버튼 | 5단계 | 아니요 |

- 단가·원가·거래처·노하우 같은 회사 내부 정보가 들어 있는 자료는 저장소 어디에도 옮겨 적지 않습니다(`docs/audit/SITE_SCOPE_REVIEW.md` §9). 이런 자료는 분류만 하고 보고합니다.
- 새 PDF를 만들지 않습니다(카탈로그 쪽 발췌 포함). 사용자가 넣은 파일을 옮기거나 복사만 합니다. 발췌가 필요하면 사용자에게 요청합니다.

## 5. 공개 PDF 버튼 (되돌릴 수 없는 작업)

제품 상세의 "카탈로그 PDF·매뉴얼 PDF" 버튼(`docs/implementation/PRODUCT_DOCUMENT_DOWNLOADS.md`)에 연결하려면 공개 저장소에 PDF를 커밋해야 합니다. 한 번 커밋한 PDF는 지워도 Git 기록에 남습니다.

1. 올릴 후보를 표로 보여 줍니다: 원본 위치 → 공개 이름(`<id>-catalog.pdf`, `<id>-manual.pdf`, `<id>-sheet.pdf`), 크기, 판 번호.
2. 사용자가 "올려", "공개해"처럼 확인하면 `output/design/assets/docs/`로 **복사**하고 `documents[].file`에 등록합니다.
3. 확인이 없으면 공개 폴더에 넣지 않고 다음 작업으로 넘어갑니다.

## 6. 검증·기록·보고

```bash
node --test tests/*.test.cjs
node scripts/build-product-index.cjs --check
node scripts/package-site.cjs
node scripts/e2e-smoke.cjs
git diff --check
```

- 바꾼 화면은 1280px·390px 스크린샷을 `docs/qa/`에 남기고, QA 문서와 `CHANGELOG.md` Unreleased 한 줄을 씁니다.
- `CLAUDE.md` Git 정책대로 작업 브랜치에서 커밋·푸시하고 PR(초안)을 만듭니다. 병합·배포는 사용자 승인("배포") 뒤에만 합니다.
- 보고에는 다음을 적습니다: 원래 이름 → 새 이름·위치 표, 반영한 내용, 반영하지 않은 자료와 이유, 사용자 결정이 필요한 항목, 다음 단계에 알맞은 모델(분류·옮겨 적기 Sonnet, 판단·리뷰 Opus).
