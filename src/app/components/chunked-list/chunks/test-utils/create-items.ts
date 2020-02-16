import { ChunkedListItem } from '../../types/chunked-list-item';

export function createItems(from: number, to: number, prefix = ''): ChunkedListItem[] {
  const result: ChunkedListItem[] = [];
  for (let i = from; i < to + 1; i += 1) {
    result.push({
      id: `${prefix}${i}`,
    });
  }
  return result;
}
