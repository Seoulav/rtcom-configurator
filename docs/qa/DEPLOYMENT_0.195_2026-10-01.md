# 0.195.0 배포 기록 (2026-10-01)

- PR #289 → main squash 병합 `b6fdc65`(RTCOM checks / verify 통과 후, `expectedHeadSha` f2be9ee 고정)
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 36859157068 성공
- 공개 확인: 우측 상단 `CATALOG BASED · 0.195`, 공개 `src/products.js`에 "동작 모드 선택" 포함, `CLAUDE.md` 404
- 참고: 클라우드 세션 브라우저는 프록시 인증서 문제로 공개 주소를 열지 못해 화면 확인은 배포 전 로컬 빌드(dist) 캡처·e2e 225/225로 대신함
- 내용: QMS-44UX 03 Signal Flow 동작 모드 줄(MATRIX·QUAD 멀티뷰·WALL·DUAL, QMS-88UX는 MATRIX·WALL), 전송기 그림 점선 케이블 범례·최대 전송 거리 글 표기·펼치는 그림 설명
