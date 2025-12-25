/**
 * Frontend Validation Utilities
 * 
 * Client-side validation functions to prevent invalid data from being sent to the API.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID format
 */
export function isValidUUID(uuid: string | null | undefined): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  return UUID_REGEX.test(uuid);
}

/**
 * Validates UUID and throws error if invalid (for use in forms)
 */
export function validateUUID(uuid: string | null | undefined, fieldName: string = 'ID'): string | null {
  if (!uuid) {
    return null; // Allow empty/null values
  }
  
  if (!isValidUUID(uuid)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  
  return uuid;
}

/**
 * Validates UUID from URL parameter
 * Returns null if invalid (to prevent API calls with invalid UUIDs)
 */
export function validateUrlUUID(uuid: string | string[] | null | undefined, fieldName: string = 'ID'): string | null {
  if (!uuid) {
    return null;
  }
  
  const uuidString = Array.isArray(uuid) ? uuid[0] : uuid;
  
  if (!isValidUUID(uuidString)) {
    console.warn(`Invalid ${fieldName} in URL: ${uuidString}`);
    return null;
  }
  
  return uuidString;
}

/**
 * Validates query parameter UUID
 * Returns null if invalid or "new" (special case for new entity forms)
 */
export function validateQueryUUID(uuid: string | null | undefined, allowNew: boolean = false): string | null {
  if (!uuid) {
    return null;
  }
  
  // Allow "new" for new entity forms
  if (allowNew && uuid === 'new') {
    return null; // Return null so API doesn't receive "new"
  }
  
  if (!isValidUUID(uuid)) {
    console.warn(`Invalid UUID in query parameter: ${uuid}`);
    return null;
  }
  
  return uuid;
}

