import { ChunkedRenderListItem } from '../../chunked-render-list-item';

export function createItems(from: number, to: number, prefix = ''): ChunkedRenderListItem[] {
  const result: ChunkedRenderListItem[] = [];
  for (let i = from; i < to + 1; i += 1) {
    result.push({
      id: `${prefix}${i}`,
    });
  }
  return result;
}
