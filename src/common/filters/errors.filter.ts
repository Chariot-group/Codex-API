import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetailsDto } from '@/common/dtos/errors.dto';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const base: ProblemDetailsDto = {
      type: `https://httpstatuses.io/${status}`,
      title: HttpStatus[status],
      status,
      instance: req.url,
    };

    let body: ProblemDetailsDto = { ...base };

    // class-validator (ValidationPipe)
    if (isHttpException) {
      const response = exception.getResponse();

      body.title = (response as any)?.error || body.title;

      if (typeof response === 'object' && Array.isArray((response as any).message)) {
        const messages: string[] = (response as any).message;

        body.detail = "Validation failed";

        // RFC 9457: extraction champ + raison
        body["invalid-params"] = messages.map((msg) => {
          const [field, ...rest] = msg.split(" ");
          return {
            name: field,
            reason: rest.join(" "),
          };
        });

        return res.status(status).json(body);
      }

      // HttpException standard
      if (typeof response === 'string') {
        body.detail = response;
      } else if (typeof response === 'object') {
        const { message, error } = response as any;

        if (typeof message === 'string') {
          body.detail = message;
        } else if (Array.isArray(message)) {
          body.detail = "Validation failed";
          body["invalid-params"] = message.map((msg) => {
            const [field, ...rest] = msg.split(" ");
            return {
              name: field,
              reason: rest.join(" "),
            };
          });
        }
      }
    } else {
      // Erreurs non prévues
      body.detail = exception?.message ?? "Unexpected error";
    }

    return res.status(status).json(body);
  }
}