# 0.104.0 배포 기록 (2026-09-28)

- 요청: 첨부된 스펙표 이미지로 "XDM-CTR100와 PSE모델 크기는 첨부된 스펙표 대로 되어 있지?" 질문 후, `AskUserQuestion`에서 "107.4[127.4]×88×30.1mm로 변경 (추천)" 선택, 이어서 "병합 후 올려줘"
- PR: https://github.com/Seoulav/rtcom-configurator/pull/112 (squash 병합)
  - 병합 커밋: `573db5da9e0056ba1c036a80a2fb137e80d86bcc`
  - PR head: `696c775`(origin/main과의 병합 커밋 포함, 내용 충돌 없이 버전 이력만 결합)
- 배포 작업: `Deploy RTCOM to GitHub Pages` run 90 (https://github.com/Seoulav/rtcom-configurator/actions/runs/36424305404)
  - 결과: success (12:49:20Z → 12:49:47Z)

## 병합 충돌 메모

PR #112 브랜치가 PR #110·#111(0.103.0)과 동일한 내용을 독립적으로 커밋해 `index.html`·`README.md`·`CLAUDE.md`·`CHANGELOG.md`의 버전 표기 줄에서 origin/main과 동시 수정 충돌(`dirty`)이 발생했습니다. 두 커밋의 실제 내용(`git diff`)은 동일했고, PR #112 브랜치는 이미 origin/main의 모든 변경을 상위집합으로 포함하고 있어 `git commit-tree`로 트리 변경 없이 origin/main을 두 번째 부모로 잇는 병합 커밋만 만들어 해결했습니다(`git merge`/`reset --hard` 등 파괴적 명령 없이 처리).

## 확인

- 공개 주소 표기: `CATALOG BASED · 0.104`
- 공개 파일 대조: `573db5d`에서 `node scripts/package-site.cjs`로 만든 `dist/` 파일과 공개 파일의 SHA-256을 비교했습니다. 272/272 일치했습니다(`.nojekyll` 제외).
- 비공개 파일 4개는 모두 404였습니다: `CLAUDE.md`, `CHANGELOG.md`, `.claude/settings.json`, `docs/qa/DEPLOYMENT_0.103_2026-09-28.md`
- 데이터 확인: 공개된 `data/products/xdm-ctr100-pse.json`의 "크기(W×D×H)" 값이 `107.4[127.4]×88×30.1`로 반영됨을 확인했습니다.
- 병합 전 검증 결과
  - `node --test tests/*.test.cjs`: 45/45
  - `build-product-index --check`: 30개 통과
  - `package-site`: 통과
  - `e2e-smoke`: 151/151
  - `git diff --check`: 통과

## 되돌리기

- main에서 `573db5d`를 revert한 뒤 `Deploy RTCOM to GitHub Pages`를 다시 실행합니다.
