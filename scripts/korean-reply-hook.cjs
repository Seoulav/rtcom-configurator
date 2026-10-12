#!/usr/bin/env node
// 0.206 한국어 응답 강제 훅(사용자 지시 2026-10-12 "제발 한글로 설명해줘 이건 너무 자주 어긴다", "한국어 규칙을 시스템으로 강제하기 진행해").
// .claude/settings.json의 두 훅이 이 스크립트를 부른다.
// - UserPromptSubmit: 사용자가 요청을 보낼 때마다 "보이는 글은 한국어로" 알림을 모델 문맥에 넣는다.
// - Stop: 답변을 끝내기 직전에 마지막 답변의 한글 비율을 재고, 대부분 영어면 끝내지 못하게 막아 한국어로 다시 쓰게 한다.
//   다시 쓰는 중(stop_hook_active)에는 막지 않아 무한 반복이 생기지 않는다.
// 어떤 오류가 나도 세션을 막지 않도록 조용히 종료 코드 0으로 끝낸다.
const fs = require('node:fs');

const REMINDER = '[한국어 규칙] 사용자에게 보이는 모든 글(중간 진행 안내, 알림 확인, 질문, 최종 보고)은 한국어로 씁니다. '
  + '코드·명령·파일 이름·모델명·커밋 메시지 관례는 그대로 둡니다(CLAUDE.md "처리 과정은 반드시 한국어로").';
const MIN_LATIN = 40;      // 이보다 영어 글자가 적으면 짧은 답이라 검사하지 않는다.
const MIN_HANGUL_RATIO = 0.35; // 한글 ÷ (한글 + 영어 글자)가 이보다 낮으면 영어 답변으로 본다.
const TAIL_BYTES = 4 * 1024 * 1024;

// 코드 블록·인라인 코드·주소·파일 경로·숫자가 섞인 낱말(모델명 XDM-WOS100 등)·대문자 약어(HDMI 등)는 영어로 세지 않는다.
function prose(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/\]\([^)]*\)/g, '] ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\S*[\/\\]\S*/g, ' ')
    .replace(/[A-Za-z0-9_.+-]*\d[A-Za-z0-9_.+-]*/g, ' ')
    .replace(/\b[A-Z][A-Z0-9_-]+\b/g, ' ');
}

function measure(text) {
  const body = prose(text);
  const hangul = (body.match(/[가-힣]/g) || []).length;
  const latin = (body.match(/[A-Za-z]/g) || []).length;
  return { hangul, latin, ratio: hangul + latin ? hangul / (hangul + latin) : 1 };
}

function isEnglishReply(text) {
  const m = measure(text);
  return { english: m.latin >= MIN_LATIN && m.ratio < MIN_HANGUL_RATIO, ...m };
}

// 대화 기록(JSONL) 끝에서부터 읽어, 마지막 사용자 입력 뒤에 나온 답변 글 중 가장 마지막 것을 돌려준다.
function lastAssistantText(transcriptPath) {
  const fd = fs.openSync(transcriptPath, 'r');
  try {
    const size = fs.fstatSync(fd).size, start = Math.max(0, size - TAIL_BYTES), buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    const lines = buf.toString('utf8').split('\n');
    if (start > 0) lines.shift();
    for (let i = lines.length - 1; i >= 0; i--) {
      let entry;
      try { entry = JSON.parse(lines[i]); } catch { continue; }
      if (entry.isSidechain) continue;
      const content = entry.message && entry.message.content;
      if (entry.type === 'user') {
        const prompt = typeof content === 'string' || (Array.isArray(content) && content.some(block => block.type === 'text'));
        if (prompt) return '';
        continue;
      }
      if (entry.type !== 'assistant' || !Array.isArray(content)) continue;
      const text = content.filter(block => block.type === 'text').map(block => block.text).join('\n').trim();
      if (text) return text;
    }
    return '';
  } finally { fs.closeSync(fd); }
}

function handle(input) {
  const event = input.hook_event_name;
  if (event === 'UserPromptSubmit') {
    return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: REMINDER } };
  }
  if (event === 'Stop' || event === 'SubagentStop') {
    if (input.stop_hook_active) return null;
    const text = typeof input.last_assistant_message === 'string' ? input.last_assistant_message
      : input.transcript_path ? lastAssistantText(input.transcript_path) : '';
    const result = isEnglishReply(text);
    if (!result.english) return null;
    return {
      decision: 'block',
      reason: `마지막 답변이 영어로 작성되었습니다(한글 비율 ${Math.round(result.ratio * 100)}%). `
        + '사용자 지시와 CLAUDE.md 규칙에 따라 같은 내용을 한국어로 다시 작성해 답변을 마치세요. '
        + '코드·명령·파일 이름·모델명은 그대로 둡니다.'
    };
  }
  return null;
}

if (require.main === module) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { raw += chunk; });
  process.stdin.on('end', () => {
    try {
      const output = handle(raw.trim() ? JSON.parse(raw) : {});
      if (output) process.stdout.write(JSON.stringify(output));
    } catch { /* 훅 오류로 세션을 막지 않는다 */ }
    process.exit(0);
  });
}

module.exports = { prose, measure, isEnglishReply, lastAssistantText, handle, REMINDER };
