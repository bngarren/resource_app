import h3 from "h3-js";

const regionH3Index = "892830829cbffff";

const getChildren = (index: string) => {
  const children = h3.h3ToChildren(regionH3Index, 11);

  console.log(children);
};

const getRegion = (lat: number, long: number) => {
  return h3.geoToH3(lat, long, 11);
};

console.log(getRegion(42.33351344484759, -71.11869201284838));
