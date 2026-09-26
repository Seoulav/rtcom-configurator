# RTCOM 프로젝트 작업 규칙

이 문서는 새로운 AI 세션이나 개발자가 프로젝트를 이어받을 때 사용하는 운영 기준입니다. 저장소에 이미 있는 `AGENTS.md`의 한국어 작성 지침과 함께 적용합니다.

## 저장소 역할

- 원본 소스: `Seoulav/rtcom-configurator`
- 공개 배포: `hkkim0454/rtcom-av-design`
- 두 저장소는 공통 Git 조상이 없습니다. `git merge --allow-unrelated-histories`를 사용하지 않습니다.
- 원본 소스의 검증된 build 산출물만 공개 배포 저장소로 이식합니다.

## 작업 순서

1. 요청을 받으면 현재 브랜치, HEAD, `git status`, 관련 문서와 테스트 기준을 먼저 확인합니다.
2. 여러 기능을 한 번에 요청받으면 구현 전에 작업 계획, 영향 범위, 검증 방법을 한국어로 설명합니다.
3. 계획과 범위가 정해지면 관련 없는 사용자 변경을 건드리지 않고 작업합니다.
4. 코드, 데이터, 문서 변경 후 테스트·validator·build·정적 참조 검사를 실행합니다.
5. 검증이 통과한 변경을 논리적인 단위로 커밋하고, PR을 만든 뒤 결과를 보고합니다.
6. 자동 merge와 공개 Pages 배포는 별도의 사용자 승인이 있을 때만 수행합니다.

## 사용자에게 설명하는 방법

- 개발 용어가 필요한 경우 먼저 쉬운 말로 뜻과 영향을 설명합니다.
- 사용자의 결정이 필요한 경우 선택지, 추천안, 예상 영향, 되돌리는 방법을 함께 제시합니다.
- 위험하거나 되돌리기 어려운 작업은 실행 직전에 다시 알립니다.
- 스스로 판단할 수 있는 읽기·검증·문서화 작업은 중단하지 않고 진행합니다.

## 호환성 계약

다음 항목은 명시적인 변경 계획과 검증 없이 바꾸지 않습니다.

- 구성기 제품군·섀시·카드 3/22/26 (0.12에서 VDM-256X 추가, 사용자 결정 2026-09-26)
- `rtcom.configuration.v1` LocalStorage key
- JSON schema 3
- `catalogVersion`
- 슬롯 ID와 기존 `#matrix-configurator` 주소
- 0.6 포털 주소(`/products`, `/tools/matrix-configurator`)의 구성기 첫 화면 이동
- 슬롯 표가 있는 프레임(XDM·SPX·VDM)의 예전 논리 슬롯(in-a·in-b·out-a·out-b)은 불러올 때 실제 슬롯 1·2로 변환합니다(0.10부터 SPX·VDM 포함).

0.7부터 제품 라이브러리(31개 제품·5개 카테고리)와 카탈로그 PDF 배포는 AV portal과 중복되어 제거했습니다. 근거와 영향 범위는 `docs/audit/SITE_SCOPE_REVIEW.md`에 있습니다.

## 버전과 기록

- 현재 화면 버전은 `index.html`의 우측 상단 표기와 `README.md`에 함께 기록합니다.
- 원본 `main`에 기능 묶음을 병합할 때 마이너 버전을 올리고, 같은 커밋에서 `CHANGELOG.md`를 갱신합니다.
- 구성기 단일 화면 전환은 `0.7.0`, Analog Way 방식 화면 개편은 `0.8.0`, 전송기 자동 연동은 `0.9.0`, HDMI 카드 PSE 쌍 연장은 `0.10.0`, SPX 매뉴얼 사진 슬롯은 `0.11.0`, VDM-256X 추가는 `0.12.0`, VDM 매뉴얼 후면 도면 슬롯은 `0.13.0`, 휴대폰 슬롯 겹침·뒤로가기 수정은 `0.14.0`으로 기록했습니다. 다음 기능 묶음은 `0.15.0`을 목표로 하며, 실제 병합 전에는 검증된 canonical main commit을 확인합니다.
- 모든 작업은 구현 문서, QA 문서 또는 감사 문서에 근거와 결과를 남깁니다.

## Git 명령 정책

- 일반적인 `commit`, `push`, PR 생성과 상태 확인은 작업 범위에 포함되면 직접 수행합니다.
- `reset --hard`, `clean`, force push, 강제 checkout, 저장소 삭제는 사용하지 않습니다.
- 공개 저장소 `main`에 직접 Push하지 않습니다.
- PR merge와 Pages 배포는 사용자의 최종 승인을 받은 뒤에만 수행합니다.

## 기본 검증 명령

```bash
node --test tests/*.test.cjs
node scripts/package-site.cjs
node scripts/e2e-smoke.cjs   # playwright가 있을 때 (없으면 exit 2로 건너뜀)
git diff --check
```

검증 결과와 미해결 위험을 완료 보고에 기록하고, 다음 세션이 같은 내용을 다시 조사하지 않아도 되도록 변경 이유와 rollback 방법을 함께 남깁니다.
