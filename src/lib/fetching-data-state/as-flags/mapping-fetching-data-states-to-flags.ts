import { FetchingDataStateFlags } from './fetching-data-state-flags';
import { FetchingDataStates } from '../fsm/value/fetching-data-states';

export const MappingFetchingDataStatesToFlags: {
  [key: string]: FetchingDataStateFlags;
} = {
  [FetchingDataStates.NONE]: new FetchingDataStateFlags(),

  [FetchingDataStates.READY]: new FetchingDataStateFlags({
    hasData: true,
    isReady: true,
  }),

  // loading
  [FetchingDataStates.LOADING]: new FetchingDataStateFlags({
    isLoading: true,
  }),
  [FetchingDataStates.FAILURE_DURING_LOADING]: new FetchingDataStateFlags({
    hasFailureDuringLoading: true,
  }),
  [FetchingDataStates.LOADING_AFTER_FAILURE]: new FetchingDataStateFlags({
    hasFailureDuringLoading: true,
    isLoadingAfterFailure: true,
  }),

  // updating
  [FetchingDataStates.UPDATING]: new FetchingDataStateFlags({
    hasData: true,
    isUpdating: true,
  }),
  [FetchingDataStates.FAILURE_DURING_UPDATE]: new FetchingDataStateFlags({
    hasData: true,
    hasFailureDuringUpdate: true,
  }),
  [FetchingDataStates.UPDATING_AFTER_FAILURE]: new FetchingDataStateFlags({
    hasData: true,
    hasFailureDuringUpdate: true,
    isUpdatingAfterFailure: true,
  }),
};

export function mapFetchingDataStateToFlags(
  fetchingDataState: FetchingDataState,
): FetchingDataStateFlags {
  return MappingFetchingDataStatesToFlags[fetchingDataState];
}
