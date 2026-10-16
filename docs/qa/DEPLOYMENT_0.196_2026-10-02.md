# 0.196.0 배포 기록 (2026-10-02)

- PR #291 → main squash 병합 `cbdc3bb`(RTCOM checks / verify 통과 후, `expectedHeadSha` 35328c1 고정)
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 36950022925 성공
- 공개 확인: 우측 상단 `CATALOG BASED · 0.196`, 공개 `src/products.js`에 `pseDiagram` 포함, 공개 `data/products/xdm-psu.json` 주요 기능 첫 줄 "XDM-CTR100 개별 전원 어댑터 불필요", `CLAUDE.md` 404
- 참고: 클라우드 세션 브라우저는 프록시 인증서 문제로 공개 주소를 열지 못해 화면 확인은 배포 전 로컬 빌드(dist) 캡처·e2e 227/227로 대신함
- 내용: XDM-CTR100 PSE 03 Signal Flow를 XDM-PSU와 같은 장비 그림·흐르는 케이블·크게 보기 개념도(조합 1·2)로, XDM-PSU 05 주요 기능 순서 변경
