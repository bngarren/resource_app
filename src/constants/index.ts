export const RESOURCES_PER_REGION = 3;
export const RESOURCE_H3_RESOLUTION = 11;

export const REGION_H3_RESOLUTION = 9;
export const RES_9_EDGE_LENGTH = 0.174375668 * 1000; // meters
export const REGION_RESET_INTERVAL = 3; //days (time until a region is stale)

export const SCAN_DISTANCE = 1; // h3.kRing distance

// the estimated diameter of res 8 hexagon (parent) multipled by a factor derived empirically
export const SCAN_DISTANCE_METERS = 0.461354684 * 2 * 1000 * 0.78;
export const USER_AREA_OF_EFFECT = 25; // meters
