
export function getMapKeysAsSet<K, V>(map: Map<K, V>): Set<K> {
  const mapKeys = map.keys();
  return new Set<K>(mapKeys);
}
