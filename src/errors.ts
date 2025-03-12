export class ValidationError extends Error {
  // TODO: Update error so it:
  // NOTE: Tests are not checking this, so testing it will be manual!
  // - takes an object containing the error as follows:
  //   {
  //     name: <name of field>,
  //     value: <value as given by client>,
  //     rule: <message explaining how the field needs to look like>
  //   }
  // - use the structure to pass the info along from the breaking point to the
  //   error handler and have the error handler present the info to the client
  constructor(message?: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
