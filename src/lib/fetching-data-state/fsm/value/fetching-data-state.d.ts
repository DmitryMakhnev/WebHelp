type FetchingDataState =
  | 'none'
  | 'ready'
  | 'loading'
  | 'failure during loading'
  | 'loading after failure'
  | 'updating'
  | 'failure during update'
  | 'updating after failure';
