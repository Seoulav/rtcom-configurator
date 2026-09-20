# PHASE 1 QA 기록: Portal Routes and Compatibility

- 검증일: 2026-09-20
- 구현 커밋: `aeae96d69614a88bfc91258fad56e20d4d5add3f`
- 환경: 로컬 정적 서버와 `/rtcom-av-design/` base path 모사 서버

## 1. 자동 검증

```text
node --test tests/*.test.cjs
19 tests / 19 pass / 0 fail
```

- 기존 core 테스트: 14/14 PASS
- 신규 route/계약 테스트: 5/5 PASS
- JS syntax check: `src`, `scripts`, `tests` 대상 PASS

신규 테스트는 세 승인 경로, 기존 DOM anchor, History API와 현재 메뉴 표시, 정적 deep entry 생성, 제품 31개·5개 카테고리·6개 탭, 제품군 3개·섀시 21개·카드 26개, LocalStorage key, schema와 catalog version을 검사한다.

## 2. 빌드 및 정적 참조

```text
node scripts/package-site.cjs
Static site prepared in dist/
dist files: 60
```

- `dist/products/index.html`: 생성 확인
- `dist/tools/matrix-configurator/index.html`: 생성 확인
- 조사한 정적·동적 참조 48개: literal 파일, route, runtime asset 규칙으로 분류해 누락 0
- 브라우저 console warning/error: 0
- 제품 카드 첫 이미지와 현재 구성기 표시 이미지: 로드 완료

## 3. 경로와 브라우저 동작

| 시나리오 | 결과 |
|---|---|
| `/` direct load | PASS, 포털 홈과 두 진입점 표시 |
| `/products` direct load와 refresh | PASS, 카드 31개·탭 6개 표시 |
| `/tools/matrix-configurator` direct load와 refresh | PASS, 구성 단계 6개 표시 |
| 홈 → 제품 → 구성기 | PASS, 앱 내부 이동 |
| 구성기 → 뒤로 → 제품 → 앞으로 → 구성기 | PASS |
| 경로 이동 뒤 구성 화면 요약 | PASS, `XDM / XDM-20` 상태 유지 확인 |
| 구성기 refresh 뒤 자동 복원 | PASS, 기존 저장 구성 복원 메시지와 동일 요약 확인 |
| 기존 `/#matrix-configurator` | PASS, 구성기 clean path로 단방향 변환 |
| 알 수 없는 로컬 app path | PASS, HTTP 404 또는 router 홈 fallback 정책 |

## 4. GitHub Pages base path

빌드 결과를 `http://127.0.0.1:4174/rtcom-av-design/` 아래에 마운트해 검사했다.

| URL | 결과 |
|---|---|
| `/rtcom-av-design/` | PASS, CSS와 홈 표시 |
| `/rtcom-av-design/products` | 301 directory canonicalization 후 200 |
| `/rtcom-av-design/products/` | PASS, 카드 31개와 제품 이미지 |
| `/rtcom-av-design/tools/matrix-configurator` | 301 후 200 |
| `/rtcom-av-design/tools/matrix-configurator/` | PASS, 단계 6개와 표시 이미지 |

router가 만든 제품 링크도 `/rtcom-av-design/products`로 확인했다. 루트 도메인의 잘못된 `/products`를 가리키지 않는다.

## 5. 데이터와 저장 호환성

| 계약 | 기준 | 결과 |
|---|---|---|
| 제품·시리즈 | 31 | 31, PASS |
| 데이터 카테고리/UI 탭 | 5/6 | 5/6, PASS |
| 제품군/섀시/카드 | 3/21/26 | 3/21/26, PASS |
| LocalStorage key | `rtcom.configuration.v1` | 변경 없음 |
| JSON schema | 3 | 변경 없음 |
| `catalogVersion` | `2026-09-18-draft.1` | 변경 없음 |
| 슬롯 ID | 기존 `in-n` / `out-n` | core 미변경, 기존 테스트 PASS |

`src/core.js`와 `src/catalog.js`의 SHA-256은 기준 커밋과 각각 동일하다. `library.js` 제품 배열 block의 SHA-256도 기준과 동일한 `e2c0412d1a68ee1274fceedcc98035686cded26dbe09ce39535f1ee9d066e034`다.

## 6. 접근성과 반응형 육안 검사

- semantic `nav`와 `aria-current="page"`: PASS
- Tab 순서: 브랜드 홈 → 홈 → 제품 → 설계 도구로 이동 확인
- 제품 상세 dialog 열기·닫기와 PDF page fragment: PASS
- 320px 홈·제품·구성기: 문서 가로 overflow 없음. 구성 단계 nav는 내부 가로 스크롤 제공
- 768px 제품: 2열, 카드 31개, 문서 overflow 없음
- 1440px 홈: 두 진입점, 문서 overflow 없음

## 7. 미자동화 범위

브라우저 인쇄 대화상자의 실제 PDF 파일 생성과 JSON 파일 선택기 업로드는 외부 UI를 열기 때문에 기존 core round-trip·CSV 테스트로 계약을 검증했다. 공개 Pages 배포는 PHASE 1 비범위라 실행하지 않았다.
