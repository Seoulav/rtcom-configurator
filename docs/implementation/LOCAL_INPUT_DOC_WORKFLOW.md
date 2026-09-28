# 로컬 작업 환경과 input_doc 자료 분류 (2026-09-28)

## 요청

사용자 요청 원문은 다음과 같습니다.

> 로컬 클론해서 작업할 수 있도록 환경을 만들자. 그리고 내가 로컬폴더에 자료를 넣어두면 네가 읽어서 제목을바꾸고 경로를 옮겨서 알아서 작업하도록 해. 폴더는 root에 input_doc 폴더를 만들어. 그리고 내가 자료를 넣어두면 그 안에서 제조사 폴더를 만들어서 분류하고, 내용을 읽어서 제목을 바꾸고, 필요하면 네가 경로를 변경해서 이동시켜서 작업을 해.

## 구성

| 파일 | 역할 |
|---|---|
| `DEVICE_WORKFLOW.md` | 로컬 설치·clone·Claude Code 시작·검증·미리보기 안내. 예전 Codex·개인 저장소 기준 내용을 대체합니다 |
| `.gitattributes` | Windows에서도 LF로 받도록 고정합니다. CRLF가 되면 `index.json` 비교와 `git diff --check`가 실패합니다. 원래 CRLF인 옛 자료 3개는 예외입니다 |
| `.gitignore` | `input_doc/*`(README 제외)와 `.claude/settings.local.json`을 제외합니다 |
| `.claude/settings.json` | 아래 3가지를 설정합니다 |
| `.claude/skills/input-doc/SKILL.md` | 로컬 Claude가 따르는 분류·반영 절차입니다 |
| `scripts/input-doc-status.cjs` | 새 자료 알림입니다. hook용 JSON을 내거나 `--list`로 목록을 보여 줍니다. 실행할 때마다 `input_doc/STATUS.md`(파일별 반영 표시)를 다시 만들며, 자료 파일은 옮기거나 지우지 않고 항상 exit 0으로 끝납니다. `--status`는 STATUS.md만 만들고 요약을 출력합니다 |
| `scripts/input_doc.py` | `scan`은 자료를 읽어 추정만 합니다. `file`은 규칙 이름으로 옮기고 `INDEX.md`와 반영 장부에 기록합니다. `mark`는 반영 상태를 장부에 적습니다. 중복 처리와 input_doc 밖 파일 거부도 여기서 합니다 |
| `docs/evidence/input-doc-ledger.json` | **반영 장부**(2026-09-28 사용자 요청 "깃에 자료로서 올라간 내용들은 input_doc에서 알 수 있도록 표시"). 자료별 sha256 앞 16자리·보관 위치·상태·반영한 곳·버전을 적습니다. 자료 내용은 넣지 않으며 Git에 올라가지만 Pages에는 배포하지 않습니다. 다른 PC에서 clone해도 같은 파일(내용 해시가 같으면 이름이 달라도)에 같은 표시가 붙습니다 |
| `input_doc/STATUS.md` | 장부로 자동 생성하는 로컬 표입니다. 📄 PDF 공개 · ✅ 사이트에 반영 · ⏳ 검토 전 · ☑️ 같은 판 · 🗄️ 보관만 순으로 정렬합니다 |
| `input_doc/README.md` | 사용자용 안내입니다. Git에 올라가는 유일한 파일입니다 |

`.claude/settings.json`에 넣은 설정은 다음 3가지입니다.
- **SessionStart hook:** 세션을 시작할 때 `input_doc` 새 자료를 알립니다.
- **허용:** 검증 명령과 `scan`은 묻지 않고 실행합니다.
- **거부:** force push, `reset --hard`, `clean`, main 직접 push를 막습니다. 모두 `CLAUDE.md` Git 정책에서 금지한 명령입니다.

## 흐름

1. 사용자가 `input_doc/` 맨 위에 파일을 넣습니다.
2. 세션이 시작되면 hook이 새 파일 목록을 Claude 문맥과 화면 알림에 넣습니다. 사용자 지시에 따라 Claude는 첫 요청을 처리하기 전에 먼저 정리합니다.
3. `python scripts/input_doc.py scan`으로 추정 결과를 봅니다. 추정 근거는 파일 이름, PDF 제목, 앞 3쪽 글자, 제품 데이터 모델명입니다. 이어서 PDF 쪽과 사진을 직접 확인합니다.
   - PDF 글자는 pypdf로 읽고, pypdf가 없으면 `pdftotext`(Windows Git Bash에 들어 있는 xpdf판)로 읽습니다. 알티컴 국문 매뉴얼은 한글 글꼴에 글자 정보가 없어 한글이 비어 나올 수 있으므로 표·그림은 쪽 그림으로 확인합니다(2026-09-28 첫 실사용에서 확인).
   - Windows 콘솔(cp949)에서 출력이 깨지지 않도록 스크립트가 출력을 UTF-8로 고정합니다. 파일 이름의 `_`를 공백으로 바꿔 모델명을 찾습니다(이전에는 `-`로 바꿔 `RTcom_Manual_HD-104U`에서 모델을 못 찾았음).
4. `python scripts/input_doc.py file … --maker --kind --model [--version] [--suffix]`로 옮깁니다.
   - 새 위치: `input_doc/<제조사>/<manual|catalog|sheet|drawing|photo|other>/<제조사>_<종류>_<모델>[_<판>][_<구분>].<확장자>`
   - RTCOM은 기존 `.source-materials/` 규칙을 따라 파일 이름 앞머리를 `RTcom_`으로 씁니다.
5. 반영 작업을 합니다(SKILL.md 4단계).
   - 사진은 제품 사진 교체 절차대로 진행합니다.
   - 매뉴얼은 근거가 분명한 정정만 반영하고, 해석이 갈리는 것은 사용자에게 묻습니다.
6. 공개 PDF는 목록을 보여 주고 사용자 확인을 받은 뒤에만 `output/design/assets/docs/`로 복사하고 `documents[].file`에 등록합니다(SKILL.md 5단계).
7. 검증, QA 문서, CHANGELOG, 브랜치 커밋, PR(초안)까지 진행합니다. 병합·배포는 사용자 승인 뒤에 합니다.

## 판단 기준

- **자동으로 진행하는 작업:** 분류, 이름 변경, `input_doc` 안에서의 이동, 사진 교체, 근거가 분명한 데이터 정정입니다. 분류·이동은 `INDEX.md`에 기록되고, 저장소 변경은 PR로 검토하고 되돌릴 수 있습니다.
- **확인을 받는 작업:** 공개 저장소에 PDF를 커밋하는 일입니다. 한 번 커밋하면 지워도 Git 기록에 남아 되돌릴 수 없습니다. `CLAUDE.md`의 "위험하거나 되돌리기 어려운 작업은 실행 직전에 다시 알립니다" 규칙을 따릅니다.
- **하지 않는 작업:**
  - 파일을 지우지 않습니다. 중복 파일은 `_duplicates/`로 옮깁니다.
  - 새 PDF를 만들지 않습니다. 카탈로그 쪽 발췌도 포함합니다.
  - 단가 같은 내부 정보를 저장소로 옮기지 않습니다(§9).
- **판 번호:** 파일 이름과 PDF 제목에서만 읽습니다. 확인해 보니 사용자 제공 매뉴얼 본문에는 판 표기가 없었고, 본문의 "HDMI v2.0" 같은 규격 표기를 판 번호로 잘못 읽을 위험이 있었습니다.

## 이전 규칙과의 관계

- 0.79의 "카탈로그·매뉴얼 PDF는 사용자가 직접 올린다"는 규칙은 다음처럼 이어집니다. 이제 사용자는 `input_doc`에 넣는 것으로 자료를 제공하고, AI가 분류·이동합니다.
- 공개 폴더에 올리는 일은 여전히 사용자 확인이 필요합니다.
- `.source-materials/`는 클라우드 세션에서 쓰던 비공개 원본 폴더로 그대로 둡니다. 로컬에서는 `input_doc/<제조사>/`가 같은 역할을 합니다.

## 검증

`docs/qa/LOCAL_INPUT_DOC_QA_2026-09-28.md`를 참고합니다.

## 되돌리기

- 이 변경 커밋을 `git revert`하면 설정, hook, 스크립트, 안내가 빠집니다.
- 로컬 `input_doc/` 안의 자료와 `INDEX.md`는 Git 밖에 있어 영향을 받지 않습니다.
- hook만 끄려면 `.claude/settings.local.json`에 `"disableAllHooks": true`를 넣거나 `/hooks` 메뉴에서 끕니다.
