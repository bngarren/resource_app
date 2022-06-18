import h3 from "h3-js";

const h3Index = "89283082837ffff";

const location = h3.h3ToGeo(h3Index);

const h3Group = h3.kRing(h3Index, 1);

console.log("location:", location);
console.log("group:", h3Group);
