// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck Still some type errors in this file that need to be worked out
import { Request } from "express";
import { Response } from "express-serve-static-core";
import { operations } from "./openapi";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "../util/errors";

/*
This is not a generated file. We manually add types here to help use the generated types
in openapi.ts
*/

// Borrowed from https://github.com/drwpow/openapi-typescript/issues/748#issuecomment-1159449381

export type ApiOperations = keyof operations;

export type ResponseType<T extends ApiOperations> =
  200 extends keyof operations[T]["responses"]
    ? "content" extends keyof operations[T]["responses"][200]
      ? "application/json" extends keyof operations[T]["responses"][200]["content"]
        ? operations[T]["responses"][200]["content"]["application/json"]
        : never
      : never
    : never;

export type TypedResponse<T extends ApiOperations> = Response<ResponseType<T>>;

type PayloadType<
  operationType extends ApiOperations & string,
  codeType extends keyof operations[operationType]["responses"] &
    (number | "default" | StatusCodes)
> = "content" extends keyof operations[operationType]["responses"][codeType]
  ? "application/json" extends keyof operations[operationType]["responses"][codeType]["content"]
    ? operations[operationType]["responses"][codeType]["content"]["application/json"]
    : null
  : null;

/**
 * Send response with json payload
 *
 * @param res Express Response object
 * @param _operationId OpenAPI's operation id
 * @param code HTTP code or "default"
 * @param payload response payload
 */
export function resSendJson<
  operationType extends ApiOperations & string,
  codeType extends keyof operations[operationType]["responses"] &
    (number | "default" | StatusCodes),
  payloadType extends PayloadType<operationType, codeType>
>(
  res: TypedResponse<operationType>,
  code: codeType,
  payload: payloadType
): Response {
  if (code === "default") {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(payload as unknown as any);
  } else {
    return res.status(code).json(payload as unknown as any);
  }
}

/**
 * Send response with status code, without payload.
 *
 * @param res Express Response object
 * @param _operationId OpenAPI's operation id
 * @param code HTTP code
 */
export function resSendStatus<
  operationType extends ApiOperations & string,
  codeType extends keyof operations[operationType]["responses"] &
    (number | "default" | StatusCodes)
>(res: TypedResponse<operationType>, code: codeType): Response {
  if (code === "default") {
    return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  } else {
    return res.sendStatus(code);
  }
}

// ERRORS
/**
 * @description
 * Create a new HttpError based on the allowed codes and payload of this endpoint.
 * This allows us to create HttpError objects that are expected by the express middleware 
 * and also carry a payload that meets the requirements of the OpenAPI spec for that operation
 * 
 * @example
 * ```javascript
 * // Within express route handler
 * next(
      newTypedHttpError("scan", StatusCodes.BAD_REQUEST, {
        code: StatusCodes.BAD_REQUEST.toString(),
        message: "Invalid user position in the request",
      })
    );
    ```
 * 
 * @param operation API endpoint, e.g. "scan"
 * @param code Http status code
 * @param payload Can be string or object, depending on the return type expected by the openAPI spec
 * @returns
 */
export const newTypedHttpError = <
  operationType extends ApiOperations & string,
  codeType extends keyof operations[operationType]["responses"] &
    (number | "default" | StatusCodes),
  payloadType extends PayloadType<operationType, codeType> &
    Record<string, unknown>
>(
  operation: operationType,
  code: codeType,
  payload: payloadType
): HttpError => {
  const newPayload = payload ?? "An unexpected error occured.";
  if (code === "default") {
    return new HttpError(StatusCodes.INTERNAL_SERVER_ERROR, newPayload);
  } else {
    return new HttpError(code, newPayload);
  }
};

// REQUESTS

type RequestPathParamType<T extends ApiOperations> =
  "path" extends keyof operations[T]["parameters"]
    ? operations[T]["parameters"]["path"]
    : never;

type RequestQueryParamType<T extends ApiOperations> =
  "query" extends keyof operations[T]["parameters"]
    ? operations[T]["parameters"]["query"]
    : never;

type RequestBodyType<T extends ApiOperations> =
  "requestBody" extends keyof operations[T]
    ? "content" extends keyof operations[T]["requestBody"]
      ? "application/json" extends keyof operations[T]["requestBody"]["content"]
        ? operations[T]["requestBody"]["content"]["application/json"]
        : never
      : never
    : never;

/**
 * General express req typing
 */
export type TypedRequest<T extends ApiOperations> = Request<
  RequestPathParamType<T>,
  unknown,
  RequestBodyType<T>,
  RequestQueryParamType<T>
>;
