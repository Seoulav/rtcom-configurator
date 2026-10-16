# 0.227.0 배포 기록(2026-10-16)

- PR: #349 (`0.227.0: 구성기 XDM-MR4S 랙 장착 스위치·XDM-MR4S Signal Flow·MR-4S 전송기 전원 공급`) → main 병합, squash 커밋 `89142e8`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `dc5f9a2`)
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합(병합 직전 main `c8d83a0` 변경 없음 확인)
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38902444688, 결과 success, main `89142e8`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.227` 표기
  - 공개 `src/core.js`에 `mr4sUnits`, 공개 `src/products.js`에 `mr4sDiagram` 반영
  - 공개 `data/products/mr-4s.json` "전송기 전원 공급: 가능 (슬롯 카드를 통해 공급)"
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 89142e8` 후 Pages 배포를 다시 실행하면 04 전송기 스위치와 XDM-MR4S Signal Flow가 빠집니다. 스위치를 켜고 저장한 파일도 예전 판에서 `mr4s` 항목만 무시하고 열립니다.
