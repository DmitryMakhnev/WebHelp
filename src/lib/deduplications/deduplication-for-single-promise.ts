export class DeduplicationForSinglePromise<Result> {
  private cache: Promise<Result> | null = null;

  constructor(private creator: () => Promise<Result>) {}

  run(): Promise<Result> {
    if (!this.cache) {
      this.cache = this.creator().finally(() => {
        this.cache = null;
      });
    }
    return this.cache;
  }
}
