# 0.198 알티컴 공식 홈페이지 링크 · 4K/30 표기

사용자 결정 2026-10-02 "2,3번 진행해": 시안(제품 상세 버튼 줄, "인쇄 / PDF" 앞) 중 B안(공식 글이 있는 제품만)과 4K/30 정리.

## 공식 홈페이지 링크
- 주소: 카탈로그·매뉴얼에 적힌 `www.rtcomav.com` → `http://rtcomav.com/kor/` 게시판(그누보드). https 인증서가 맞지 않아 `http`로 겁니다(브라우저 "주의 요함" 표시 가능).
- 데이터: `data/products/<id>.json`의 `officialLinks: [{label, url}]`(documents 다음). 검사: `scripts/build-product-index.cjs`가 rtcomav.com 게시판 글 주소 형식만 허용.
- 화면: `src/products.js` `officialButton()`. 1개면 `공식 홈페이지 ↗`, 2개면 `공식 홈페이지 · TX ↗ | RX ↗`(문서 버튼과 같은 알약). 480px 이하에서 "공식" 숨김.
- 26종(글 32개, 2026-10-02 제목으로 전부 확인): 분배기 5·HDS 2·QMS 2·XDM/VDM/SPX 시리즈 3·광 전송기 5(FT101-U·FT103-U-H는 TX·RX 두 글, XDM-FT101/FR101 두 글)·UTP 전송기 5(CT101-U·CT103-U-H·CT104-U 두 글, XDM-CTR100, XDM-CT103만)·케이블 4.
- 버튼 없음(공식 글 없음): HD-D102U Rack마운트, MR-4S, SPX-R6, SPX-TX/RX, XDM-CTR100 PSE, XDM-PSU. XDM-CR103은 공식 글이 없어 XDM-CT103 글만.
- 공식 홈페이지 게시판 글 번호(wr_id)가 바뀌면 링크가 깨질 수 있습니다. 그때 이 문서의 표와 각 제품 JSON을 함께 고칩니다.

## 4K/30
- 공식 홈페이지 제품명이 FT101-U·CT101-U·CT103-U-H·CT104-U 모두 "(4K 30Hz)"입니다. 해상도 행 `최대 Ultra HD 4K 3840x2160 @ 24/25/30Hz` → `최대 4K/30 (3840x2160 @ 24/25/30Hz)`, CT101-U 지원 해상도 끝 `최대 4K/30`, 전송 거리 조건 `1080p·Ultra HD 4K` → `1080p·4K/30`.
- AHOC·LHOC 개요의 "Ultra HD 4K/60"은 이미 Hz가 있어 그대로.

## 되돌리기
- 이 PR의 squash 커밋을 revert합니다.
