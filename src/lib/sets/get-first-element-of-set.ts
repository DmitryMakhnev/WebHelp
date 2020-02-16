
export function getFirstElementFormSet<T>(set: Set<T>): T|undefined {
  // if we dont use polyfills for set for IE11, please change it to .forEach();
  const values = set.values();
  return values.next().value;
}
