export const FetchingDataStates: { [key: string]: FetchingDataState } = {
  NONE: 'none',

  READY: 'ready',

  LOADING: 'loading',
  FAILURE_DURING_LOADING: 'failure during loading',
  LOADING_AFTER_FAILURE: 'loading after failure',

  UPDATING: 'updating',
  FAILURE_DURING_UPDATE: 'failure during update',
  UPDATING_AFTER_FAILURE: 'updating after failure',
};
