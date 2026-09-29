// Cloudflare Worker 진입점. 실제 처리는 core.js에 있다.
import Anthropic from '@anthropic-ai/sdk';
import {handle} from './core.js';

export default {
  fetch(request, env, ctx) {
    return handle(request, env, {ctx, createClient:workerEnv=>new Anthropic({apiKey:workerEnv.ANTHROPIC_API_KEY, maxRetries:2})});
  }
};
