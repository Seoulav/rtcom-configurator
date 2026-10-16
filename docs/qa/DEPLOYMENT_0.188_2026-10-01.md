# 0.188.0 배포 기록 (2026-10-01)

- 병합: PR #274 → main `74a871a` (squash, `expectedHeadSha`로 push한 커밋 `0f3de57`에 고정)
- 병합 전 확인: 작업 중 다른 세션의 #273·#275(문서)가 main에 들어와 두 번 병합 후 기본 검증 명령을 다시 실행, RTCOM checks `verify` 통과(`0f3de57`)
- 배포: `Deploy RTCOM to GitHub Pages` run 36798058018(`74a871a`), 성공
- 공개 확인: 버전 표기 `CATALOG BASED · 0.188`, `CLAUDE.md` 404, `data/products/mr-4s.json`에 "장착 모듈 기준"
- 변경 범위: MR-4S 프레임 사양 정리(영상 사양은 장착 모듈 기준)
