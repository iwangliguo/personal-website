import { useState, useRef, useEffect, useCallback } from 'react';
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

// 打字机速度：75ms/字符
const TYPING_SPEED = 75;

const DifyChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '非彼无我，非我无所取。',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 用于取消打字机效果的 ref
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortTypingRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 滚动到底部：新消息添加时立即滚动，打字效果期间不滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 清理打字机定时器
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 打字机效果：逐字显示内容
  const typeText = useCallback((fullText: string, onComplete: (text: string) => void) => {
    abortTypingRef.current = false;
    let index = 0;
    let currentText = '';

    const typeNextChar = () => {
      if (abortTypingRef.current) return;

      if (index < fullText.length) {
        currentText += fullText[index];
        setStreamingContent(currentText);
        index++;
        typingTimeoutRef.current = setTimeout(typeNextChar, TYPING_SPEED);
      } else {
        onComplete(currentText);
      }
    };

    typeNextChar();
  }, []);

  // 取消打字机效果
  const cancelTyping = useCallback(() => {
    abortTypingRef.current = true;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

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
            response_mode: 'streaming',
            user: 'website-visitor',
            conversation_id: conversationId,
          }),
        });
      }

      if (!response.ok) throw new Error('API request failed');

      // 检查是否是流式响应（通过 content-type 判断）
      const contentType = response.headers.get('content-type') || '';
      let answerText = '';

      if (contentType.includes('text/event-stream')) {
        // 流式响应处理
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // 解析 SSE 格式数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.answer) {
                  answerText += parsed.answer;
                }
                if (parsed.conversation_id) {
                  setConversationId(parsed.conversation_id);
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } else {
        // blocking 响应处理（兼容）
        const data = await response.json();
        if (data.conversation_id) {
          setConversationId(data.conversation_id);
        }
        answerText = data.answer || '';
      }

      // 打字机效果显示
      if (answerText) {
        setIsLoading(false);
        typeText(answerText, (finalText) => {
          const assistantMessage: Message = {
            id: tempId,
            role: 'assistant',
            content: finalText,
            timestamp: new Date(),
          };
          setStreamingContent('');
          setMessages((prev) => [...prev, assistantMessage]);
        });
      } else {
        // 无内容时的处理
        const assistantMessage: Message = {
          id: tempId,
          role: 'assistant',
          content: '抱歉，我暂时无法回答这个问题。',
          timestamp: new Date(),
        };
        setStreamingContent('');
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      cancelTyping();
      const errorMessage: Message = {
        id: tempId,
        role: 'assistant',
        content: '抱歉，连接失败了。请稍后再试。',
        timestamp: new Date(),
      };
      setStreamingContent('');
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 聊天窗口打开时禁止背景滚动
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // 完全禁止聊天窗口的滚动事件冒泡到背景页面
  const handleWheel = useCallback((e: WheelEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const chatEl = chatMessagesRef.current;
    if (!chatEl) return;

    chatEl.addEventListener('wheel', handleWheel, { passive: true });
    chatEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      chatEl.removeEventListener('wheel', handleWheel);
      chatEl.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleWheel, handleTouchMove]);

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

          <div className="dify-chat-messages" ref={chatMessagesRef}>
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
