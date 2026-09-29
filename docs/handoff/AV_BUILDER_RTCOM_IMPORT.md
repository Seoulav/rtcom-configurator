# AV 빌더 "rtcom 구성 받기" 작업 안내 (B안)

사용자 결정 2026-09-29: "포트명 기입이 끝나면은 링크av 빌더에 똑같은 구성으로 자동 생성되게 해줘" → "B가 내가 원하는거야"(한 번에 열기).

rtcom 구성기(`Seoulav/rtcom-configurator`, 0.174부터)는 이미 준비되어 있습니다. 이 문서는 **AV 빌더 저장소(`seoul-visual-tech/av-system-builder`)에서 해야 할 일**입니다. 그 저장소는 rtcom 작업 세션에서 권한이 없어 직접 고치지 못했습니다.

## 1. 약속(두 창 사이 메시지)

| 순서 | 보내는 쪽 → 받는 쪽 | 메시지 | 비고 |
|---|---|---|---|
| 1 | rtcom | `window.open('https://seoul-visual-tech.github.io/av-system-builder/?import=rtcom')` | 새 탭. `noopener`를 쓰지 않아 AV 빌더에서 `window.opener`가 rtcom 창입니다. |
| 2 | AV 빌더 → rtcom | `{type:'av-builder:ready'}` | 대상 origin `https://seoulav.github.io` |
| 3 | rtcom → AV 빌더 | `{type:'rtcom:diagram', version:1, source:'RTCOM Configurator', diagram}` | 대상 origin `https://seoul-visual-tech.github.io`. `diagram`은 "가져오기 → 구성도 JSON" 파일과 같은 `{nodes, edges, meta}` |
| 4 | AV 빌더 → rtcom | `{type:'av-builder:imported', nodes:<개수>, edges:<개수>}` | rtcom이 "AV 빌더에 구성을 넣었습니다"를 표시 |

- 양쪽 모두 `event.origin`이 상대 사이트일 때만 받습니다. AV 빌더는 `event.source === window.opener`도 확인합니다.
- rtcom은 10초 안에 2번이 오지 않으면 같은 파일을 내려받게 하고 "Share → 가져오기 → 구성도 JSON"으로 열라고 안내합니다. 그래서 AV 빌더에 이 기능이 들어가기 전에도 동작합니다.
- `diagram` 형식: rtcom `src/core.js`의 `RtCore.avBuilder()`(설명은 `docs/implementation/SIGNAL_INPUT_0.173.md` §5).

## 2. AV 빌더에 넣을 코드(예시)

AV 빌더 공개 스크립트(v1.19.1)를 보면 구성도 상태 저장소에 `importDiagramState(diagram)`가 있고, "가져오기 → 구성도 JSON"이 이 함수를 부릅니다. 같은 함수를 부르면 됩니다. 아래 경로·이름은 저장소 구조에 맞게 바꿉니다.

```ts
// src/hooks/useRtcomImport.ts
import { useEffect } from 'react';
import { useDiagramStore } from '../store/diagramStore'; // importDiagramState가 있는 저장소

const RTCOM_ORIGIN = 'https://seoulav.github.io';

export function useRtcomImport() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('import') !== 'rtcom' || !window.opener) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== RTCOM_ORIGIN || event.source !== window.opener) return;
      const message = event.data;
      if (!message || message.type !== 'rtcom:diagram' || message.version !== 1) return;
      const diagram = message.diagram;
      if (!diagram || !Array.isArray(diagram.nodes) || !Array.isArray(diagram.edges)) return;
      if (diagram.nodes.length > 2000 || diagram.edges.length > 5000) return; // 비정상적으로 큰 입력 거부
      if (!diagram.nodes.every((n: any) => n && n.type === 'equipment' && n.data)) return;

      useDiagramStore.getState().importDiagramState(diagram);
      window.opener.postMessage(
        { type: 'av-builder:imported', nodes: diagram.nodes.length, edges: diagram.edges.length },
        RTCOM_ORIGIN,
      );
      window.removeEventListener('message', onMessage);
      window.history.replaceState({}, '', window.location.pathname);
    };

    window.addEventListener('message', onMessage);
    window.opener.postMessage({ type: 'av-builder:ready' }, RTCOM_ORIGIN);
    return () => window.removeEventListener('message', onMessage);
  }, []);
}
```

- `App` 최상단(이미 `?share=`·`?preset=`을 읽는 `useEffect` 근처)에서 `useRtcomImport()`를 한 번 부릅니다.
- 불러온 뒤 화면 맞춤(Fit View)을 한 번 실행하면 전체 구성이 한눈에 보입니다.
- 이미 그려 둔 구성이 있으면 덮어쓰므로, 필요하면 불러오기 전에 확인 창을 띄웁니다(현재 파일 가져오기와 같은 동작).

## 3. 확인 방법

1. AV 빌더에 위 코드를 넣고 배포합니다.
2. https://seoulav.github.io/rtcom-configurator/ 에서 카드를 꽂고 03 ② 신호 입력 아래 **AV 빌더에서 바로 열기**를 누릅니다.
3. 새 탭의 AV 빌더에 같은 구성이 그려지고, rtcom 창 위쪽 저장 안내 줄에 "AV 빌더에 구성을 넣었습니다 · 장비 N대 · 연결 M개"가 나오면 완료입니다.

rtcom 쪽 자동 검사(`scripts/e2e-smoke.cjs`)는 가짜 AV 빌더 창으로 1~4번 흐름과 10초 대체 동작(파일 내려받기)을 확인합니다.
