import {
  CheckViolationError,
  DataError,
  DBError,
  ForeignKeyViolationError,
  NotFoundError,
  NotNullViolationError,
  UniqueViolationError,
  ValidationError,
} from "objection";
import { logger } from "../logger";

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

/**
 * @description
 * ### handleDatabaseError
 * Receives errors from database-related functions, logs them, and returns a new, sanitized Error message for the client
 * @param error
 * @returns new Error
 */
export const handleDatabaseError = (error: Error) => {
  if (error instanceof ValidationError) {
    switch (error.type) {
      case "ModelValidation":
        logger.error(`${error.type}: ${error.message} [${error.data}]`);
        break;
      case "RelationExpression":
        logger.error(`${error.type}: ${error.message}`);
        break;
      case "UnallowedRelation":
        logger.error(`${error.type}: ${error.message}`);
        break;
      case "InvalidGraph":
        logger.error(`${error.type}: ${error.message}`);
        break;
      default:
        logger.error(
          `UnknownValidationError: ${error.message} [${error.data}]`
        );
        break;
    }
    return new Error(`DatabaseValidationError`);
  } else if (error instanceof NotFoundError) {
    logger.error(`NotFound: ${error.message}`);
    return new Error("DatabaseNotFoundError");
  } else if (error instanceof UniqueViolationError) {
    const data = {
      columns: error.columns,
      table: error.table,
      constraint: error.constraint,
    };
    logger.error(`UniqueViolation: ${error.message} [${data}]`);
  } else if (error instanceof NotNullViolationError) {
    const data = {
      columns: error.column,
      table: error.table,
    };
    logger.error(`NotNullViolation: ${error.message} [${data}]`);
  } else if (error instanceof ForeignKeyViolationError) {
    const data = {
      table: error.table,
      constraint: error.constraint,
    };
    logger.error(`ForeignKeyViolation: ${error.message} [${data}]`);
  } else if (error instanceof CheckViolationError) {
    const data = {
      table: error.table,
      constraint: error.constraint,
    };
    logger.error(`CheckViolation: ${error.message} [${data}]`);
  } else if (error instanceof DataError) {
    logger.error(`InvalidData: ${error.message}`);
  } else if (error instanceof DBError) {
    logger.error(`UnknownDatabaseError: ${error.message}]`);
  } else {
    logger.error(`UnknownError: ${error.message}`);
  }
  return new Error("DatabaseError");
};
