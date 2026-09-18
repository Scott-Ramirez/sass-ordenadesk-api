export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundDomainException extends DomainException {
  readonly code: string;
  readonly statusCode = 404;

  constructor(message: string, code = 'NOT_FOUND') {
    super(message);
    this.code = code;
  }
}

export class BadRequestDomainException extends DomainException {
  readonly code: string;
  readonly statusCode = 400;

  constructor(message: string, code = 'BAD_REQUEST') {
    super(message);
    this.code = code;
  }
}

export class ForbiddenDomainException extends DomainException {
  readonly code: string;
  readonly statusCode = 403;

  constructor(message: string, code = 'FORBIDDEN') {
    super(message);
    this.code = code;
  }
}

export class ConflictDomainException extends DomainException {
  readonly code: string;
  readonly statusCode = 409;

  constructor(message: string, code = 'CONFLICT') {
    super(message);
    this.code = code;
  }
}
