import type { VercelRequest, VercelResponse } from '@vercel/node';

const DIFY_API_URL = 'http://150.158.57.162:8081/v1/chat-messages';
const DIFY_API_KEY = 'app-oYVKHjo6fnc6CNOjUwD6uYqc';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, conversation_id, user } = request.body;

    if (!query) {
      return response.status(400).json({ error: 'Query is required' });
    }

    // 使用 streaming 响应模式，支持打字机效果
    const res = await fetch(DIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        inputs: {},
        response_mode: 'streaming',
        user: user || 'website-user',
        conversation_id: conversation_id || '',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Dify API error:', errorData);
      return response.status(res.status).json({ error: 'Dify API error', details: errorData });
    }

    // 设置 SSE 流式响应头
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Transfer-Encoding', 'chunked');

    // 获取流式 reader
    const reader = res.body?.getReader();
    if (!reader) {
      return response.status(500).json({ error: 'Failed to get response reader' });
    }

    const decoder = new TextDecoder();
    let buffer = '';

    // 读取并转发流
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          response.write(`data: ${line}\n\n`);
        }
      }
    }

    // 发送结束信号
    response.write('data: [DONE]\n\n');
    response.end();
  } catch (error) {
    console.error('Proxy error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}
