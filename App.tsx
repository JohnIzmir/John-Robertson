
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TOPICS } from './constants';
import { AppMode, Topic, ChatMessage, FeedbackReport } from './types';
import TopicSelector from './components/TopicSelector';
import ConversationInterface from './components/ConversationInterface';
import FeedbackView from './components/FeedbackView';
import { GoogleGenAI, Type } from "@google/genai";
import { FEEDBACK_SYSTEM_PROMPT } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SELECTION);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setMode(AppMode.CONVERSATION);
    setTranscript([]);
    setFeedback(null);
  };

  const handleConversationEnd = useCallback(async (finalTranscript: ChatMessage[]) => {
    setTranscript(finalTranscript);
    setMode(AppMode.FEEDBACK);
    setIsGeneratingFeedback(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const conversationText = finalTranscript
        .map(m => `${m.role === 'user' ? 'Learner' : 'Partner'}: ${m.text}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze this conversation transcript for Ascentis Level 2 ESOL assessment:\n\n${conversationText}`,
        config: {
          systemInstruction: FEEDBACK_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              criteria: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    status: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    evidence: { type: Type.STRING }
                  },
                  required: ["label", "status", "explanation", "evidence"]
                }
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              spokenScript: { type: Type.STRING }
            },
            required: ["criteria", "strengths", "improvements", "spokenScript"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setFeedback(result);
    } catch (error) {
      console.error("Feedback generation failed", error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, []);

  const handleReset = () => {
    setMode(AppMode.SELECTION);
    setSelectedTopic(null);
    setTranscript([]);
    setFeedback(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Ascentis ESOL Level 2 Partner</h1>
          {mode !== AppMode.SELECTION && (
            <button 
              onClick={handleReset}
              className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Change Topic
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {mode === AppMode.SELECTION && (
          <TopicSelector topics={TOPICS} onSelect={handleSelectTopic} />
        )}

        {mode === AppMode.CONVERSATION && selectedTopic && (
          <ConversationInterface 
            topic={selectedTopic} 
            onConversationEnd={handleConversationEnd} 
          />
        )}

        {mode === AppMode.FEEDBACK && (
          <FeedbackView 
            report={feedback} 
            isLoading={isGeneratingFeedback} 
            onReset={handleReset} 
          />
        )}
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 p-4 text-center text-gray-500 text-sm">
        <p>British English • ESOL Level 2 Standards • Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
