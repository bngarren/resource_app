import h3 from "h3-js";

const regionH3Index = "892830829cbffff";

const getChildren = (index: string) => {
  const children = h3.h3ToChildren(regionH3Index, 11);

  console.log(children);
};

console.log(h3.getRes0Indexes().length);
