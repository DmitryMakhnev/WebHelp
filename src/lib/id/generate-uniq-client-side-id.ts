let letLastTime = 0;
let iterator = 0;

export function generateUniqClientSideId(
  prefix: string = '',
): string {
  const currentTime = Date.now();
  if (letLastTime !== currentTime) {
    iterator = 0;
  }
  letLastTime = currentTime;
  iterator += 1;
  const resultIterator = iterator;
  return `${prefix ? `${prefix}_` : ''}${currentTime}_${resultIterator}`;
}
