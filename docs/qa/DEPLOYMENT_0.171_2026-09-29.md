# 0.171.0 배포 기록 (2026-09-29)

- 병합: PR #242 → main `a2c9c2a` (squash, `expectedHeadSha`로 push한 커밋 `f1cc657`에 고정)
- 병합 전 확인: main이 0.170.0(`e4ec0ec`, 다른 세션)으로 바뀌어 작업 브랜치에 병합하고 번호를 0.170 → 0.171로 다시 정함. RTCOM checks `verify` 통과(`f1cc657`), 병합 직전 main 변동 없음
- 배포: `Deploy RTCOM to GitHub Pages` run 36569933648(`a2c9c2a`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.171`, `CLAUDE.md` 404
  - 공개 `spx-r6-rear-art.webp`가 main과 같음(바이트 비교), 공개 `data/products/spx-r6.json`에 `HDMI IN/OUT`·`CAT IN/OUT` 표기 확인
- 검증: `node --test tests/*.test.cjs` 69/69, 제품 32개 검증 통과, `package-site` 성공, e2e 207/207, `check-version.cjs --against origin/main` 통과(0.170 → 0.171), `git diff --check` 이상 없음
