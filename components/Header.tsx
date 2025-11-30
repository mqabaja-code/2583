import React from 'react';
import { BookOpen, Award } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center gap-3">
        <div className="bg-primary-700 p-2 rounded-lg text-white">
          <Award size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">مركز الريادة والتعليم المستمر</h1>
          <p className="text-xs text-slate-500">منصة تصميم الدورات الذكية</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
          إصدار تجريبي
        </span>
      </div>
    </header>
  );
};

export default Header;
