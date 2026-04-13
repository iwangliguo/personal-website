import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALIYUN_ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID || '';
const ALIYUN_ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET || '';
const ALIYUN_APP_KEY = process.env.ALIYUN_APP_KEY || '';

// 阿里云语音识别 REST API
const ASR_API_URL = 'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData } = request.body;

    if (!audioData) {
      return response.status(400).json({ error: 'audioData is required' });
    }

    if (!ALIYUN_ACCESS_KEY_ID || !ALIYUN_ACCESS_KEY_SECRET || !ALIYUN_APP_KEY) {
      console.error('Missing Aliyun credentials');
      return response.status(500).json({ error: 'Server configuration error' });
    }

    // 生成 Token（实际生产环境需要使用阿里云 SDK）
    const token = generateToken(ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET);

    // 调用阿里云语音识别
    const asrResponse = await fetch(ASR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NLS-Token': token,
        'X-App-Key': ALIYUN_APP_KEY,
      },
      body: JSON.stringify({
        appkey: ALIYUN_APP_KEY,
        format: 'wav',
        sample_rate: 16000,
        enable_punctuation_prediction: true,
        enable_inverse_text_normalization: true,
        enable_intermediate_result: false,
        audio_data: audioData,
      }),
    });

    const result = await asrResponse.json();

    if (!asrResponse.ok) {
      console.error('Aliyun ASR error:', result);
      return response.status(asrResponse.status).json({ 
        error: 'ASR request failed', 
        details: result 
      });
    }

    // 提取识别结果
    const text = result.result || result.text || '';

    return response.status(200).json({ 
      success: true, 
      text,
      data: result 
    });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return response.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// 简单的 Token 生成（实际生产环境需要使用阿里云 SDK）
function generateToken(accessKeyId: string, accessKeySecret: string): string {
  const timestamp = Date.now();
  const signature = Buffer.from(`${accessKeyId}:${accessKeySecret}:${timestamp}`).toString('base64');
  return `token_${signature}_${timestamp}`;
}