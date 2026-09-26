# RTCOM Matrix Configurator

**현재 버전: 0.8** · XDM·SPX·VDM 매트릭스의 프레임과 카드 슬롯을 구성하는 내부 검토용 도구입니다.

프레임을 고르고 실제 슬롯 위치에 입력·출력 카드를 장착한 뒤, 전송기와 BOM을 검토하고 JSON·CSV·인쇄 보고서로 내보냅니다. 제품 소개·검색 정보는 [AV Portal](https://seoulav.github.io/AV-Portal/)에서 제공하므로 0.7부터 이 사이트는 구성기만 담당합니다. 실제 슬롯·설치 허용표와 전원·케이블 조건은 확정 전이며, 모든 내보내기는 `UNVERIFIED_DRAFT`로 표시합니다.

## 처음 사용하는 방법

1. 터미널에서 프로젝트 폴더로 이동합니다.
2. `node scripts/serve.cjs`를 실행합니다.
3. 브라우저에서 [http://127.0.0.1:4173](http://127.0.0.1:4173)을 엽니다.

외부 패키지를 설치하지 않아도 실행할 수 있습니다. 첫 화면(`/`)이 바로 구성기입니다. 0.6에서 쓰던 `/products`, `/tools/matrix-configurator` 주소로 들어오면 구성기 첫 화면으로 자동 이동합니다.

GitHub Pages 공개 사이트는 [hkkim0454.github.io/rtcom-av-design](https://hkkim0454.github.io/rtcom-av-design/)에서 확인할 수 있습니다. 공개 사이트의 저장소와 원본 소스 저장소는 역할이 다르므로, 자세한 운영 규칙은 [`CLAUDE.md`](CLAUDE.md)를 확인하세요.

## 실행 명령

Node.js가 설치된 환경에서 `node scripts/serve.cjs` 후 http://127.0.0.1:4173 에 접속합니다. npm을 사용할 수 있으면 `npm start`도 가능합니다. 또는 `index.html`을 브라우저에서 직접 열 수 있습니다. 자동 저장의 안정성을 위해 로컬 서버 실행을 권장합니다. 외부 패키지 설치는 필요하지 않습니다.

맥북과 데스크톱을 오가며 작업하는 절차는 [`DEVICE_WORKFLOW.md`](DEVICE_WORKFLOW.md)를 확인하세요.

## 제공하는 기능

- 제품군 → 섀시 → 카드 슬롯 → 전송기 → 검토 → 내보내기 6단계.
- 섀시를 전면 사진 카드로 고르고, 후면 랙 그림의 빈 슬롯을 누르면 카드 선택 팝업이 열립니다. XDM-12~144는 매뉴얼의 실제 후면 사진 위에 슬롯이 겹쳐 표시되며, 장착한 슬롯에는 실제 카드 후면 판넬 사진이 들어가고, 오른쪽에 구성 요약(카드별 수량, 채널 사용량)이 표시됩니다.
- 브라우저 자동 저장, JSON 백업·복원, 최근 100회 실행 취소·다시 실행.
- XDM 매뉴얼 기준으로 XDM-12/20/36/72/144/216의 입력·출력 슬롯 수와 좌우·상하 배치를 적용하며 각 카드를 4채널로 계산.
- XDM-12/20/36/72/144는 매뉴얼의 실제 후면 사진을 모델별로 표시.
- 빈 슬롯을 누르면 방향에 맞는 카드만 표시하고, 선택한 카드의 카탈로그 이미지를 슬롯에 즉시 반영.
- 모델·슬롯 방향·카드·전송 장비 수량 검증 및 불러오기 실패 시 기존 구성 보존.
- 포트에 배정된 TX/RX를 모델별 BOM 수량으로 합산.
- UTF-8 BOM CSV, 버전이 있는 JSON, 인쇄 / PDF 저장용 보고서.
- 반응형 화면, 한국어 안내, 키보드 포커스 복원.

브라우저 저장은 기기와 사이트 주소별로 분리됩니다. 로컬 주소에서 GitHub Pages로 옮길 때 JSON으로 백업한 뒤 불러오세요. 온라인 계정 저장·기기 간 자동 동기화는 구현하지 않았습니다.

## 데이터와 검증 상태

`npm test`로 사이트 구성(구성기 단일 화면, 옛 주소 이동, 이미지 자산 존재)과 모델별 슬롯 제한, 카드당 4채널, 파일 복원, JSON 마이그레이션과 BOM을 검사합니다. JSON 스키마 3은 모델별 슬롯을 저장하며, 스키마 1·2의 기존 슬롯 이름은 새 이름으로 변환합니다. 프레임레이트·거리·개별 포트 요구 입력은 현재 검토 목적에서 제외했습니다. XDM-288 및 제조사 근거가 없는 카드·TX/RX 관계는 `UNVERIFIED`로 유지합니다.

`npm run e2e`는 배포본을 만든 뒤 실제 브라우저로 카드 장착, 이미지 표시, 자동 저장 복원, 옛 주소 이동을 확인합니다. `playwright` 패키지가 필요하며(`npm i --no-save playwright`), 없으면 검사를 건너뛰고 안내만 출력합니다.

## 배포 구조

현재 구조는 정적 사이트이므로 GitHub Pages에서 컴퓨터를 끈 상태에서도 이용할 수 있습니다. 저장소의 Settings → Pages에서 GitHub Actions를 선택하고, `Deploy RTCOM to GitHub Pages` 작업을 실행합니다.

`node scripts/package-site.cjs`가 배포용 `dist/`를 만듭니다. 카탈로그 PDF 및 원본 디자인 보관본은 배포 패키지에서 제외합니다. 카드·후면 이미지는 제공 카탈로그와 매뉴얼에서 추출한 자산으로, 공개 배포 전에 사용 권한 범위를 확인해야 합니다(근거 문서 G14). 저장소를 공개하면 배포에 포함하지 않은 파일도 공개될 수 있으므로 저장소 공개 범위와 자료 권한을 함께 확인하세요.

## 개발 문서

- [`CHANGELOG.md`](CHANGELOG.md): 버전별 변경 기록
- [`CLAUDE.md`](CLAUDE.md): AI 세션과 개발 작업 운영 규칙
- [`DEVICE_WORKFLOW.md`](DEVICE_WORKFLOW.md): 맥북과 데스크톱을 오가며 작업하는 방법
- [`docs/audit/`](docs/audit/): 감사·마이그레이션·완료 보고서
- [`docs/implementation/`](docs/implementation/): 구현 기록
- [`docs/qa/`](docs/qa/): 테스트와 QA 기록

## 파일 구성

- `index.html`, `src/`: 현재 앱.
- `docs/`: 기존 계획과 제품 근거 자료.
- `output/design/`: 가져온 디자인 원본 보관본.
- `scripts/serve.cjs`: 로컬 서버.
- `scripts/package-site.cjs`: 정적 배포 패키지 생성.
- `scripts/e2e-smoke.cjs`: 배포본 브라우저 검사.
- `scripts/tools/prepare_xdm_images.py`: 사용자 제공 XDM 카드 판넬·XDM-12 전면 원본 사진을 웹용 WebP로 가공(Pillow 필요, 원본은 저장소에 넣지 않음).
- `scripts/tools/extract_manual_frames.py`: XDM 국문 매뉴얼 PDF에서 프레임 전면·후면 사진을 추출(pymupdf, Pillow 필요).
- `tests/`: 핵심 로직과 사이트 구성 테스트.

`scripts/build-from-draft.cjs`는 초기 이관에 사용한 스크립트입니다. 앱을 수정한 뒤 다시 실행하면 `src/app.js`, `src/styles.css`, `index.html`을 재생성하므로 일반 개발에는 필요하지 않습니다.
