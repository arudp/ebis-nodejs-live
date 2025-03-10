export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class DBError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "DBError";
    Object.setPrototypeOf(this, DBError.prototype);
  }
}

export class DuplicateEntityError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "DuplicateEntityError";
    Object.setPrototypeOf(this, DuplicateEntityError.prototype);
  }
}
