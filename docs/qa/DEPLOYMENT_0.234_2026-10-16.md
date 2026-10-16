# 0.234.0 배포 기록(2026-10-16)

- PR: #362 (`0.234.0: QMS-44UX·QMS-88UX 설정 명령 패널(명령 빌더)`) → main 병합, squash 커밋 `12fdf2a`
- 병합 전 검사: `RTCOM checks / verify` 성공(head `36eafc0`), 로컬 검증은 단위 테스트 138건·제품 검증 33개·브라우저 검사 257건 통과
- 검사 이력: 첫 로컬 실행에서 사이트 표기 통일 규칙(해상도는 Extron 방식) 위반 1건이 나와 `unify_notation.cjs --apply`로 해상도 이름을 고친 뒤 통과했습니다. 단위 테스트는 화면 모드 명령 글자 오류(`WM` 대신 `W`)도 잡았습니다.
- 병합 방식: GitHub 연결 도구로 `expectedHeadSha`를 고정해 squash 병합
- Pages 배포: `Deploy RTCOM to GitHub Pages`(`pages.yml`) 수동 실행, run 38912888832, 결과 success, main `12fdf2a`
- 공개 주소 확인:
  - `https://seoulav.github.io/rtcom-configurator/`에 `CATALOG BASED · 0.234` 표기
  - `data/products/qms-88ux.json`에 `builders` 포함(제품 JSON `controlExample`의 명령 빌더)
  - `CLAUDE.md` 공개 주소 HTTP 404(비공개 유지)
- 화면: `docs/qa/control-example-0.234/`
- 되돌리기: `git revert 12fdf2a` 후 Pages 배포를 다시 실행하면 0.233 화면으로 돌아갑니다(`docs/implementation/CONTROL_EXAMPLE_QMS_CMD_0.234.md` §4).
