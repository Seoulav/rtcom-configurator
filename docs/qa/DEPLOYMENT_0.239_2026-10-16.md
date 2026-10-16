# 0.239.0 배포 기록 (2026-10-16)

## 요약

- 변경: XDM "내 AMX 구성"(커맨드 장바구니), AMX 코드 비밀번호 잠금(브라우저 잠금, 변환값만 저장), AMX 코드 LAN(TCP) 기본·RS-232 선택(장비 IP 기본 대역 192.168.1.xxx, 포트는 매뉴얼 값만).
- PR: [Seoulav/rtcom-configurator#368](https://github.com/Seoulav/rtcom-configurator/pull/368) → main 병합 `f73f30f`(squash).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 38977833690, 결과 success(head `f73f30f`).

## 번호 경위

- 처음 0.237.0으로 작업했으나 main에 다른 세션의 0.237(창 정렬)·0.238(다크 모드)이 먼저 들어가 main을 병합(강제 push 없음)하고 이 묶음을 0.239.0으로 다시 정했습니다.
- 병합 전에 사용자 비밀번호가 정해지지 않아 PR을 보류했다가, 비밀번호를 받은 뒤 변환값(`AMX_LOCK`)만 넣어 병합했습니다.

## 검증

- 병합 전: 단위 테스트 165 통과, 제품 색인 33종 OK, `unify_notation` 0건, e2e 268 통과, `check-version`(main 0.238 → 0.239), `git diff --check` 통과, 실제 비밀번호로 빌드 산출물에서 잠금 → 틀린 비밀번호 거절 → 해제 → 다시 잠금 확인.
- GitHub `RTCOM checks / verify`: 최신 커밋 `42dfc1d`에서 success.

## 공개 주소 확인

- 화면 버전 표기: `CATALOG BASED · 0.239`, `CLAUDE.md` 404.
- 공개 파일 8개(`index.html`·`src/control-example.js`·`src/layout-sim.js`·`src/products.js`·`src/styles.css`·`data/products/spx.json`·`xdm.json`·`hds-42mu.json`)가 main 빌드와 바이트 단위로 일치.
- 공개 `src/control-example.js`에 비밀번호 원문이 없고 변환값(PBKDF2-SHA256 20만 회)만 있음.
- 이 환경의 브라우저는 프록시 인증서 때문에 공개 주소를 직접 열 수 없어(`ERR_CERT_AUTHORITY_INVALID`, 인증서 검증은 끄지 않음), 일치가 확인된 같은 빌드를 로컬에서 열어 잠금 동작을 확인했습니다.

## 미해결 위험

- 브라우저 잠금이라 개발자 도구를 아는 사람은 우회할 수 있습니다(사용자 결정). 서버 잠금(Cloudflare Worker)은 별도 작업입니다.
- XDM·VDM·QMS·HDS의 LAN TCP 포트와 커맨드 형식은 알티컴 확인 대기(`docs/handoff/OPEN_ITEMS.md`).

## 되돌리기

- `git revert f73f30f`로 PR #368 전체를 되돌립니다(저장 키·schema 변경 없음). 되돌린 뒤 `pages.yml`을 다시 실행합니다. 비밀번호만 바꾸려면 `node scripts/tools/set-amx-password.cjs "<새 비밀번호>"`를 실행하고 PR로 올립니다.
