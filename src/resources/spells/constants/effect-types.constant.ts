export const EFFECT_TYPES = ['attack', 'heal', 'utility'] as const;

export type EffectType = (typeof EFFECT_TYPES)[number];
