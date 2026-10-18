# 0.251.0 배포 기록 (2026-10-18)

- PR: #396 "0.251.0 LAN IP 설정·DHCP 안내, FT101 HDMI 입력 1개, 통합 제어 IP 기본"
- 병합: squash, main `4f79b48` (`expectedHeadSha` c51ad06 고정, GitHub `RTCOM checks / verify` success, 병합 직전 main은 `1d2619f` 그대로)
- 경위: 사용자 확인 2026-10-18 세 가지를 묶었습니다. ① LAN 제품 5개는 "IP는 커맨드로 못 바꾸고 장비에서 직접 설정, DHCP 지원", ② FT101-U / FR101-U 매뉴얼 4쪽 "HDMI 2 Ports"는 오기이고 HDMI 입력은 1개, ③ "통합제어시 HDS-42MU, 21U 제외하고는 무조건 IP제어를 기본으로"(AMX 코드 생성 기본을 LAN으로 통일, 화면은 0.239부터 LAN 기본).
- 작업 브랜치 순서: 병합 뒤 `git checkout -B`로 main에 맞추고 원격의 병합 전 기록을 합친 다음 푸시했습니다(강제 푸시 없음).
- Pages 배포: `Deploy RTCOM to GitHub Pages` run 39092284463, success (`pages build and deployment` 실행은 보이지 않음)

## 공개 주소 확인

| 항목 | 결과 |
|---|---|
| 화면 버전 표기 | `CATALOG BASED · 0.251` |
| 공개 `src/control-example.js`·`data/products/xdm.json`·`vdm.json`·`spx.json`·`qms-44ux.json`·`qms-88ux.json`·`ft101-u-fr101-u.json`·`index.html` | main 파일과 SHA-256 앞 12자리 일치(`d5f3aa6490ed`·`1a9726511deb`·`1377edb1260e`·`995b9194c243`·`e6df7d33af9e`·`51a6f6c0644c`·`a6ea337002d3`·`fa32f2c99efa`) |
| 공개 `CLAUDE.md` | 404 |
| 공개 `docs/qa/` | 404 |

## 로컬 검증 메모

- 단위 테스트 186개 통과(옵션이 없을 때 LAN 코드가 나오는 시험 추가), `build-product-index --check` 33개 통과, `e2e-smoke` 285/285 통과, 표기 통일 바뀔 곳 0건, `check-version` 0.250 → 0.251, `git diff --check` 통과.
- 공개 사이트를 브라우저로 직접 열어 보는 시험은 이 환경의 프록시 인증서 때문에 하지 못해, 공개 파일 해시를 main과 비교해 확인했습니다.

## 남은 확인 사항

- IP 설정 방식·DHCP·"HDMI 1개"·"IP 제어 기본"은 알티컴 회신이 아니라 사용자 확인입니다. 화면과 문서에 "사용자 확인"으로 적었고, 알티컴 회신이 다르면 고칩니다.
- 질의서 20번(A-1, 공장 기본 IP·게이트웨이)은 사용자 결정(2026-10-18 "A-1 질문 빼고")으로 질문에서 뺐습니다. 알티컴 확인 대기는 11건(발송 7건과 미발송 4건)입니다: `docs/handoff/RTCOM_QUESTIONS_2026-10-16.md`의 "전체 회신 대기 현황".
