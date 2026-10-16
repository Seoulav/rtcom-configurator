# 0.220.0 배포 기록(2026-10-16)

- PR: #335 (`0.220.0: FT101-U/FR101-U 정정 매뉴얼 교체 · 매뉴얼 기준 값 반영`) → main 병합, squash 커밋 `296c959`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `62748ff`, run 38868693460)
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합(병합 직전 main `18c5b1a` 변경 없음 확인)
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38868950087, 결과 success, main `296c959`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.220` 표기
  - 공개 `data/products/ft101-u-fr101-u.json`: 전원 `DC +12V 1A 이상`, 규격 `DVI 1.0, HDMI 1.4`, 무게 FT101-U `0.24`·FR101-U `0.23`
  - 공개 `ft101-u-fr101-u-manual.pdf`의 SHA-256이 저장소 정정본과 같음(`23cd7fec…`)
  - 공개 `src/app.js`에 "DC 12V 2A" 0건
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 296c959` 후 Pages 배포를 다시 실행하면 공개 매뉴얼이 첫 공개본(FT103 사양표)으로, 사양이 카탈로그 값으로 돌아갑니다.
