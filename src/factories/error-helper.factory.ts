import { GraouError, GraouErrorFactory } from "$project/types";
import { ErrorHelper } from "$project/types/error-helper";

export function makeErrorHelper(
  factory: GraouErrorFactory,
  options?: {
    reason?: string;
    // Avoid decorate a cause when a symbol flag is defined
    symbol?: symbol;
  },
): ErrorHelper {
  const sym = options?.symbol;
  const helper: ErrorHelper = {
    factory: !sym
      ? factory
      : (reason, options) => {
          if (options?.cause instanceof GraouError && Boolean((options.cause as any)[sym])) {
            return options.cause;
          } else {
            const err = factory(reason, options);
            Object.defineProperty(err, sym, { get: () => true });
            return err;
          }
        },
    decorate(cause: any) {
      return helper.factory(options?.reason, {
        cause,
      });
    },
    $throw(cause: any) {
      throw helper.decorate(cause);
    },
    trap<ResultType>(fn: () => ResultType) {
      try {
        const result = fn();
        if (result instanceof Promise) {
          return result.catch(helper.$throw) as ResultType;
        } else {
          return result;
        }
      } catch (cause) {
        throw helper.decorate(cause);
      }
    },
    with(options) {
      return makeErrorHelper(helper.factory, options);
    },
  };
  return helper;
}
