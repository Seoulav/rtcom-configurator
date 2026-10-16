# 0.221.0 배포 기록(2026-10-16)

- PR: #337 (`0.221.0: FT101-U 무게를 카탈로그 0.65kg 기준으로 되돌림`) → main 병합, squash 커밋 `0a22f37`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `5c7c0a3`, run 38870503220)
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합(병합 직전 main `0988107` 변경 없음 확인)
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38870746400, 결과 success, main `0a22f37`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.221` 표기
  - 공개 `data/products/ft101-u-fr101-u.json` 무게 행: FT101-U `0.65`(한 행)
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 되돌리기: `git revert 0a22f37` 후 Pages 배포를 다시 실행하면 무게가 매뉴얼 값(FT101-U 0.24kg·FR101-U 0.23kg)으로 돌아갑니다.
