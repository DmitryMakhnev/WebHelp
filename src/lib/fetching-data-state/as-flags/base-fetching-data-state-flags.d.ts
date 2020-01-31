interface BaseFetchingDataStateFlags {
  hasData: boolean;
  isReady: boolean;

  isLoading: boolean;
  hasFailureDuringLoading: boolean;
  isLoadingAfterFailure: boolean;

  isUpdating: boolean;
  hasFailureDuringUpdate: boolean;
  isUpdatingAfterFailure: boolean;
}

type BaseFetchingDataStateFlagsSubset = Partial<BaseFetchingDataStateFlags>;
type BaseFetchingDataStateKeys = keyof BaseFetchingDataStateFlagsSubset;
