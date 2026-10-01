# GitHub 필수 검사 설정 확인 (2026-10-01)

## 무엇을 했는가

사용자(이사님)가 GitHub 설정 화면(Settings → Rules → Rulesets)에서 `main 보호` ruleset을 만들고 `main`을 대상으로 지정했습니다. 순서는 `docs/implementation/TOUCH_SLOT_X_AND_CI_0.165.md` §2를 따랐습니다. 이 설정은 0.165에서 요청한 "GitHub 필수 검사 설정 검토"의 마지막 단계입니다.

처음에는 대상 브랜치(Target branches)를 지정하지 않고 저장해 화면에 "This ruleset does not target any resources and will not be applied" 경고가 떴습니다. 같은 화면에서 `Include default branch`를 추가하고 다시 저장해 해소했습니다.

## 확인 방법과 결과

저장소가 `main`에 실제로 적용 중인 규칙을 GitHub 공개 API로 조회했습니다(인증 없이 읽을 수 있는 조회입니다).

```
GET /repos/Seoulav/rtcom-configurator/rules/branches/main
```

결과(ruleset_id 24279730, 출처 `Seoulav/rtcom-configurator`):

| 규칙 | 값 | 뜻 |
|---|---|---|
| `required_status_checks` | `verify`, `integration_id` 15368 | GitHub Actions의 `RTCOM checks / verify`를 통과해야 병합 가능 |
| `strict_required_status_checks_policy` | `true` | 최신 `main`을 합친 PR만 병합 가능(버전 번호 겹침 방지) |
| `deletion` | 적용 | `main` 브랜치 삭제 금지 |
| `non_fast_forward` | 적용 | `main` 강제 push 금지 |

Bypass list(예외 목록)는 비어 있어 관리자 계정도 검사를 건너뛰지 못합니다.

## 영향

- 검사가 통과하지 않은 PR은 병합 버튼이 막힙니다. Claude는 이전과 같이 검사 통과를 확인한 뒤 병합합니다.
- `main`이 바뀐 PR은 최신 `main`을 합친 뒤 검사를 다시 통과해야 합니다.
- `main`에 바로 올리는 방식(GitHub 화면에서 직접 파일 올리기 등)은 막힐 수 있으므로, 그때는 PR을 거칩니다.

## 되돌리는 방법

Settings → Rules → Rulesets에서 `main 보호`를 열어 Enforcement status를 Disabled로 바꾸거나 삭제합니다. 필수 검사를 켠 채로 `RTCOM checks` 워크플로를 지우거나 이름을 바꾸면 사라진 검사를 계속 기다리므로, 그런 변경 전에는 먼저 ruleset을 끕니다.

## 남은 위험

- 실제 병합에서 규칙이 의도대로 막고 푸는지는 다음 PR에서 확인합니다.
- `CLAUDE.md`의 "GitHub 자동 검사(0.165부터)" 문단에는 "필수 검사 설정은 사용자가 GitHub 설정 화면에서 켭니다"라고 적혀 있습니다. 이미 켠 상태가 되었으므로, `docs/` 밖 파일을 바꾸는 다음 기능 PR에서 함께 고칩니다(문서만 바뀐 PR은 버전을 올리지 않는 규칙 때문에 이번에는 건드리지 않았습니다).
