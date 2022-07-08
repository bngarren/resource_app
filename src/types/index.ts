import * as APITypes from "./openapi";
export * from "./openapi.extended";
export * from "./requestResponse.types";
export * from "./scanService.types";

export type APISchemas = APITypes.components["schemas"];
export type APIResponses = APITypes.components["responses"];

export type Coordinate = APISchemas["Coordinate"];
export type Region = APISchemas["Region"];
export type Resource = APISchemas["Resource"];
export type Interactable = APISchemas["Interactable"];
export type ScannedResource = APISchemas["ScannedResource"];
export type ScannedRegion = APISchemas["ScannedRegion"];
export type ScanResult = APISchemas["ScanResult"];
