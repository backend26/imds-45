// UUID validation utility to prevent browser extension errors

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const sanitizeUUID = (input: string): string | null => {
  if (!input || typeof input !== 'string') return null;
  
  // Remove any non-UUID characters
  const cleaned = input.replace(/[^0-9a-f-]/gi, '');
  
  return isValidUUID(cleaned) ? cleaned : null;
};

export const validateRequiredUUID = (uuid: string, fieldName: string = 'UUID'): void => {
  if (!uuid || !isValidUUID(uuid)) {
    throw new Error(`${fieldName} deve essere un UUID valido`);
  }
};