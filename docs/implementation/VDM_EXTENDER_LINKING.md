# VDM 전송기 연동 (0.18.0)

- 요청(2026-09-26): "VDM Cis랑 호환은 CT104, Cos는 CR104, fis는 ft101, fos fr101"
- 근거: 근거 문서 U09 (사용자 확인 + 알티컴 홈페이지 VDM EXTENDER 게시판)

| VDM 카드 | 연동 전송기 | 역할 | 사진 |
|---|---|---|---|
| CIS4-U (HDBaseT 입력) | CT104-U | 송신기 | `output/design/assets/extenders/vdm-ct104-u.webp` |
| COS4-U (HDBaseT 출력) | CR104-U | 수신기 | `vdm-cr104-u.webp` |
| FIS4-U (광 입력) | FT101-U | 송신기 | `vdm-ft101-u.webp` |
| FOS4-U (광 출력) | FR101-U | 수신기 | `vdm-fr101-u.webp` |

## 변경

- `src/core.js`: `choices()`와 `defaultLinks`에 4종 추가. 카드 장착 시 카드 채널 수(4)로 자동 연결. VDM 연결 검증 근거는 "사용자 확인 · 알티컴 홈페이지 VDM EXTENDER · U09"로 표시합니다. 전원·부속품 조건은 기존처럼 미검증(`LINK_CONDITIONS_*`)으로 남습니다.
- `src/app.js`: `extenderInfo`에 4종 사양(홈페이지 사양표), `vdmExtenderLineup`과 공통 라인업 렌더러(`lineupSection`)로 VDM 전송기 단계에 "VDM 연동 전송기" 라인업 표시. VDM 안내 문구에서 "벽부형" 언급 제외.
- `scripts/tools/prepare_vdm_extenders.py` (새 파일): 홈페이지 제품 사진(`/kor/images/vdm-ct104-u.jpg` 등)의 밝은 회색 배경을 투명하게 하고 폭 480px WebP로 저장. 원본은 `.source-materials/vdm-extenders/`.
- 테스트: VDM 카드-전송기 연동·자동 연결·BOM 수량(core), 전송기 사진 10장(site), e2e "VDM CIS4-U·FOS4-U 장착 시 CT104-U·FR101-U 자동 연결 + 라인업 4종".

## 되돌리는 방법

이 PR의 병합 커밋을 revert하면 VDM CATx·광 카드는 다시 "호환 관계 확인 필요"로 표시됩니다. 저장 형식은 바뀌지 않았고, VDM 전송기가 연결된 저장본을 불러오면 이전 버전에서는 해당 연결이 선택지에 없는 장비로 남습니다.
