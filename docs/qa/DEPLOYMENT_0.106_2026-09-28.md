# 0.106.0 배포 기록 (2026-09-28)

## 배포 대상

- PR: [#116](https://github.com/Seoulav/rtcom-configurator/pull/116) "XDM-PSU Signal Flow 배치 조정 + 확대 창 범례 누락 수정 (0.106.0)" → `main` squash 병합 (`5630165`)
- 배포 워크플로: `Deploy RTCOM to GitHub Pages` run 93 (`workflow_dispatch`, `main`, head `5630165`) — `success`

## 확인

```
curl -s -o /dev/null -w "%{http_code}\n" https://seoulav.github.io/rtcom-configurator/CLAUDE.md   # 404
curl -s https://seoulav.github.io/rtcom-configurator/ | grep -o "CATALOG BASED[^<]*"                # CATALOG BASED · 0.106
```

- `CLAUDE.md`가 404로 응답해 저장소 전체가 아니라 `dist/`만 공개됨을 확인했습니다.
- 공개 주소의 버전 표기가 `0.106`으로 병합 내용과 일치합니다.

## 이번 배포에 포함된 변경

- XDM-PSU "03 Signal Flow" PHX↔COS100 2핀 전원선 길이·PHX↔AC 입력 간격 조정, "크게 보기" 확대 창 범례 누락 수정(근거: `docs/qa/PSU_SIGNAL_FLOW_LAYOUT_QA_2026-09-28.md`)
- 그 사이 다른 세션들이 병합한 0.102.0~0.105.0 변경(XDM-CTR100 PSE 크기 표기 정정, OBHD-2C 흰 배경 사진, XDM-PSU 머리 아이콘·02 Port Map 앞/뒤면 그림 등)

## 미해결 위험

없음. 기본 검증(테스트 45개·데이터 검증·빌드·e2e 152개·공백 검사) 모두 통과 후 배포했습니다.
