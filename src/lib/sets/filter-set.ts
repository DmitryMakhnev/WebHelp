export function filterSet<T>(filterableSet: Set<T>, applyFilterRule: (item: T) => boolean): Set<T> {
  const filteredSet = new Set<T>();
  filterableSet.forEach(item => {
    if (applyFilterRule(item)) {
      filteredSet.add(item);
    }
  });
  return filteredSet;
}
