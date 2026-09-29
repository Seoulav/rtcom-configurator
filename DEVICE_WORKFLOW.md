# 로컬 PC에서 작업하기 (Claude Code + input_doc)

2026-09-28 기준 안내입니다. 예전 안내(개인 저장소 `hkkim0454/rtcom-configurator`, Codex 기준)를 현재 원본 저장소 `Seoulav/rtcom-configurator`와 Claude Code 기준으로 바꿨습니다.

## 1. 한 번만 설치할 프로그램

| 프로그램 | 용도 | 확인 명령 |
|---|---|---|
| Git (Windows는 Git for Windows, Git Bash 포함) | 저장소 받기·올리기 | `git --version` |
| Node.js 20 LTS 이상 | 테스트·검증·미리보기 서버 | `node -v` |
| Python 3.10 이상 | `input_doc` 자료 읽기(PDF 글자 추출)·사진 가공 | `python --version` (Windows는 `py --version`도 가능) |
| Claude Code | 로컬 AI 작업 | `claude --version` |
| GitHub CLI (`gh`, https://cli.github.com) | Claude가 PR을 만들고 상태를 확인 | `gh auth status` |

GitHub에는 한 번 로그인합니다. `Seoulav/rtcom-configurator`에 쓰기 권한이 있는 계정을 씁니다.

```bash
gh auth login        # GitHub.com → HTTPS → 브라우저 로그인
gh auth status
```

Python 라이브러리는 한 번 설치합니다.

```bash
python -m pip install pypdf pypdfium2 pillow
```

화면 자동 검사(e2e)까지 돌리려면 저장소 폴더에서 Playwright를 설치합니다. 선택 사항이며, 없으면 `e2e-smoke`는 건너뜁니다(exit 2).

```bash
npm install --no-save playwright
npx playwright install chromium
```

## 2. 저장소 받기

```bash
mkdir C:\work        # 추천 위치: 짧은 영문 경로, OneDrive 동기화 폴더(바탕화면·문서) 밖
cd C:\work
git clone https://github.com/Seoulav/rtcom-configurator.git
cd rtcom-configurator
git config core.quotepath false   # 한글 파일 이름을 그대로 보이게 함
npm test
```

- **PowerShell에서 `npm : 이 시스템에서 스크립트를 실행할 수 없으므로 … npm.ps1 파일을 로드할 수 없습니다`가 나오면** Windows 기본 보안 설정(실행 정책)이 npm 스크립트를 막은 것입니다. 다음 중 하나를 쓰세요(사용자 PC에서 확인 2026-09-28).
  1. **추천:** `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`을 한 번 실행하고(관리자 권한 불필요) PowerShell을 다시 엽니다. 되돌릴 때는 `-ExecutionPolicy Undefined`로 실행합니다.
  2. 설정을 바꾸지 않으려면 `npm` 대신 `npm.cmd test`처럼 `npm.cmd`를 씁니다.
  3. Git Bash에서 실행합니다(`cd /c/work/rtcom-configurator`). Claude Code도 Windows에서 Git Bash를 씁니다.
- 줄바꿈은 `.gitattributes`가 LF로 맞춥니다. Windows에서도 따로 설정할 필요가 없습니다.
- 공개 저장소라서 받기(clone)는 로그인 없이 됩니다. 올리기(push)와 PR은 GitHub 로그인이 필요합니다.

## 3. Claude Code 시작

```bash
cd rtcom-configurator
claude
```

- 처음 열면 "이 폴더의 설정을 신뢰할지" 묻습니다. 신뢰해야 `.claude/settings.json`의 설정이 켜집니다.
  - 세션 시작 알림: `input_doc` 새 자료가 있으면 알려 줍니다.
  - 자주 쓰는 검증 명령은 묻지 않고 실행합니다.
  - 위험한 Git 명령(force push, `reset --hard`, `clean`, main 직접 push)은 막습니다.
- 작업 규칙은 `CLAUDE.md`에 있습니다. Claude Code가 자동으로 읽습니다.
- Claude 데스크톱 앱을 쓰면 Code 탭에서 새 세션을 만들 때 로컬 폴더 `C:\work\rtcom-configurator`를 지정합니다. 클라우드 세션(claude.ai/code)은 PC 폴더를 볼 수 없습니다.
- 클라우드 세션도 같은 저장소에 작업을 올리므로, 로컬 세션은 자기 이름의 새 브랜치에서 작업합니다.
- 첫 세션의 첫 메시지 예: "`DEVICE_WORKFLOW.md`와 `docs/qa/LOCAL_INPUT_DOC_QA_2026-09-28.md`의 '로컬 첫 실행 확인'을 진행해줘. 그다음 `input_doc` 정리해."

## 4. 자료 넣기 (input_doc)

1. 매뉴얼·카탈로그·제품 안내서·도면·제품 사진을 `input_doc/` 폴더에 아무 이름으로나 넣습니다.
2. Claude Code를 시작하면(이미 켜져 있으면 "input_doc 정리해") Claude가 다음을 합니다.
   - 내용을 읽고 제조사·종류·모델·판 번호를 판단합니다.
   - 제조사 폴더로 옮기며 이름을 바꿉니다. 예: `input_doc/RTCOM/manual/RTcom_Manual_HD-13U_Ver1.2.pdf`
   - 제품 사진 교체, 매뉴얼 근거 사양 정정처럼 필요한 곳에 반영합니다.
3. 공개 사이트에 PDF를 올리는 일(제품 상세 PDF 버튼)은 목록을 보여 주고 확인을 받은 뒤에만 합니다.

`input_doc/`의 자료는 Git에 올라가지 않습니다. 이 PC에만 남으므로, 다른 PC에서도 쓰려면 폴더를 따로 복사하세요. 자세한 절차는 `input_doc/README.md`, `.claude/skills/input-doc/SKILL.md`, `docs/implementation/LOCAL_INPUT_DOC_WORKFLOW.md`에 있습니다.

## 5. 작업 시작·마무리

- **시작할 때**
  ```bash
  git switch main
  git pull --ff-only
  ```
- **작업할 때:** 브랜치를 만들어 작업합니다. `main`에 바로 올리지 않습니다(`CLAUDE.md` Git 정책).
- **마무리할 때:** Claude가 검증 명령을 실행한 뒤 커밋하고, 브랜치를 올리고, PR(초안)을 만듭니다.
  ```bash
  node --test tests/*.test.cjs
  node scripts/build-product-index.cjs --check
  node scripts/package-site.cjs
  node scripts/e2e-smoke.cjs
  git diff --check
  ```
- **병합·배포:** 사용자가 "배포"라고 승인한 뒤에만 합니다.

## 6. 미리보기

```bash
node scripts/serve.cjs
```

브라우저에서 http://127.0.0.1:4173 을 엽니다.

## 참고

- 클라우드 세션(claude.ai/code)과 로컬 세션은 GitHub 브랜치로만 이어집니다. 로컬 `input_doc/`와 `.source-materials/`는 클라우드에서 보이지 않습니다.
- 브라우저 자동 저장 데이터(구성기 구성)는 PC마다 따로 저장됩니다. 다른 PC로 옮기려면 구성기에서 "구성 파일 저장"으로 파일을 내려받아 불러오세요.
