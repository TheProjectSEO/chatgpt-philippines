'use client';

import { PRESET_PROMPTS } from '@/lib/constants';

interface PresetPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function PresetPrompts({ onSelectPrompt }: PresetPromptsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
        Quick Start for Freelancers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_PROMPTS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPrompt(preset.prompt)}
            className="flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-2">{preset.icon}</div>
            <h3 className="font-semibold text-gray-900 text-left mb-1 group-hover:text-blue-600 transition-colors">
              {preset.title}
            </h3>
            <p className="text-sm text-gray-600 text-left">{preset.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
