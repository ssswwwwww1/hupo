import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Mic, Cpu, Zap, Radio } from 'lucide-react';
import { sendChat, ChatMessage } from '../chatApi';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '系统在线 (SYSTEM ONLINE). 琥珀 (AMBER) AI 助手已就绪. 等待指令...' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Mock context gathering - in real app, gather from current page state
      const context = "Current active cases: 4. High risk region: SE Asia. Latest alert: Unauthorized access detected.";
      
      const response = await sendChat([...messages, userMsg], context);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '错误: 神经核心连接失败。正在重试安全握手... (ERROR: Connection Failed)' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-[2000] p-4 rounded-full shadow-2xl transition-all duration-300 border-2 ${
          isOpen 
            ? 'bg-amber-600 border-amber-400 rotate-90' 
            : 'bg-slate-900 border-amber-500 hover:scale-110 hover:shadow-amber-500/50'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-8 h-8 text-amber-500" />}
      </button>

      {/* Chat Interface */}
      <div 
        className={`fixed bottom-28 right-8 w-96 h-[600px] bg-slate-950/95 backdrop-blur-md border border-amber-500/30 rounded-2xl shadow-2xl z-[1999] flex flex-col transition-all duration-500 transform origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-20 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 bg-gradient-to-r from-slate-900 to-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bot className="w-6 h-6 text-amber-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-bold text-amber-500 text-sm tracking-widest">琥珀 (AMBER)</h3>
              <p className="text-[10px] text-slate-400 font-mono">NEURAL LINK: STABLE</p>
            </div>
          </div>
          <Cpu className="w-5 h-5 text-slate-600 animate-pulse" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-amber-900 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-3 rounded-lg text-sm font-mono leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-amber-600/20 border border-amber-600/50 text-amber-100 rounded-br-none' 
                    : 'bg-slate-800/80 border border-slate-700 text-slate-300 rounded-bl-none shadow-[0_0_15px_rgba(0,0,0,0.5)]'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center space-x-1 mb-1 opacity-50">
                    <Radio className="w-3 h-3" />
                    <span className="text-[10px]">AI RESPONSE</span>
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-xs text-amber-500 font-mono ml-2">处理中 (PROCESSING)...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-amber-500/20 bg-slate-900/50">
          <div className="relative flex items-center bg-slate-800 border border-slate-600 rounded-lg focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="输入指令 (Input directive)..."
              className="flex-1 bg-transparent border-none text-slate-200 text-sm px-4 py-3 focus:ring-0 placeholder-slate-600 font-mono"
            />
            <div className="flex items-center pr-2 space-x-1">
               <button className="p-2 text-slate-500 hover:text-amber-500 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-600 font-mono">
            <span>安全通道已加密 (SECURE CHANNEL ENCRYPTED)</span>
            <span className="flex items-center"><Zap className="w-3 h-3 mr-1" /> V3.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;
