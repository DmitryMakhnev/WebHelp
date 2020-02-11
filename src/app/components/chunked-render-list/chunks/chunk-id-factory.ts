
let chunkId = 1;

export const createChunkId = () => {
  chunkId += 1;
  return chunkId.toString(10);
};
