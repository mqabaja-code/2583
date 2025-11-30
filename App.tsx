import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, MessageSquarePlus, FileText } from 'lucide-react';
import Header from './components/Header';
import ChatMessage from './components/ChatMessage';
import CoursePlanView from './components/CoursePlanView';
import { Message, AppState, CoursePlan } from './types';
import { startChat, sendMessageToGemini, generateStructuredPlan } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.Chatting);
  const [generatedPlan, setGeneratedPlan] = useState<CoursePlan | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Initialize chat with welcome message from history
    const session = startChat();
    // In a real app, we might extract the initial history to state, 
    // but here we just show the hardcoded welcome message from the service mock or init logic.
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: 'أهلاً بك في مركز الريادة والتعليم المستمر. أنا مساعدك الذكي لتصميم خطط الدورات التدريبية. \n\nيمكنني مساعدتك في:\n- صياغة أهداف الدورة.\n- تحديد المحاور التدريبية.\n- اقتراح الأنشطة والتقييمات.\n\nأخبرني، ما هي فكرة الدورة التي تود العمل عليها اليوم؟',
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Keep focus on input for better UX
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleGeneratePlan = async () => {
    if (messages.length < 3) {
      alert("يرجى إجراء محادثة قصيرة أولاً لتزويدي بتفاصيل الدورة.");
      return;
    }

    setAppState(AppState.GeneratingPlan);
    
    try {
      // Aggregate context from messages
      const conversationContext = messages
        .map(m => `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.text}`)
        .join('\n');

      const plan = await generateStructuredPlan(conversationContext);
      setGeneratedPlan(plan);
      setAppState(AppState.ViewingPlan);
    } catch (error) {
      console.error(error);
      setAppState(AppState.Chatting);
      alert("حدث خطأ أثناء توليد الخطة. يرجى المحاولة لاحقاً.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    if (confirm("هل أنت متأكد من بدء محادثة جديدة؟ سيتم فقدان المحادثة الحالية.")) {
      window.location.reload();
    }
  };

  // -- Render Views --

  if (appState === AppState.ViewingPlan && generatedPlan) {
    return <CoursePlanView plan={generatedPlan} onBack={() => setAppState(AppState.Chatting)} />;
  }

  if (appState === AppState.GeneratingPlan) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white p-6 rounded-full shadow-xl">
            <Sparkles className="text-primary-600 animate-pulse" size={48} />
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-slate-800">جاري بناء وتنسيق الخطة...</h2>
        <p className="mt-2 text-slate-500 max-w-md">
          يقوم النظام الآن بتجميع المحتوى وتنسيق الأهداف والمحاور في وثيقة رسمية للمراجعة.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-3xl">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start w-full mb-6">
               <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tr-none shadow-sm flex items-center gap-2">
                 <Loader2 className="animate-spin text-primary-500" size={18} />
                 <span className="text-slate-400 text-sm">جاري الكتابة...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 pb-6 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-3">
          
          {/* Action Bar (Only show if we have some history) */}
          {messages.length > 2 && (
            <div className="flex justify-center">
              <button 
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2 rounded-full shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                <span>عرض المسودة للمراجعة والاعتماد</span>
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400 transition-all">
            <button 
              onClick={resetChat}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="محادثة جديدة"
            >
              <MessageSquarePlus size={20} />
            </button>
            
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="اكتب رسالتك هنا... (مثال: أريد تعديل المحور الثاني، أو إضافة هدف جديد)"
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 text-slate-700 placeholder:text-slate-400 leading-relaxed"
              rows={1}
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
              {isLoading && <Loader2 size={20} className="absolute animate-spin" />}
            </button>
          </div>
          <div className="text-center">
             <p className="text-[10px] text-slate-400">الذكاء الاصطناعي قد يخطئ أحياناً. يرجى مراجعة الخطة قبل اعتمادها.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;