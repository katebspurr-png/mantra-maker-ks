/**
 * Hook to generate and manage affirmation IDs
 * 
 * Affirmation IDs group recordings by the same script/affirmation.
 * Multiple "takes" of the same affirmation share an affirmation_id.
 */
export const generateAffirmationId = (): string => {
  return crypto.randomUUID();
};

/**
 * Determines if a new affirmation_id should be generated based on context
 */
export const shouldGenerateAffirmationId = (
  hasPrefilledText: boolean,
  existingAffirmationId?: string | null
): { affirmationId: string | null; isNewAffirmation: boolean } => {
  // If there's an existing affirmation_id, reuse it (recording a new take)
  if (existingAffirmationId) {
    return { affirmationId: existingAffirmationId, isNewAffirmation: false };
  }
  
  // If there's prefilled text (from Library, Thought Transformer, etc.), generate new ID
  if (hasPrefilledText) {
    return { affirmationId: generateAffirmationId(), isNewAffirmation: true };
  }
  
  // No prefilled text and no existing ID - user is recording freeform
  return { affirmationId: null, isNewAffirmation: false };
};
