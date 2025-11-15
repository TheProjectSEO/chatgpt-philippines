'use client';

import { Info, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

interface CalloutBoxProps {
  type: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  content: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    textColor: 'text-amber-800',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-900',
    textColor: 'text-purple-800',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    textColor: 'text-green-800',
  },
};

export default function CalloutBox({ type, title, content }: CalloutBoxProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  const defaultTitles = {
    info: 'Good to know',
    warning: 'Important',
    tip: 'Pro tip',
    success: 'Success',
  };

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-xl p-6 my-6`}
    >
      <div className="flex gap-4">
        <div className={`${config.iconColor} flex-shrink-0`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`${config.titleColor} font-semibold mb-2`}>
              {title}
            </h4>
          )}
          {!title && (
            <h4 className={`${config.titleColor} font-semibold mb-2`}>
              {defaultTitles[type]}
            </h4>
          )}
          <p className={`${config.textColor} leading-relaxed`}>{content}</p>
        </div>
      </div>
    </div>
  );
}
