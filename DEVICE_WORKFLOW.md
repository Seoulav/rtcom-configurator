# 두 컴퓨터에서 이어서 개발하기

GitHub 저장소가 두 컴퓨터 사이에서 소스 파일과 Git 기록을 전달합니다. Codex 대화 기록과 브라우저의 자동 저장 데이터는 GitHub로 자동 전송되지 않습니다.

## 새 컴퓨터에서 처음 시작할 때

```sh
git clone https://github.com/hkkim0454/rtcom-configurator.git
cd rtcom-configurator
npm test
```

비공개 저장소이므로 처음 한 번은 GitHub 로그인이 필요합니다.

## 작업을 시작할 때

```sh
git pull --ff-only
```

이 명령은 다른 컴퓨터에서 저장한 최신 변경 내용을 가져옵니다. 커밋하지 않은 변경이 있다면 먼저 `git status`로 상태를 확인하세요.

## 작업을 마칠 때

```sh
npm test
git status
git add .
git commit -m "작업 내용 요약"
git push
```

다른 컴퓨터에서 알아야 할 결정이나 남은 작업은 `HANDOFF.md`에도 기록한 뒤 함께 커밋하세요. `git push`가 성공해야 다른 컴퓨터에서 변경 내용을 받을 수 있습니다.

## 앱의 브라우저 저장 데이터

브라우저 자동 저장 데이터는 컴퓨터마다 따로 보관됩니다. 앱에서 만든 구성을 다른 컴퓨터로 옮길 때에는 JSON 백업을 내려받아 안전한 위치로 옮긴 다음, 다른 컴퓨터의 앱에서 불러오세요.
