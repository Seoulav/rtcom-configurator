// 0.206 한국어 응답 강제 훅(scripts/korean-reply-hook.cjs) 판정 테스트.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const hook = require('../scripts/korean-reply-hook.cjs');

function transcript(rows) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'korean-hook-')), 't.jsonl');
  fs.writeFileSync(file, rows.map(row => JSON.stringify(row)).join('\n') + '\n');
  return file;
}
const say = text => ({ type: 'assistant', message: { content: [{ type: 'text', text }] } });

test('영어 답변은 막고 한국어 답변·짧은 혼용 답변은 통과시킴', () => {
  assert.equal(hook.isEnglishReply('The two new notifications only confirm that the PR was merged and the deploy check is still running in the background.').english, true);
  assert.equal(hook.isEnglishReply('PR #306을 병합했습니다. XDM-WOS100·HOS100 팝업과 `src/app.js` 변경, HDMI 4K/60 @ 4:4:4 표기, Signal Flow와 Port Map 이름은 그대로 둡니다.').english, false);
  assert.equal(hook.isEnglishReply('Merge 완료. PR checks green.').english, false);
  assert.equal(hook.isEnglishReply('').english, false);
});

test('코드 블록·주소·경로·모델명은 영어 글자로 세지 않음', () => {
  const text = '설정을 바꿨습니다.\n```bash\nnode scripts/package-site.cjs && node scripts/e2e-smoke.cjs --verbose all the english words here\n```\nhttps://seoulav.github.io/rtcom-configurator/ XDM-CTR100 QMS-88UX';
  assert.equal(hook.measure(text).latin, 0);
});

test('Stop: 마지막 사용자 입력 뒤의 마지막 답변만 보고, 다시 쓰는 중(stop_hook_active)에는 막지 않음', () => {
  const english = transcript([
    { type: 'user', message: { content: '요청' } },
    say('중간 안내입니다.'),
    { type: 'user', message: { content: [{ type: 'tool_result', content: 'ok' }] } },
    say('Everything is merged and deployed. The public site now shows the new version and the check passed without errors.')
  ]);
  const blocked = hook.handle({ hook_event_name: 'Stop', stop_hook_active: false, transcript_path: english });
  assert.equal(blocked.decision, 'block');
  assert.match(blocked.reason, /한국어로 다시 작성/);
  assert.equal(hook.handle({ hook_event_name: 'Stop', stop_hook_active: true, transcript_path: english }), null);
  const korean = transcript([{ type: 'user', message: { content: '요청' } }, say('병합과 배포를 마쳤습니다. 공개 주소에서 새 버전을 확인했습니다.')]);
  assert.equal(hook.handle({ hook_event_name: 'Stop', stop_hook_active: false, transcript_path: korean }), null);
  const fresh = transcript([say('Old English reply that should not count because a new prompt came after it.'), { type: 'user', message: { content: '새 요청' } }]);
  assert.equal(hook.handle({ hook_event_name: 'Stop', stop_hook_active: false, transcript_path: fresh }), null);
});

test('UserPromptSubmit: 한국어 규칙 알림을 문맥에 넣음', () => {
  const out = hook.handle({ hook_event_name: 'UserPromptSubmit', prompt: 'x' });
  assert.equal(out.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
  assert.match(out.hookSpecificOutput.additionalContext, /한국어/);
});

test('.claude/settings.json이 두 훅과 language를 연결함', () => {
  const settings = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.claude', 'settings.json'), 'utf8'));
  assert.equal(settings.language, 'korean');
  for (const event of ['UserPromptSubmit', 'Stop']) {
    assert.ok(settings.hooks[event].some(group => group.hooks.some(h => h.command.includes('scripts/korean-reply-hook.cjs'))), event);
  }
});
