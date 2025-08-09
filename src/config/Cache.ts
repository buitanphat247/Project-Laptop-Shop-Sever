import NodeCache from "node-cache";

export const tempCache = new NodeCache({
  stdTTL: 1200,
});
