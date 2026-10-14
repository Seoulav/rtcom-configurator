# 0.215.0 배포 기록 (2026-10-14)

- **병합:** PR #327 → `main` squash 병합(`dfd913e`). 병합 전 `RTCOM checks / verify` 통과(마지막 커밋 `620273f`).
- **배포:** `Deploy RTCOM to GitHub Pages` run 38499900527 성공(`dfd913e`).
- **공개 주소 확인:**
  - `https://seoulav.github.io/rtcom-configurator/` 우측 상단 표기가 `CATALOG BASED · 0.215`입니다.
  - `CLAUDE.md`는 404입니다.
  - 매뉴얼 PDF 7건(`hd-d102u`·`ct101-u-cr101-u`·`ct104-u-cr104-u`·`mr-4s`·`ft103-u-h-fr103-u`·`ct103-u-h-cr103-u`·`ft101-u-fr101-u`의 `-manual.pdf`)이 저장소 파일과 sha256까지 같습니다.
- **내용:**
  - 알티컴 매뉴얼 PDF 7건을 공개했습니다(사용자 Word 저장본).
  - 매뉴얼 기준 값을 반영했습니다.
  - CR103-U 오디오 출력을 지웠습니다.
  - 도구 실행 직전 한국어 검사(PreToolUse 훅)를 더했습니다.
