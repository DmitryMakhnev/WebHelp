
export function jsxIf<T, T2>(
  isTrue: boolean,
  trueResult: T,
  falseResult: T2|null = null,
) {
  return isTrue ? trueResult : falseResult;
}
