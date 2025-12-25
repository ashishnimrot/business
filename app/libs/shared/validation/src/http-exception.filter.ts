import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter
 * 
 * Ensures that validation errors return 400 Bad Request instead of 500 Internal Server Error.
 * Also provides consistent error response format.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = exception.name;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      // Handle non-HTTP exceptions (like database errors, validation errors)
      // Check if it's a validation/format error that should be 400
      const errorMessage = exception.message.toLowerCase();
      
      if (
        errorMessage.includes('invalid uuid') ||
        errorMessage.includes('uuid format') ||
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid format') ||
        errorMessage.includes('bad request')
      ) {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
        error = 'Bad Request';
      } else {
        // Log unexpected errors
        this.logger.error(
          `Unexpected error: ${exception.message}`,
          exception.stack,
          `${request.method} ${request.url}`
        );
      }
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
      error,
    };

    response.status(status).json(errorResponse);
  }
}

