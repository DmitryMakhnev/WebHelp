import { SEARCH_ACTION } from './serach-action';

export function resolveSearchAction(query: string, isInSearchMode: boolean): SEARCH_ACTION {
  const hasSearchQuery = query.length !== 0;
  if (hasSearchQuery) {
    if (!isInSearchMode) {
      return 'START';
    }
    return 'CONTINUE';
  }
  return 'STOP';
}
