import { useState, useRef, useEffect } from 'react';
import '../styles/DifyChat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Dify API 配置
const DIFY_API_URL = 'http://150.158.57.162:8081/v1/chat-messages';

// 根据环境自动选择调用方式
const isProduction = import.meta.env.PROD;

const DifyChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 hins 的 AI 助手，有什么我可以帮你的吗？',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 语音相关状态
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // 启动语音录音
  const startVoiceInput = async () => {
    try {
      setVoiceError('');
      setInputValue(''); // 清空输入框
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm',
        audioBitsPerSecond: 16000
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            
            const isProduction = import.meta.env.PROD;
            const apiUrl = isProduction ? '/api/speech-to-text' : '/api/speech-to-text';
            
            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                audioData: base64Data, 
                format: 'wav', 
                sampleRate: 16000 
              }),
            });
            
            const result = await res.json();
            
            if (result.success && result.text) {
              setInputValue(result.text);
            } else if (result.text) {
              setInputValue(result.text);
            } else {
              setVoiceError('未识别到语音内容');
              setInputValue('');
            }
          } catch (e) {
            console.error('Speech recognition error:', e);
            setVoiceError(e instanceof Error ? e.message : '语音识别失败');
            setInputValue('');
          } finally {
            setIsRecording(false);
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setVoiceError('录音出错');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // 每秒触发 ondataavailable
      setIsRecording(true);
      
      // 30秒自动停止
      (window as any).__voiceTimeoutId = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Microphone permission error:', error);
      setVoiceError('无法访问麦克风');
      setIsRecording(false);
    }
  };

  // 停止语音录音
  const stopVoiceInput = () => {
    const timeoutId = (window as any).__voiceTimeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
      (window as any).__voiceTimeoutId = null;
    }
    
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // 切换语音输入
  const toggleVoiceInput = () => {
    if (isRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setStreamingContent('');

    // 创建流式消息的临时 ID
    const tempId = (Date.now() + 1).toString();

    try {
      let response;

      if (isProduction) {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: userMessage.content,
            conversation_id: conversationId,
            user: 'website-visitor',
          }),
        });
      } else {
        response = await fetch(DIFY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer app-oYVKHjo6fnc6CNOjUwD6uYqc',
          },
          body: JSON.stringify({
            query: userMessage.content,
            inputs: {},
            response_mode: 'blocking',
            user: 'website-visitor',
            conversation_id: conversationId,
          }),
        });
      }

      if (!response.ok) throw new Error('API request failed');

      // 处理 blocking 响应
      const data = await response.json();
      
      // 保存 conversation_id 用于后续对话
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: tempId,
        role: 'assistant',
        content: data.answer || '抱歉，我暂时无法回答这个问题。',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: tempId,
        role: 'assistant',
        content: '抱歉，连接失败了。请稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="dify-inline-widget">
      <button
        className={`dify-inline-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="打开聊天助手"
      >
        <img src="/赞恩.jpg" alt="AI" className="dify-avatar-img" />
        <span>Talk to hins</span>
      </button>

      {isOpen && (
        <div className="dify-chat-window">
          <div className="dify-chat-header">
            <div className="dify-chat-header-info">
              <div className="dify-avatar">
                <img src="/赞恩.jpg" alt="AI" width="40" height="40" />
              </div>
              <div>
                <h3>AI 助手</h3>
                <span className="dify-status">在线</span>
              </div>
            </div>
          </div>

          <div className="dify-chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`dify-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="dify-message-avatar">
                    <img src="/赞恩.jpg" alt="AI" width="32" height="32" />
                  </div>
                )}
                <div className="dify-message-content">
                  <p>{msg.content}</p>
                  <span className="dify-message-time">
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {/* 流式输出中的消息 */}
            {streamingContent && (
              <div className="dify-message assistant">
                <div className="dify-message-avatar">
                  <img src="/赞恩.jpg" alt="AI" width="32" height="32" />
                </div>
                <div className="dify-message-content">
                  <p>{streamingContent}<span className="dify-typing-cursor">|</span></p>
                </div>
              </div>
            )}
            
            {isLoading && !streamingContent && (
              <div className="dify-message assistant">
                <div className="dify-message-avatar">
                  <img src="/赞恩.jpg" alt="AI" width="32" height="32" />
                </div>
                <div className="dify-message-content">
                  <div className="dify-loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="dify-chat-input">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "正在录音..." : "输入消息..."}
              rows={1}
            />
            <button 
              onClick={toggleVoiceInput}
              className={isRecording ? 'recording' : ''}
              title={isRecording ? "停止录音" : "开始录音"}
            >
              {isRecording ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                </svg>
              )}
            </button>
            <button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
          
          {voiceError && (
            <div className="dify-voice-error">{voiceError}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DifyChatbot;
