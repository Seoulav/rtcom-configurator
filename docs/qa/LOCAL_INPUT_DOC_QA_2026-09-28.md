# 로컬 작업 환경·input_doc QA (2026-09-28)

클라우드 컨테이너에서 확인했습니다. 실제 사용자 PC(Windows 가능성)에서 설치·실행은 아직 확인하지 않았으므로, 첫 로컬 세션에서 아래 "로컬 첫 실행 확인"을 진행합니다.

## 확인한 것

- **세션 시작 알림** (`scripts/input-doc-status.cjs`, 임시 폴더를 `INPUT_DOC_DIR`로 지정)
  - `input_doc` 폴더가 없을 때와 새 자료가 없을 때는 아무것도 출력하지 않고 exit 0으로 끝납니다.
  - `README.md`, `INDEX.md`, 이미 분류된 `RTCOM/…` 파일은 새 자료로 잡지 않습니다.
  - 새 파일이 있으면 SessionStart JSON(`systemMessage`, `additionalContext`)이 나옵니다.
  - `.claude/settings.json`의 hook 명령 그대로(`node "$CLAUDE_PROJECT_DIR/scripts/input-doc-status.cjs"`) 실행했을 때도 같은 결과였습니다.
- **추정 결과** (`scripts/input_doc.py scan`, 사용자 제공 매뉴얼 사본 이용)

  | 넣은 파일 | 추정 모델 | 추정 종류 | 추정 판 |
  |---|---|---|---|
  | `13U 설명서 최종.pdf` | HD-13U | Manual | 없음 (본문에 판 표기 없음) |
  | `scan_0001.pdf` | XDM-CT103 | Manual | — |
  | `HD-13U_사용자매뉴얼_Ver.1.2.pdf` | HD-13U | Manual | Ver1.2 |
  | `RTCom_Manual_OBHD-2C_KV01.pdf` | OBHD-2C | Manual | KV01 |
  | `KakaoTalk_2026.webp` | — | Photo | — |

  - 사진의 모델은 파일 이름으로 알 수 없어, 이미지를 직접 보고 판단하도록 SKILL.md에 적었습니다.
  - 판 번호는 파일 이름과 PDF 제목에서만 읽도록 고쳤습니다. 사용자 매뉴얼 3권의 본문에는 판 표기가 없었고, 본문의 "HDMI v2.0"을 판 번호로 읽을 위험이 있었습니다.
- **옮기기** (`scripts/input_doc.py file`)
  - 결과 위치: `RTCOM/manual/RTcom_Manual_HD-13U_Ver1.2.pdf`, `RTCOM/photo/RTcom_Photo_OBUX-1C_Tx-Rear.webp`
  - `INDEX.md`에 날짜, 원래 이름, 새 위치, sha256 앞 16자리가 기록됐습니다.
  - 이름이 다르고 내용이 같은 파일은 `_duplicates/`로 옮겨졌고, `scan`에서 `duplicateOf`로 표시됐습니다.
  - `input_doc` 밖의 파일(`/etc/hostname`)은 exit 1로 거부했습니다.
- **Git 제외:** `input_doc/test.pdf`는 `.gitignore`의 `input_doc/*` 규칙에 걸렸습니다. Git에 올라가는 것은 `input_doc/README.md`, `.claude/settings.json`, `.claude/skills/input-doc/SKILL.md`뿐입니다.
- **줄바꿈:** `.gitattributes`를 넣은 뒤 `git add --renormalize .`를 해도 기존 파일 변경이 없었습니다. CRLF로 저장된 옛 자료 3개는 `-text` 예외로 두었습니다.
- **자동 테스트:** `tests/site.test.cjs`에 input_doc 흐름 테스트를 추가했습니다. Python이 있으면 scan·file·중복·밖 경로 거부까지 검사합니다.

## 검증 명령

- `node --test tests/*.test.cjs`: 42/42
- `node scripts/build-product-index.cjs --check`: 30개 통과
- `node scripts/package-site.cjs`: 통과. dist에 `input_doc`, `.claude`, 스크립트가 들어가지 않습니다(기존 배포 목록 방식).
- `node scripts/e2e-smoke.cjs`: 143/143
- `git diff --check`: 통과

## 로컬 첫 실행 확인 (사용자 PC에서 할 일)

1. `DEVICE_WORKFLOW.md` 1~3단계를 진행합니다: 설치, clone, `claude` 실행, 폴더 신뢰.
2. `input_doc/`에 아무 PDF나 넣고 Claude Code를 다시 시작해, "새 자료 N개" 알림이 뜨는지 봅니다.
3. Windows에서 `python`이 없다고 나오면 `py`로 실행합니다. `.claude/settings.json`에는 `python`, `python3`, `py` 세 가지 `scan` 명령이 모두 허용돼 있습니다.
4. hook이 돌지 않으면 `/hooks` 메뉴에서 SessionStart 항목을 확인합니다. Claude Code는 Windows에서 Git Bash로 hook을 실행합니다.
