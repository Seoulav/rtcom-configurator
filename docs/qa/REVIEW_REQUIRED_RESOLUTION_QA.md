# §6 검토 필요(REVIEW REQUIRED) 항목 판단 적용 QA (0.32.0)

- 일시: 2026-09-27 · 환경: 로컬 build(`dist/`), 전역 Playwright(`NODE_PATH=/opt/node22/lib/node_modules`), Chromium(`executablePath: /opt/pw-browsers/chromium`)
- 근거: `docs/audit/PRODUCT_DIAGRAM_REVIEW_2026-09-27.md` §6 판단표(사용자 위임, 2026-09-27)
- 적용 원칙(§6 원문): (1) 명백한 오기는 바로잡고 condition에 `원문: "…"`, 출처 `J` 추가 (2) 같은 쪽 충돌은 제품사양 표 → 사진 우선 (3) kg·lb 환산이 안 맞는 무게는 kg만 표시 (4) 값을 알 수 없는 사양은 행을 숨기고 issue(INFO)로 기록 (5) 해소한 issue는 `INFO`+`[판단]`, 사양·io는 `VERIFIED`로 변경.

## 검증 결과

| 항목 | 결과 |
|---|---|
| `node --test tests/*.test.cjs` | 29/29 통과 |
| `node scripts/build-product-index.cjs --check` | 27개 통과 |
| `node scripts/package-site.cjs` | 정상 빌드 |
| `node scripts/e2e-smoke.cjs`(전역 playwright) | 53/53 통과 |
| `git diff --check` | 통과 |
| Playwright: qms-88ux·vdm·ft101-u-fr101-u·spx 상세 페이지 "표기 검토 필요" 배지 | 4개 모두 0건(사라짐) |
| Playwright: 제품 목록 전체(27종) "표기 검토 필요" 배지 | 0건 |
| `grep "REVIEW REQUIRED"` (모든 specifications/io/issues) | 0건(13개 제품 전체) |

## 제품별 판단 전 → 후

### QMS-44UX

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| 전원공급 | DC 12V 2A · REVIEW REQUIRED | DC 12V 5A · VERIFIED (출처 `M-Q44`, 매뉴얼 KV.04 3·6·11쪽) |
| 이슈 R1 | REVIEW REQUIRED | INFO · `[판단]` |

### QMS-88UX

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| 해상도 | "3860x2160@60Hz" · REVIEW REQUIRED | "3840x2160@60Hz" · VERIFIED |
| 출력 신호 | "HDMI 10 Ports" · REVIEW REQUIRED | "HDMI 10 Ports(매트릭스 8 + 9·10번 쿼드뷰 전용)" · VERIFIED |
| 전원 공급 | 100-200 VAC · REVIEW REQUIRED | 100-200 VAC(변동 없음, condition에 AC 확정 근거 추가) · VERIFIED |
| 연결 단자 | "DC Power Jack, …" | "LAN, RS-232, …"(DC Power Jack 제거, 원문은 condition) |
| 개요·주요기능 전면 패널 표기 | "전면 터치 패널" / "전면 LCD 패널" (표기 다름) | "전면 LCD 터치 패널"로 통일 |
| 이슈 R1~R4 | REVIEW REQUIRED | INFO · `[판단]` |
| io 출력 10개 행 | REVIEW REQUIRED | VERIFIED |

### VDM

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| 최대 해상도 | 원문 표기 혼재 · REVIEW REQUIRED | 대표값 "3840×2160@30Hz 4:4:4" · VERIFIED |
| VDM-80X 무게 | 111.13kg · REVIEW REQUIRED | 111.13kg 유지 + "계열 비례치(약 64kg)와 차이가 커 제조사 확인 중" 안내 · VERIFIED(배지만 제거, 값은 원문 유지) |
| 입출력 신호 VGA | VGA 포함 · REVIEW REQUIRED | VGA 제거, DVI는 "HDMI(DVI 1.0 호환)" · VERIFIED |
| 이슈 R1~R5 | REVIEW REQUIRED | INFO · `[판단]` |

### SPX

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| 대역폭·색 표기 | "18Gps"·"4:4;4" 오기 · REVIEW REQUIRED | "18Gbps"·"4:4:4" · VERIFIED |
| 출력 포트 수 | "10~2포트" 오기 · REVIEW REQUIRED | "10~12포트" · VERIFIED |
| 입력 신호 | REVIEW REQUIRED | HDMI(HIS8 보드 기준) 확정 · VERIFIED |
| HIS8 해상도 | "3840@60Hz"(세로 해상도 누락) | "3840×2160@60Hz" |
| 이슈 R1~R5 | REVIEW REQUIRED | INFO · `[판단]` |

### CT101-U/CR101-U

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| CR101-U 무게 | 0.27kg(원문 0.5lbs 병기) · REVIEW REQUIRED | 0.27kg(lb 표기 제거) · VERIFIED |
| RS-232 단자(TX·RX) | "핀 수 미기재" 등 상세 condition · REVIEW REQUIRED | "커넥터 핀 수 미기재"로 condition 간소화 · VERIFIED |

### CT103-U-H/CR103-U

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| 입력 신호 | VGA 언급과 불일치 · REVIEW REQUIRED | DVI/HDMI(TMDS)·3.5mm 확정, 개요의 VGA 문구 삭제 · VERIFIED |
| 지원 해상도 | 거리 표 4K 언급과 불일치 · REVIEW REQUIRED | 최대 1920×1200@60Hz/1080p 확정 · VERIFIED |
| 최대 전송거리 | "Ultra HD 4K" 포함 · REVIEW REQUIRED | "Ultra HD 4K" 제거(CT101-U 문구 오적용으로 판단) · VERIFIED |
| RS-232 단자(TX·RX) | REVIEW REQUIRED | condition 간소화 · VERIFIED |

### FT101-U/FR101-U

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| FR101-U 입력 신호 | "HDBaseT 0,1,2,3+/-" · REVIEW REQUIRED | "Fiber Optical Input" · VERIFIED |
| FR101-U 규격 | HDBaseT 포함 · REVIEW REQUIRED | HDBaseT 제거(DVI 1.0, HDMI 1.4b만) · VERIFIED |
| FR101-U 크기·무게 | 91.44×107.95×57.15mm / 0.23kg · REVIEW REQUIRED | **행 삭제**(벽부형 CR103-U 값을 옮겨 적은 것으로 판단, 원문 값은 issue R2에 기록) |
| io RX·Transmission | REVIEW REQUIRED | VERIFIED(Fiber Optical 확정) |
| RS-232 단자(TX·RX) | REVIEW REQUIRED | condition 간소화 · VERIFIED |

### FT103-U-H/FR103-U

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| FR103-U 입력 신호 | 입력 칸에 "Output" 오기 · REVIEW REQUIRED | "Input"으로 정정 · VERIFIED |
| 지원 해상도 | REVIEW REQUIRED | 최대 1920×1200@60Hz/1080p 확정(4K 미지원 명시) · VERIFIED |
| RS-232 단자(TX·RX) | REVIEW REQUIRED | condition 간소화 · VERIFIED |

### MR-4S

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| 무게 | "1.81Kg for each of Tx and Rx" · REVIEW REQUIRED | 1.81kg(프레임 단독으로 확정, 원문 문구는 condition 유지) · VERIFIED |

### OBUX-1C

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| 출력단자 | "Analog Stereo Audio Input"(입력 칸과 동일) · REVIEW REQUIRED | "Analog Stereo Audio Output" · VERIFIED |
| io RX·Audio | REVIEW REQUIRED | VERIFIED |

### XDM-CT103/XDM-CR103

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| CR103 오디오 방향 | IN(원문) · REVIEW REQUIRED | OUT으로 정정(수신기이므로 출력) · VERIFIED |
| CT103 무게 | 0.34kg(원문 1.0lb. 병기) · REVIEW REQUIRED | 0.34kg(lb 표기 제거) · VERIFIED |

### XDM-CTR100

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| PSE 무게 | 0.34kg(원문 약 0.71lb. 병기) · REVIEW REQUIRED | 0.34kg(lb 표기 제거) · VERIFIED |

### LHOC

| 항목 | 판단 전 | 판단 후 |
|---|---|---|
| Pull up 저항력 | 8.83kg(86.59N) · REVIEW REQUIRED | 값 동일, 확정값으로 표시 · VERIFIED |
| 개요 인장력 문구 | "약 10kg" | "약 9kg(86.59 N)"으로 사양표와 일치 |

## packageStatus·index.json

13개 제품 모두 `packageStatus`를 `VERIFIED`로 바꾸고 `node scripts/build-product-index.cjs`로 `data/products/index.json`을 다시 만들었습니다(손으로 고치지 않음). 재생성 후 `--check`가 통과했고, 화면(제품 목록·상세 27종)에서 "표기 검토 필요" 배지가 모두 사라진 것을 Playwright로 확인했습니다.

## 출처 코드 추가

- `J`: 서울영상테크 SI사업본부 검토 판단(사용자 위임 2026-09-27) — 카탈로그 내부 충돌·오기를 바로잡은 값에 사용.
- `M-Q44`: 알티컴 QMS-44UX 사용자 매뉴얼 KV.04(사용자 제공, 2026-09-27) — QMS-44UX 전원 정정에만 사용(§6 표가 이 출처를 직접 지정).
- `node scripts/build-product-index.cjs`의 출처 코드 교차 검증(`출처 코드 X가 sources에 없음`)과 내부 정보 금칙어 검사가 새 코드·문구에 대해 오탐 없이 통과했습니다(검증기 수정 불필요).

## 남은 위험(사용자 확인 전 판단값)

- **VDM-80X 실제 무게**: 111.13kg 원문을 유지했으나 계열 비례치(약 64kg)와 차이가 큽니다. condition에 "제조사 확인 중" 안내를 남겼습니다.
- **FR101-U 실제 크기·무게**: 알 수 없어 행을 숨겼습니다. 원문 값(91.44×107.95×57.15mm, 0.23kg)은 issue R2에 남아 있어 나중에 실측값으로 되살릴 수 있습니다.
- **QMS-88UX 정확한 AC 입력 범위**: 100-240V인지 100-200V 원문 그대로인지는 확인 전입니다(전원 종류가 AC라는 것만 확정).
- **크로스 브랜치 참고 사항**: 별도 브랜치(`claude/rtcom-configurator-dev-3q2npl`, PR #22)에서는 사용자가 XDM-CTR100 PSE 무게를 0.28kg으로 직접 확인한 바 있습니다. 이번 브랜치(PR #23)의 §6 표는 명시적으로 "PSE 0.34 kg"(원칙 3 적용)을 지시하고 있어 표대로 0.34kg으로 정리했습니다. 두 브랜치의 값이 다르므로, 두 PR을 병합하기 전에 어느 값이 맞는지 사용자 확인이 필요합니다.

## Rollback

- 데이터만 되돌리려면 `git revert` 대상 커밋(§6 판단 적용 커밋)을 지정해 되돌리고 `node scripts/build-product-index.cjs`를 다시 실행해 `index.json`을 이전 상태로 되돌립니다.
- 특정 제품 1개만 되돌리려면 해당 `data/products/<id>.json`을 이전 커밋 상태로 `git checkout <이전 커밋> -- data/products/<id>.json` 한 뒤 `node scripts/build-product-index.cjs`를 실행합니다.
- 버전 표기(`index.html`·`README.md`·`CLAUDE.md`·`CHANGELOG.md`)는 데이터와 함께 원복해야 버전 번호가 어긋나지 않습니다.
