
import React from 'react';
import { FeedbackReport } from '../types';

interface FeedbackViewProps {
  report: FeedbackReport | null;
  isLoading: boolean;
  onReset: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ report, isLoading, onReset }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-pulse">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Analysing your performance...</h2>
          <p className="text-gray-500 max-w-md">Our ESOL teachers are evaluating your speech against Level 2 criteria. This won't take long.</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-black mb-4">FEEDBACK SECTION</h2>
        <p className="text-indigo-100 text-lg max-w-2xl italic leading-relaxed">
          "{report.spokenScript}"
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">1️⃣</span>
          Objective-by-Objective Assessment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.criteria.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">{item.label}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  item.status === 'Met' ? 'bg-green-100 text-green-700' : 
                  item.status === 'Partly Met' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.status === 'Met' ? '✅ Met' : item.status === 'Partly Met' ? '⚠️ Partly Met' : '❌ Not Yet Met'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">{item.explanation}</p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Evidence</p>
                <p className="text-gray-700 text-sm italic">"{item.evidence}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">2️⃣</span>
            Strengths
          </h3>
          <ul className="space-y-3">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 bg-green-50/50 border border-green-100 p-4 rounded-xl text-green-900">
                <svg className="h-6 w-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">3️⃣</span>
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {report.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-3 bg-yellow-50/50 border border-yellow-100 p-4 rounded-xl text-yellow-900">
                <svg className="h-6 w-6 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center pt-8 pb-12">
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Practise Another Topic
        </button>
      </div>
    </div>
  );
};

export default FeedbackView;
