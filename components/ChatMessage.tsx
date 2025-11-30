import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'model';

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isBot ? <Bot size={18} /> : <User size={18} />}
        </div>

        {/* Bubble */}
        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isBot 
            ? 'bg-white border border-slate-100 text-slate-800 rounded-tr-none' 
            : 'bg-primary-600 text-white rounded-tl-none'
        }`}>
          {message.isError ? (
             <span className="text-red-200">{message.text}</span>
          ) : (
            <div className={`markdown-content ${isBot ? 'prose prose-sm prose-slate max-w-none' : ''}`}>
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
