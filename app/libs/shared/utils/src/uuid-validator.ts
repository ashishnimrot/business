import { BadRequestException } from '@nestjs/common';

/**
 * UUID Validator Utility
 * 
 * Validates UUID format and throws appropriate errors
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  return UUID_REGEX.test(uuid);
}

/**
 * Validates UUID and throws BadRequestException if invalid
 */
export function validateUUID(uuid: string, paramName: string = 'id'): void {
  if (!isValidUUID(uuid)) {
    throw new BadRequestException(`Invalid UUID format for ${paramName}: ${uuid}`);
  }
}

/**
 * Validates optional UUID (returns true if undefined/null, validates if provided)
 */
export function validateOptionalUUID(uuid: string | undefined | null, paramName: string = 'id'): void {
  if (uuid !== undefined && uuid !== null && uuid !== '') {
    validateUUID(uuid, paramName);
  }
}

