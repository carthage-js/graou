import {
  GraouError,
  GraouErrorFactory,
  GraouErrorLookup,
  graouErrorUidSymbol,
} from "$project/types";
import { ErrorHelper } from "$project/types/error-helper";

export function makeErrorHelper(
  $errorClass: Function,
  factory: GraouErrorFactory,
  lookup: GraouErrorLookup,
  options?: {
    reason?: string;
    // Avoid decorate a cause when a symbol flag is defined
    uid?: string;
  },
): ErrorHelper {
  let customizedFactory = factory;
  let customizedLookup = lookup;
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

  if (options?.uid) {
    customizedFactory = function (
      factory: GraouErrorFactory,
      uid: string,
      reason?: string | null,
      options?: ErrorOptions,
    ) {
      if (
        options?.cause instanceof GraouError &&
        (options.cause as any)[graouErrorUidSymbol] === uid
      ) {
        return options.cause;
      } else if (
        options?.cause instanceof $errorClass &&
        !(options.cause as any)[graouErrorUidSymbol] &&
        Object.getPrototypeOf(options.cause) !== $errorClass
      ) {
        // Implies that is a subcode of this code.
        // If he come here then we flag him the symbol before returning it.
        Object.defineProperty(options.cause, graouErrorUidSymbol, { get: () => uid });
        return options.cause as GraouError;
      } else {
        const err = factory(reason, options);
        Object.defineProperty(err, graouErrorUidSymbol, { get: () => uid });
        return err;
      }
    }.bind(null, customizedFactory, options.uid);
    customizedLookup = function (
      lookup: GraouErrorLookup,
      withUid: string,
      errOrLambda: any,
      uid?: string,
    ) {
      return lookup(errOrLambda, uid || withUid);
    }.bind(null, customizedLookup, options.uid);
  }

  const helper: ErrorHelper = {
    factory: customizedFactory,
    lookup: customizedLookup,
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
      return makeErrorHelper($errorClass, helper.factory, helper.lookup, options);
    },
  };
  return helper;
}
