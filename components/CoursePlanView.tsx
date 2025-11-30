import React, { useEffect } from 'react';
import { CoursePlan } from '../types';
import { ArrowRight, CheckCircle2, Clock, Users, BookOpen, Target, Briefcase, PenLine, Printer, Download, FileText } from 'lucide-react';

interface CoursePlanViewProps {
  plan: CoursePlan;
  onBack: () => void;
}

const CoursePlanView: React.FC<CoursePlanViewProps> = ({ plan, onBack }) => {

  // Set document title for PDF filename
  useEffect(() => {
    const originalTitle = document.title;
    // Set title for the PDF filename (browsers use document title as default filename)
    document.title = `وثيقة خطة تدريبية معتمدة - ${plan.title}`;
    return () => {
      document.title = originalTitle;
    };
  }, [plan.title]);

  const handlePrint = () => {
    // This triggers the browser's print dialog. 
    // The CSS in index.html handles hiding the UI and showing only #printable-course-plan
    window.print();
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' dir='rtl'>
      <head>
        <meta charset='utf-8'>
        <title>${plan.title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; }
          h1 { color: #0f172a; font-size: 24pt; margin: 0; }
          .subtitle { color: #64748b; font-size: 14pt; }
          h2 { color: #0284c7; font-size: 16pt; margin-top: 25px; border-right: 5px solid #0284c7; padding-right: 10px; background: #f8fafc; padding: 5px 10px; }
          h3 { color: #334155; font-size: 14pt; margin-top: 15px; font-weight: bold; }
          p { font-size: 12pt; margin-bottom: 10px; }
          ul { margin-bottom: 15px; }
          li { margin-bottom: 5px; }
          .meta-box { background-color: #f0f9ff; padding: 15px; border: 1px solid #bae6fd; margin-bottom: 20px; }
          .meta-item { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${plan.title}</h1>
          <p class="subtitle">مركز الريادة والتعليم المستمر - وثيقة خطة تدريبية</p>
        </div>

        <div class="meta-box">
          <p class="meta-item"><strong>المدة الزمنية:</strong> ${plan.duration}</p>
          <p class="meta-item"><strong>المستوى:</strong> ${plan.level}</p>
          <p class="meta-item"><strong>الفئة المستهدفة:</strong> ${plan.targetAudience.join('، ')}</p>
        </div>

        <h2>وصف الدورة</h2>
        <p>${plan.description}</p>

        <h2>المخرجات التعليمية</h2>
        <ul>
          ${plan.learningOutcomes.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h2>الخطة والمحاور التدريبية</h2>
        ${plan.modules.map(mod => `
          <div style="margin-bottom: 15px;">
            <h3>${mod.title} <span style="font-size: 11pt; color: #64748b; font-weight: normal;">(${mod.duration})</span></h3>
            <ul>
              ${mod.topics.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        `).join('')}

        <h2>الأنشطة والأساليب</h2>
        <ul>
          ${plan.methodology.map(item => `<li>${item}</li>`).join('')}
        </ul>

        <h2>أدوات التقييم</h2>
        <ul>
          ${plan.assessmentMethods.map(item => `<li>${item}</li>`).join('')}
        </ul>

        ${plan.requirements && plan.requirements.length > 0 ? `
        <h2>المتطلبات والمواد</h2>
        <ul>
          ${plan.requirements.map(item => `<li>${item}</li>`).join('')}
        </ul>
        ` : ''}
        
        <br/><br/>
        <p style="text-align: center; color: #94a3b8; font-size: 10pt;">تم إعداد هذه الوثيقة بواسطة نظام مركز الريادة الذكي</p>
      </body>
      </html>
    `;

    // Create a Blob with the content
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `خطة - ${plan.title}.doc`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden relative">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10 no-print">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-primary-700 transition-colors"
        >
          <ArrowRight size={20} className="ml-2" />
          عودة وتعديل الطلب
        </button>
        <div className="flex items-center gap-4">
          
          {/* Export Group */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
             <span className="text-xs font-bold text-slate-400 px-2 hidden sm:block">خيارات:</span>
             <button 
              onClick={handleExportWord}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-700 hover:bg-white px-3 py-1.5 rounded-md transition-all text-sm font-medium"
              title="حفظ كملف Word"
            >
              <FileText size={18} className="text-blue-600" />
              <span className="hidden sm:inline">Word</span>
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-slate-600 hover:text-red-700 hover:bg-white px-3 py-1.5 rounded-md transition-all text-sm font-medium"
              title="تصدير كـ PDF"
            >
              <Download size={18} className="text-red-600" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-white px-3 py-1.5 rounded-md transition-all text-sm font-medium"
              title="طباعة"
            >
              <Printer size={18} className="text-slate-700" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
             <PenLine size={14} />
             <span>يمكنك النقر على أي نص للتعديل</span>
          </div>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
        <div id="printable-course-plan" className="bg-white w-full max-w-4xl min-h-[1000px] shadow-lg rounded-xl p-8 md:p-12 relative">
          
          {/* Official Document Watermark/Header for Print */}
          <div className="hidden print:block absolute top-0 left-0 text-xs text-slate-300">
            Ref: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </div>

          {/* Header */}
          <div className="border-b-4 border-primary-600 pb-6 mb-8 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-3">وثيقة خطة تدريبية معتمدة</h2>
              <h1 
                className="text-3xl md:text-4xl font-bold text-primary-900 leading-tight outline-none"
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                {plan.title}
              </h1>
            </div>
            <div className="hidden md:block print:block text-left mr-4">
               <div className="flex items-center gap-3 mb-1 justify-end">
                 <div className="text-right">
                    <div className="text-lg font-bold text-slate-800">مركز الريادة</div>
                    <div className="text-sm text-slate-600">والتعليم المستمر</div>
                 </div>
                 <div className="w-12 h-12 bg-primary-900 rounded-lg flex items-center justify-center text-white font-bold text-xl print:bg-slate-800 print:text-white">
                    R
                 </div>
               </div>
            </div>
          </div>

          {/* Core Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:grid-cols-3">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border print:border-slate-300 break-inside-avoid">
              <div className="flex items-center gap-2 text-primary-700 mb-2 font-bold text-sm">
                <Clock size={16} /> المدة الزمنية
              </div>
              <div 
                className="text-slate-900 font-bold outline-none"
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                {plan.duration}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border print:border-slate-300 break-inside-avoid">
              <div className="flex items-center gap-2 text-primary-700 mb-2 font-bold text-sm">
                <Users size={16} /> الفئة المستهدفة الرئيسية
              </div>
              <div 
                className="text-slate-900 text-sm font-medium outline-none"
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                {plan.targetAudience.slice(0, 3).join('، ')}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border print:border-slate-300 break-inside-avoid">
              <div className="flex items-center gap-2 text-primary-700 mb-2 font-bold text-sm">
                <BookOpen size={16} /> المستوى
              </div>
              <div 
                className="text-slate-900 font-bold outline-none"
                contentEditable={true}
                suppressContentEditableWarning={true}
              >
                {plan.level}
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="mb-10 break-inside-avoid">
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-secondary-500 rounded-full"></span>
              وصف الدورة
            </h3>
            <div 
              className="text-slate-700 leading-relaxed text-justify outline-none"
              contentEditable={true}
              suppressContentEditableWarning={true}
            >
              {plan.description}
            </div>
          </section>

          {/* Outcomes */}
          <section className="mb-10 bg-primary-50 p-6 rounded-xl border border-primary-100 print:bg-white print:border print:border-slate-200 break-inside-avoid">
            <h3 className="text-xl font-bold text-primary-900 mb-4 flex items-center gap-2">
              <Target className="text-primary-600" />
              المخرجات التعليمية والأهداف
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 print:grid-cols-2">
              {plan.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-800 text-sm">
                  <CheckCircle2 size={16} className="text-green-600 mt-1 flex-shrink-0" />
                  <span 
                    contentEditable={true} 
                    suppressContentEditableWarning={true}
                    className="outline-none"
                  >
                    {outcome}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Modules/Syllabus */}
          <section className="mb-12">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-secondary-500 rounded-full"></span>
              الخطة الزمنية والمحاور التدريبية
            </h3>
            <div className="space-y-6">
              {plan.modules.map((mod, idx) => (
                <div key={idx} className="border-l-4 border-primary-500 pl-4 pr-2 break-inside-avoid">
                  <div className="flex justify-between items-baseline mb-2">
                    <h4 
                      className="font-bold text-lg text-slate-900 outline-none"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      {idx + 1}. {mod.title}
                    </h4>
                    <span 
                      className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded outline-none print:bg-white print:border print:border-slate-200"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                    >
                      {mod.duration}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm marker:text-slate-300 pr-4">
                    {mod.topics.map((topic, tIdx) => (
                      <li 
                        key={tIdx} 
                        contentEditable={true} 
                        suppressContentEditableWarning={true}
                        className="outline-none"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Methodology, Assessment & Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 print:grid-cols-2">
            
            <section className="break-inside-avoid">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase size={20} className="text-primary-600" />
                الأنشطة والأساليب
              </h3>
              <ul className="space-y-2">
                {plan.methodology.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                    <span contentEditable={true} suppressContentEditableWarning={true} className="outline-none">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
            
            <section className="break-inside-avoid">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <CheckCircle2 size={20} className="text-primary-600" />
                أدوات التقييم
              </h3>
              <ul className="space-y-2">
                {plan.assessmentMethods.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700 text-sm">
                    <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full"></span>
                    <span contentEditable={true} suppressContentEditableWarning={true} className="outline-none">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {plan.requirements && plan.requirements.length > 0 && (
              <section className="break-inside-avoid md:col-span-2 print:col-span-2 mt-4">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <BookOpen size={20} className="text-primary-600" />
                    المتطلبات والمواد المقترحة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.requirements.map((req, idx) => (
                      <span 
                        key={idx}
                        className="text-sm bg-slate-50 text-slate-700 px-3 py-1.5 rounded border border-slate-100 outline-none print:border-slate-300"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                      >
                        {req}
                      </span>
                    ))}
                  </div>
              </section>
            )}
          </div>

          {/* Footer for Print */}
          <div className="mt-16 pt-8 border-t-2 border-slate-100 flex justify-between items-end break-inside-avoid print:mt-12">
            <div className="text-xs text-slate-400">
              <p>تم إعداد هذه الوثيقة آلياً عبر منصة مركز الريادة والتعليم المستمر</p>
              <p>{new Date().toLocaleDateString('ar-EG')}</p>
            </div>
            <div className="text-center px-8">
               <div className="h-16 w-32 border-b border-slate-300 mb-2"></div>
               <div className="text-xs font-bold text-slate-500">الختم والتوقيع</div>
            </div>
          </div>
          
          {/* Bottom Action Buttons (Visible on Screen Only) */}
          <div className="mt-12 flex flex-col md:flex-row justify-center gap-4 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group"
            >
              <Download size={24} />
              <div className="text-right">
                <div className="text-lg font-bold">تصدير كـ PDF</div>
                <div className="text-xs text-slate-300 font-normal">تنزيل وطباعة</div>
              </div>
            </button>

            <button
              onClick={handleExportWord}
              className="flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group"
            >
              <FileText size={24} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <div className="text-right">
                <div className="text-lg font-bold">تصدير كـ Word</div>
                <div className="text-xs text-slate-500 font-normal">ملف قابل للتعديل</div>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CoursePlanView;