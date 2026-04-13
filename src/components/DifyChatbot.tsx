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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

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
            stream: true,
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
            response_mode: 'streaming',
            user: 'website-visitor',
            conversation_id: conversationId,
          }),
        });
      }

      if (!response.ok) throw new Error('API request failed');

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.event === 'message' || data.event === 'agent_message') {
                  fullContent += data.answer || '';
                  setStreamingContent(fullContent);
                }
                
                if (data.conversation_id) {
                  setConversationId(data.conversation_id);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      // 流结束后，保存完整的消息
      const assistantMessage: Message = {
        id: tempId,
        role: 'assistant',
        content: fullContent || '抱歉，我暂时无法回答这个问题。',
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
              placeholder="输入消息..."
              rows={1}
            />
            <button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DifyChatbot;
