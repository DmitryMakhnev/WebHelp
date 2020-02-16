
export class Debouncer<T> {
  constructor(
    private func: (options: T) => void,
    private delay: number = 500,
  ) {}

  private currentTimeoutId: number|undefined;

  run(options: T) {
    if (this.currentTimeoutId) {
      clearTimeout(this.currentTimeoutId);
    }
    this.currentTimeoutId = setTimeout(this.func, this.delay, options);
  }
}
