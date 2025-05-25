export default class Result<TValue> {
  isSuccess: boolean;
  isFailure: boolean;

  #success: TValue | null;
  #failure: Error | null;

  get success() {
    if (this.isSuccess) {
      return this.#success!;
    }
    console.error('Tried getting success when there was an error');
    throw this.#failure;
  }

  get failure() {
    if (this.isFailure) {
      return this.#failure!;
    }
    throw new Error('Tried getting error when there was a success');
  }

  constructor(successVal: TValue | null, failureVal: Error | null) {
    this.isSuccess = successVal !== null;
    this.isFailure = failureVal !== null;
    this.#success = successVal;
    this.#failure = failureVal;
  }

  static success<T>(value: T) {
    return new Result(value, null);
  }

  static failure<TValue, TError extends Error>(value: TError) {
    return new Result<TValue>(null, value);
  }
}
