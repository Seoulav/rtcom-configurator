# 04 전송기 목록 한 줄 정리·CT103 케이블 문구 통일 (0.177.0)

사용자 결정(2026-09-29): 0.175에서 보여 드린 시안 ③(`docs/qa/link-step-0.175/mock-compact-list-pc.png`)과 XDM-CT103/CR103 "CAT6a U/FTP" 문구 정정을 두고 "둘 다 진행".

## 1. 04 전송기 왼쪽 목록

| 이전(0.176까지) | 지금(0.177) |
|---|---|
| 카드마다 제목·연결 채널 줄 아래에 "CTR100 PSE + CTR100"·"연결하지 않음" 큰 상자 2개(역할·케이블·전원 설명 2줄씩) | 카드마다 테두리 상자 하나. 첫 줄은 제목(`IN 1 · XDM-HI100 · 입력 4채널`)과 연결 채널, 둘째 줄은 선택 막대 `[CTR100 PSE + CTR100 \| 연결하지 않음]` |
| HDBaseT 카드도 전송기마다 상자 1개씩(3개) | `[XDM-CTR100 \| XDM-CT103 \| 연결하지 않음]` 한 줄 |
| "현재 구성에는 HDBaseT·광 카드가 없습니다" 큰 안내 상자(설명 문단 + 가운데 버튼) | 문장 한 줄 + 오른쪽 "카드 슬롯으로 돌아가기" 버튼 |

- 구현: 마크업(`rt-cg-link-group` → head·rows)은 그대로 두고 `src/styles.css`의 "0.177 04 전송기 왼쪽 목록 한 줄 정리" 블록만 더했습니다. 클릭 처리·저장 형식·e2e가 쓰는 선택자(`data-owner`, `data-link-device`, `aria-pressed`)는 바뀌지 않습니다.
- 숨긴 설명(역할, 케이블·전원 2줄, "기본 연동" 표시)은 버튼 `title`로 옮겨 마우스를 올리면 보입니다. 같은 내용이 오른쪽 미리보기(전송기 역할·"케이블" 줄)와 판 아래 전원 안내에 있습니다. 기본 전송기는 처음부터 선택된 상태로 보이므로 "기본 연동" 배지는 뺐습니다.
- 높이(1440px 화면, XDM-12 HDMI 카드 5장): HDMI 연장 목록 약 1,540px → 약 590px.
- 휴대폰(390px): 선택지 글자가 길면 버튼 안에서 두 줄로 꺾입니다(가로 넘침 없음, e2e "390px에서 04 카드 폭" 검사 통과).

## 2. XDM-CT103/CR103 단자 설명

`data/products/xdm-ct103-cr103.json` 단자 지도 HDBaseT OUT·IN 설명 2곳의 "CAT6a U/FTP로 연결"을 "CAT6A S/FTP로 연결"로 바꿨습니다. U/FTP는 선마다 호일 차폐만 있고 전체 차폐가 없는 케이블이라, 0.103에서 정한 권장 케이블 "CAT6A S/FTP 이상(UTP 사용 불가)"·0.108 "S/FTP CAT6A 필수"와 맞지 않았습니다. 근거 항목 U2의 scope에 이 정정을 덧붙였습니다.

## 3. 검증

- `node --test tests/*.test.cjs`: 72개 통과
- `node scripts/build-product-index.cjs --check`: 제품 32개 통과
- `node scripts/e2e-smoke.cjs`: 216개 통과. 새 검사: PC 04 목록 18개 묶음이 모두 선택지 한 줄·설명 숨김·title 있음·묶음 높이 120px 이하(측정 111px), CT103/CR103 JSON에 "U/FTP로 연결" 없음·"CAT6A S/FTP로 연결" 2곳
- 캡처: `docs/qa/link-compact-0.177/`(HDMI 연장 PC·휴대폰, HDBaseT·광 카드 PC·휴대폰)

## 4. 되돌리는 방법

- 목록: `src/styles.css`의 "0.177 04 전송기 왼쪽 목록 한 줄 정리" 블록을 지우면 이전 모양(큰 상자 2개)으로 돌아갑니다. `src/app.js`의 `title` 속성은 남겨 두어도 무방합니다.
- CT103 문구: `data/products/xdm-ct103-cr103.json` 두 곳을 "CAT6a U/FTP로 연결"로 되돌리고 U2 scope의 덧붙인 문장을 지웁니다.
