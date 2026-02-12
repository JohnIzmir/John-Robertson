
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Topic, ChatMessage } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { CONVERSATION_SYSTEM_PROMPT } from '../constants';

interface ConversationInterfaceProps {
  topic: Topic;
  onConversationEnd: (transcript: ChatMessage[]) => void;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ topic, onConversationEnd }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [inputTranscription, setInputTranscription] = useState('');
  const [currentOutputText, setCurrentOutputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentOutputText, inputTranscription]);

  // Audio utility functions
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopVoiceSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsVoiceActive(false);
  }, []);

  const startVoiceSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: CONVERSATION_SYSTEM_PROMPT(topic.title, topic.opening),
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsVoiceActive(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              const outputNode = outputAudioContext.createGain();
              source.connect(outputNode);
              outputNode.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Transcription
            if (message.serverContent?.inputTranscription) {
              setInputTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
              setCurrentOutputText(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            // Turn complete
            if (message.serverContent?.turnComplete) {
              setMessages(prev => {
                const newMessages = [...prev];
                if (inputTranscription) newMessages.push({ role: 'user', text: inputTranscription });
                if (currentOutputText) newMessages.push({ role: 'model', text: currentOutputText });
                
                // Check if session should end
                if (currentOutputText.includes('[CONVERSATION_FINISHED]')) {
                  setTimeout(() => {
                    stopVoiceSession();
                    onConversationEnd(newMessages.map(m => ({
                      ...m,
                      text: m.text.replace('[CONVERSATION_FINISHED]', '').trim()
                    })));
                  }, 1000);
                }
                
                return newMessages;
              });
              setInputTranscription('');
              setCurrentOutputText('');
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live API Error:", e),
          onclose: () => setIsVoiceActive(false),
        },
      });

      sessionRef.current = await sessionPromise;
      // Start with the opening question
      sessionRef.current.sendRealtimeInput({ text: "Hello! Let's start the conversation about " + topic.title + ". My initial question is: " + topic.opening });

    } catch (err) {
      console.error("Failed to start voice session", err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] max-h-[800px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-50 border-b border-indigo-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{topic.title}</h2>
          <p className="text-indigo-600 text-sm font-medium mt-1">Speaking & Listening Practice</p>
        </div>
        {!isVoiceActive && !isConnecting && (
          <button 
            onClick={startVoiceSession}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            Start Practising
          </button>
        )}
        {(isVoiceActive || isConnecting) && (
          <div className="flex items-center gap-3">
             <div className="flex gap-1 items-center px-4 py-2 bg-white rounded-full border border-indigo-100 text-indigo-600 font-medium">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
                {isConnecting ? 'Connecting...' : 'Active Session'}
             </div>
             <button 
               onClick={stopVoiceSession}
               className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
               title="Stop Session"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.length === 0 && !currentOutputText && !inputTranscription && !isConnecting && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500">Press "Start Practising" to begin your ESOL Level 2 assessment session.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {inputTranscription && (
          <div className="flex justify-end">
            <div className="max-w-[85%] px-5 py-3 rounded-2xl bg-indigo-100 text-indigo-900 rounded-tr-none italic animate-pulse">
              <p>{inputTranscription}...</p>
            </div>
          </div>
        )}

        {currentOutputText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm animate-pulse">
              <p className="leading-relaxed">{currentOutputText.replace('[CONVERSATION_FINISHED]', '')}...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <p className="font-bold">Instructions:</p>
            <p>1. Talk naturally. Explain your views and give reasons.</p>
            <p>2. Say <span className="font-mono bg-yellow-100 px-1 rounded">"In conclusion..."</span> or <span className="font-mono bg-yellow-100 px-1 rounded">"To sum up..."</span> when you are finished to get your feedback.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationInterface;
