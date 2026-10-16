# 0.194.0 배포 기록 (2026-10-01)

- PR #287 → main squash 병합 `4a0b8ea`(RTCOM checks / verify 통과 후, `expectedHeadSha` 59310f3 고정)
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 36855653041 성공
- 공개 확인: 우측 상단 `CATALOG BASED · 0.194`, 공개 `src/products.js`에 "그림 설명" 포함, 공개 `data/products/qms-88ux.json`에 `audioOutFlow` 포함, `CLAUDE.md` 404
- 참고: 클라우드 세션 브라우저는 프록시 인증서 문제로 공개 주소를 열지 못해 화면 확인은 배포 전 로컬 빌드(dist) 캡처·e2e 219/219로 대신함
- 내용: 분배기·선택기·QMS 9종 03 Signal Flow 출력 묶음(주 출력 → 멀티뷰 → 오디오 추출, 보조 경로 점선)·매트릭스 입력 화살촉·범례·그림 설명·키보드 이동, QMS-88UX QD1·QD2 선택 범위
