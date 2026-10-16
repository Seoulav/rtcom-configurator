# 0.197.0 배포 기록 (2026-10-02)

- 병합: PR #264 → main `42318b7` (squash, `--match-head-commit`으로 push한 커밋 `7d5a716`에 고정, 제목은 `--subject`로 0.197.0 지정)
- 병합 전 확인: RTCOM checks `verify` 통과(`7d5a716`), 충돌 없음, 최신 main(`eb5153f`, 0.196.0 배포 기록)이 모두 포함됨. 이 PR은 다른 세션이 main에 계속 병합해서 0.184.0 → 0.197.0으로 번호가 여러 번 밀렸고(충돌 해결·재검증 반복), 브랜치가 최신 main보다 뒤처지면 병합이 막히는 설정이라 병합 직전에 main을 한 번 더 합쳐 검사를 다시 통과시켰습니다.
- 배포: `Deploy RTCOM to GitHub Pages` run 36950659968(`42318b7`), 성공
- 공개 확인 (https://seoulav.github.io/rtcom-configurator/)
  - 버전 표기 `CATALOG BASED · 0.197`, `CLAUDE.md` 404
  - 공개 `src/app.js`에 `data-tap-card`(눌러서 옮기기) 있음
- 내용: 터치 화면(마우스 없음)의 03 카드 슬롯에서 카드 타일을 눌러 고른 뒤 같은 방향 슬롯을 눌러 장착하고, 장착한 카드는 팝업의 "이동"으로 옮기는 눌러서 옮기기. 마우스 화면은 기존 끌어 놓기 그대로.
- 검증: 단위 테스트 84/84, 제품 32개 검증 통과, `package-site` 성공, 브라우저 검사(e2e) 226/226(마지막 문서 병합 전 로컬 확인, GitHub `verify`는 병합 전 최종 커밋에서 통과), `check-version.cjs --against origin/main` 통과, `git diff --check` 이상 없음
- 미확인: 실제 손가락 터치·멀티터치는 확인하지 못했습니다(모바일 에뮬레이션과 e2e로 대신함).
