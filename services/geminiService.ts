import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CoursePlan } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `
أنت خبير تصميم مناهج تعليمية ومستشار تدريب في "مركز الريادة والتعليم المستمر".
مهمتك هي مساعدة المستخدمين (مدربين، جهات تعليمية) على بناء خطط دورات تدريبية احترافية.

اتبع الخطوات التالية في الحوار:
1. استقبل فكرة الدورة من المستخدم.
2. اسأل أسئلة توضيحية بذكاء لتحديد: الفئة المستهدفة، المستوى (مبتدئ، متوسط، متقدم)، المدة الزمنية المقترحة، والأهداف الرئيسية.
3. اقترح تحسينات على المحتوى لجعله أكثر احترافية وجاذبية.
4. كن مهذباً، محترفاً، وتحدث باللغة العربية الفصحى المبسطة.
5. لا تقم بإنشاء الخطة الكاملة فوراً، بل ابنيها مع المستخدم خطوة بخطوة من خلال الحوار.
`;

// Schema for the final JSON output
const coursePlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "عنوان الدورة الاحترافي" },
    description: { type: Type.STRING, description: "وصف شامل للدورة وأهميتها" },
    targetAudience: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "قائمة بالفئات المستهدفة" 
    },
    level: { type: Type.STRING, description: "مستوى الدورة (مبتدئ، متوسط، متقدم)" },
    duration: { type: Type.STRING, description: "المدة الزمنية (عدد الساعات أو الأسابيع)" },
    learningOutcomes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "المخرجات التعليمية المتوقعة بنهاية الدورة"
    },
    methodology: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "الأساليب والأنشطة التدريبية (محاضرات، ورش عمل، دراسة حالة...)"
    },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "عنوان الوحدة أو المحور" },
          duration: { type: Type.STRING, description: "مدة هذا المحور" },
          topics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "قائمة بالمواضيع التفصيلية داخل المحور"
          }
        },
        required: ["title", "topics"]
      },
      description: "تفاصيل الخطة الدراسية مقسمة إلى محاور أو وحدات"
    },
    assessmentMethods: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "طرق تقييم المتدربين"
    },
    requirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "المتطلبات المسبقة أو الأدوات اللازمة"
    }
  },
  required: ["title", "description", "targetAudience", "learningOutcomes", "modules", "duration"],
};

// Chat session management
let chatSession: any = null;

export const startChat = () => {
  chatSession = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: [
      {
        role: "user",
        parts: [{ text: "مرحباً" }],
      },
      {
        role: "model",
        parts: [{ text: "أهلاً بك في مركز الريادة والتعليم المستمر. أنا مساعدك الذكي لتصميم خطط الدورات التدريبية. كيف يمكنني مساعدتك اليوم؟ هل لديك فكرة لدورة معينة تود العمل عليها؟" }],
      },
    ],
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    startChat();
  }
  try {
    const result = await chatSession.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("حدث خطأ أثناء الاتصال بالمساعد الذكي.");
  }
};

export const generateStructuredPlan = async (conversationContext: string): Promise<CoursePlan> => {
  // We use a fresh single-turn generation request to process the history into a JSON
  // This avoids messing up the chat context with a massive JSON dump.
  
  const prompt = `
    بناءً على المحادثة التالية، قم بصياغة وثيقة خطة دورة تدريبية متكاملة واحترافية بصيغة JSON.
    
    سجل المحادثة:
    ${conversationContext}

    يجب أن تكون المعلومات دقيقة ومستنتجة من الحوار. إذا كانت بعض المعلومات ناقصة، قم باقتراح محتوى مناسب واحترافي يلاءم سياق الدورة.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: coursePlanSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");
    
    return JSON.parse(jsonText) as CoursePlan;
  } catch (error) {
    console.error("Plan Generation Error:", error);
    throw new Error("فشل النظام في توليد الخطة النهائية. يرجى المحاولة مرة أخرى.");
  }
};
