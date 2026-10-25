export const PRICING_CONFIG = {
  'gemini-1.5-flash': {
    creditsPer1kPrompt: 0.1, // 0.1 credit per 1000 prompt tokens
    creditsPer1kCompletion: 0.3, // 0.3 credit per 1000 completion tokens
  },
  'gemini-1.5-flash-lite': {
    creditsPer1kPrompt: 0.05,
    creditsPer1kCompletion: 0.15,
  },
  'gemini-2.5-flash': {
    creditsPer1kPrompt: 0.1,
    creditsPer1kCompletion: 0.3,
  },
  'gemini-2.5-flash-lite': {
    creditsPer1kPrompt: 0.05,
    creditsPer1kCompletion: 0.15,
  },
  'default': {
    creditsPer1kPrompt: 0.1,
    creditsPer1kCompletion: 0.3,
  }
};

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

export function calculateCreditCost(model: string, usage?: UsageMetadata | null): number {
  if (!usage) {
    // Fallback: If no usage data is provided, charge a flat 1 credit
    return 1;
  }

  const pricing = PRICING_CONFIG[model as keyof typeof PRICING_CONFIG] || PRICING_CONFIG['default'];
  
  const promptCost = (usage.promptTokenCount / 1000) * pricing.creditsPer1kPrompt;
  const completionCost = (usage.candidatesTokenCount / 1000) * pricing.creditsPer1kCompletion;
  
  const totalCost = promptCost + completionCost;
  
  // We round up to the nearest 0.01 credit to avoid microscopic fractions
  return Math.max(0.01, Math.ceil(totalCost * 100) / 100);
}
