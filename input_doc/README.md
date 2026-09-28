# input_doc — 자료 넣는 곳 (로컬 전용)

이 폴더에 매뉴얼·카탈로그·제품 안내서·도면·제품 사진을 **아무 이름으로나** 넣어 두면, 로컬 Claude Code가 내용을 읽어 분류합니다.

- 이 README만 Git에 올라가고, 이 폴더에 넣은 자료는 **Git에 올라가지 않습니다**(`.gitignore`). 다른 컴퓨터나 클라우드 세션에서는 보이지 않습니다.
- Claude Code를 이 저장소에서 새로 시작하면 새 자료가 있는지 자동으로 알려 주고, 첫 요청을 처리할 때 먼저 정리합니다. 바로 시키려면 "input_doc 정리해"라고 말하면 됩니다.

## Claude가 하는 일

1. 파일 내용(표지·사양표·사진)을 읽어 제조사·종류·모델·판 번호를 확인합니다.
2. 제조사 폴더로 옮기며 이름을 바꿉니다.
   - 예: `13U 설명서 최종.pdf` → `RTCOM/manual/RTcom_Manual_HD-13U_Ver1.2.pdf`
   - 예: `KakaoTalk_2026.jpg` → `RTCOM/photo/RTcom_Photo_OBUX-1C_Tx-Rear.jpg`
3. 필요한 곳에 반영합니다: 제품 사진 교체, 매뉴얼 근거 사양 정정 등.
4. 모든 이동은 `INDEX.md`에 기록합니다. 내용이 같은 파일은 `_duplicates/`로 옮기며, 파일을 지우지 않습니다.
5. **어떤 자료가 Git·사이트에 반영됐는지는 `STATUS.md`에서 봅니다.** 📄 PDF 공개 · ✅ 사이트에 반영(사양 값 등) · ⏳ 검토 전 · ☑️ 같은 판(이미 반영, 변경 없음) · 🗄️ 보관만. Claude Code 세션을 시작할 때마다 자동으로 새로 만들어집니다(기준 장부: `docs/evidence/input-doc-ledger.json`).
   - 원본 파일 자체는 Git에 올라가지 않습니다. "사이트에 반영"은 자료에서 읽은 값(사양·EDID 등)을 저장소에 옮겨 적었다는 뜻입니다.

**공개 사이트에 PDF를 올리는 일(제품 상세 "카탈로그 PDF·매뉴얼 PDF" 버튼)은 되돌릴 수 없어서, 올릴 목록을 먼저 보여 주고 확인을 받은 뒤에만 합니다.**

## 폴더 모양

```
input_doc/
  README.md          ← 이 파일(Git에 올라감)
  (새 자료를 여기에 넣기)
  INDEX.md           ← 분류 기록(로컬)
  STATUS.md          ← 파일별 반영 표시(로컬, 자동 생성)
  RTCOM/
    manual/  catalog/  sheet/  drawing/  photo/  other/
  _duplicates/       ← 이미 있는 파일과 내용이 같은 자료
  _unsorted/         ← 제조사를 판단하지 못한 자료(Claude가 물어봄)
```

자세한 절차: `.claude/skills/input-doc/SKILL.md`, `docs/implementation/LOCAL_INPUT_DOC_WORKFLOW.md`
