import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { isValidUUID } from '@business-app/shared/utils';

/**
 * UUID Validation Pipe
 * 
 * Validates that a parameter is a valid UUID format.
 * Can be used as a parameter decorator: @Param('id', UuidPipe) id: string
 */
@Injectable()
export class UuidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new BadRequestException(`${metadata.data || 'Parameter'} is required`);
    }

    if (!isValidUUID(value)) {
      throw new BadRequestException(
        `Invalid UUID format for ${metadata.data || 'parameter'}: ${value}`
      );
    }

    return value;
  }
}

/**
 * Optional UUID Validation Pipe
 * 
 * Validates UUID format only if value is provided (allows undefined/null/empty)
 */
@Injectable()
export class OptionalUuidPipe implements PipeTransform<string | undefined, string | undefined> {
  transform(value: string | undefined, metadata: ArgumentMetadata): string | undefined {
    if (!value || value === '' || value === 'new') {
      return undefined;
    }

    if (!isValidUUID(value)) {
      throw new BadRequestException(
        `Invalid UUID format for ${metadata.data || 'parameter'}: ${value}`
      );
    }

    return value;
  }
}


