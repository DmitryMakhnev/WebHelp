export class FetchingDataStateFlags implements BaseFetchingDataStateFlags {
  hasData: boolean = false;

  isReady: boolean = false;

  isLoading: boolean = false;

  hasFailureDuringLoading: boolean = false;

  isLoadingAfterFailure: boolean = false;

  isUpdating: boolean = false;

  hasFailureDuringUpdate: boolean = false;

  isUpdatingAfterFailure: boolean = false;

  get hasFailure(): boolean {
    return this.hasFailureDuringLoading || this.hasFailureDuringUpdate;
  }

  get isFetching(): boolean {
    return (
      this.isLoading ||
      this.isLoadingAfterFailure ||
      this.isUpdating ||
      this.isUpdatingAfterFailure
    );
  }

  constructor(creationSubset: BaseFetchingDataStateFlagsSubset = {}) {
    (Object.keys(creationSubset) as BaseFetchingDataStateKeys[]).forEach(
      key => {
        this[key] = creationSubset[key] as boolean;
      }
    );
    Object.freeze(this);
  }
}
