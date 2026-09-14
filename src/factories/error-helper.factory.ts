import { GraouError, GraouErrorFactory } from "$project/types";
import { ErrorHelper } from "$project/types/error-helper";

export function makeErrorHelper(
  $errorClass: Function,
  factory: GraouErrorFactory,
  options?: {
    reason?: string;
    // Avoid decorate a cause when a symbol flag is defined
    symbol?: symbol;
  },
): ErrorHelper {
  let customizedFactory = factory;
  if (options?.reason) {
    customizedFactory = function (
      factory: GraouErrorFactory,
      defaultReason: string,
      reason?: string | null,
      options?: ErrorOptions,
    ) {
      return factory(reason ?? defaultReason, options);
    }.bind(null, customizedFactory, options.reason);
  }

  if (options?.symbol) {
    customizedFactory = function (
      factory: GraouErrorFactory,
      sym: symbol,
      reason?: string | null,
      options?: ErrorOptions,
    ) {
      if (options?.cause instanceof GraouError && Boolean((options.cause as any)[sym])) {
        return options.cause;
      } else if (
        options?.cause instanceof $errorClass &&
        !(options.cause as any)[sym] &&
        Object.getPrototypeOf(options.cause) !== $errorClass
      ) {
        // Implies that is a subcode of this code.
        // If he come here then we flag him the symbol before returning it.
        Object.defineProperty(options.cause, sym, { get: () => true });
        return options.cause as GraouError;
      } else {
        const err = factory(reason, options);
        Object.defineProperty(err, sym, { get: () => true });
        return err;
      }
    }.bind(null, customizedFactory, options.symbol);
  }

  const helper: ErrorHelper = {
    factory: customizedFactory,
    decorate(cause: any) {
      return helper.factory(null, {
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
      return makeErrorHelper($errorClass, helper.factory, options);
    },
  };
  return helper;
}
