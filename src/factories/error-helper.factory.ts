import { GraouErrorFactory } from "$project/types";
import { ErrorHelper } from "$project/types/error-helper";

export function makeErrorHelper(factory: GraouErrorFactory, reason?: string | null): ErrorHelper {
  const helper: ErrorHelper = {
    factory,
    decorate(cause: any) {
      return factory(reason, {
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
    with(reason) {
      return makeErrorHelper(factory, reason);
    },
  };
  return helper;
}
