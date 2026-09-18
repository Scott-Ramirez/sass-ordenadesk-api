import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../domain/domain-exceptions.base';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message: string | object = 'Ha ocurrido un error interno en el servidor.';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || exception.message;
        code = resObj.code || resObj.error || code;
        if (resObj.maxDevices !== undefined) details = { ...details, maxDevices: resObj.maxDevices };
        if (resObj.activeDevicesCount !== undefined) details = { ...details, activeDevicesCount: resObj.activeDevicesCount };
      }
    } else if (exception instanceof DomainException) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof Error) {
      // Proteger contra inyección de información interna de Base de Datos (Prisma/Postgres)
      const isPrismaError = exception.name?.includes('Prisma') || (exception as any).code?.startsWith('P');
      if (isPrismaError) {
        this.logger.error(`Database Error: ${exception.message}`, exception.stack);
        status = HttpStatus.BAD_REQUEST;
        code = 'DATABASE_OPERATION_ERROR';
        message = 'Error al procesar los datos de la solicitud.';
      } else {
        this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      ...(details ? details : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
