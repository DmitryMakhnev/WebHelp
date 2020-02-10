
let chunkId = 1;

export const chunkIdsFactory = () => {
  chunkId += 1;
  return chunkId.toString(10);
};
