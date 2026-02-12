
import React from 'react';
import { Topic } from '../types';

interface TopicSelectorProps {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ topics, onSelect }) => {
  return (
    <div className="space-y-8 py-4 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900">Choose your conversation topic</h2>
        <p className="text-lg text-gray-600">Select a topic to begin your practice session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelect(topic)}
            className="flex flex-col text-left p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-sm font-bold">
              {topic.id}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {topic.title}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-2">
              Start with: "{topic.opening}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;
