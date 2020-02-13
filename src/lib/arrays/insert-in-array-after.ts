
export function insertInArrayAfter<T>(
  array: T[],
  inserting: T|T[],
  itemAfter: T|null,
  checkIsItemAfter: (item: T) => boolean = item => item === itemAfter,
): T[] {
  const indexOfItemAfter = array.findIndex(checkIsItemAfter);
  if (indexOfItemAfter === -1) {
    return array.concat(inserting);
  }
  return array.slice(0, indexOfItemAfter + 1)
    .concat(
      inserting,
      array.slice(indexOfItemAfter + 1),
    );
}
