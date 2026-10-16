# 0.223.0 배포 기록(2026-10-16)

- PR: #341 (`0.223.0: XDM-MR4S(4K Modular Extension Center) 33번째 제품 추가`) → main 병합, squash 커밋 `41db01b`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `0c32bfb`, check run 116941000559)
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합(병합 직전 main `4017c22` 변경 없음 확인)
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38891534069, 결과 success, main `41db01b`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.223` 표기
  - 공개 `data/products/index.json` 제품 33개, `xdm-mr4s` 포함
  - 공개 `data/products/xdm-mr4s.json` 장착 카드 "XDM-CTR100(HDBaseT), XDM-FT101·XDM-FR101(광)"
  - 사진 `xdm-mr4s-front.webp`·`xdm-mr4s-rear.webp` HTTP 200
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 41db01b` 후 Pages 배포를 다시 실행하면 제품 목록이 32종으로 돌아가고 XDM-CTR100·XDM-FT101/FR101·MR-4S의 XDM-MR4S 관련 제품 링크가 빠집니다.
