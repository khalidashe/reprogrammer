export const PING_SOUNDS = {
  default: {
    label: 'Default',
    description: 'Standard iOS notification sound',
    value: 'default' as const,
  },
  chime: {
    label: 'Chime',
    description: 'Gentle chiming sound',
    value: 'chime' as const,
  },
  bell: {
    label: 'Bell',
    description: 'Ringing bell sound',
    value: 'bell' as const,
  },
  ding: {
    label: 'Ding',
    description: 'Sharp ding sound',
    value: 'ding' as const,
  },
  alert: {
    label: 'Alert',
    description: 'Alert/attention sound',
    value: 'alert' as const,
  },
} as const;

export type PingSoundType = keyof typeof PING_SOUNDS;
