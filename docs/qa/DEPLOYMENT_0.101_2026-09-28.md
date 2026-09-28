# 0.101.0 배포 기록 (2026-09-28)

## 배포 대상

- PR: [#106](https://github.com/Seoulav/rtcom-configurator/pull/106) "카드 팝업 \"카드별 수량\" UI가 다 채운 뒤 사라지는 버그 수정 (0.101.0)" → `main` squash 병합 (`8756c37`)
- 배포 워크플로: `Deploy RTCOM to GitHub Pages` run 85 (`workflow_dispatch`, `main`, head `8756c37`) — `success`

## 확인

```
curl -s -o /dev/null -w "%{http_code}\n" https://seoulav.github.io/rtcom-configurator/CLAUDE.md   # 404
curl -s https://seoulav.github.io/rtcom-configurator/ | grep -o "CATALOG BASED[^<]*"                # CATALOG BASED · 0.101
```

- `CLAUDE.md`가 404로 응답해 저장소 전체가 아니라 `dist/`만 공개됨을 확인했습니다.
- 공개 주소의 버전 표기가 `0.101`로 병합 내용과 일치합니다.

## 이번 배포에 포함된 변경

- 카드 팝업 "카드별 수량" UI가 같은 방향 슬롯을 다 채운 뒤 사라지던 버그 수정(`src/app.js`, 근거: `docs/qa/CARD_QTY_UI_BUG_2026-09-28.md`)
- XDM-CTR100·XDM-CTR100 PSE "최대 전송거리" 사양 통합, PSE 목록 썸네일 교체(PR #89, 근거: `docs/qa/XDM_CTR100_TRANSMISSION_SPEC_QA_2026-09-28.md`)
- 그 사이 다른 세션들이 병합한 0.93.0~0.100.0 변경(제품별 카탈로그 PDF 공개, XDM-PSU Signal Flow, QMS-88UX 8분할 레터박스 등)

## 미해결 위험

없음. 기본 검증(테스트 45개·데이터 검증·빌드·e2e 151개·공백 검사) 모두 통과 후 배포했습니다.
