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

    // 使用流式响应模式
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
      const errorText = await res.text();
      console.error('Dify API error:', errorText);
      return response.status(res.status).json({ error: 'Dify API error', details: errorText });
    }

    // 设置流式响应头
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // 直接转发流式响应
    res.body?.pipeTo(
      new WritableStream({
        write(chunk) {
          response.send(chunk);
        },
        close() {
          response.end();
        },
      })
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
