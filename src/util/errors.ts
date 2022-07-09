/**
 * @description
 * ### HttpError
 * A wrapper for the Error that includes a status code and message, i.e. for
 * sending back to the client. The constructor will accept a payload of type `string` or `object` containing properties
 * that will be JSON stringified in the message.
 */
export class HttpError extends Error {
  code!: number;
  message!: string;

  constructor(code: number, payload: string | Record<string, unknown>) {
    if (typeof payload === "string") {
      super(payload);
      this.code = code;
      this.message = payload;
    } else {
      const { code: pCode, message: pMessage, ...pRest } = payload;

      if (typeof pMessage === "string") {
        super(pMessage);
        this.message = `${pMessage}, ${JSON.stringify(pRest)}`;
      } else {
        super("An unexpected error occured.");
      }

      if (pCode) {
        if (typeof pCode === "string") {
          this.code = parseInt(pCode, 10);
        } else if (typeof pCode === "number") {
          this.code = pCode;
        }
      }
    }
  }
}
