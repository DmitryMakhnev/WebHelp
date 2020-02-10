
export function getMapKesAsArray<K, V>(map: Map<K, V>): K[] {
  return Array.from(map.keys());
}
