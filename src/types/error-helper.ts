import { GraouError } from "./graou-error";
import { GraouErrorFactory } from "./graou-error.factory";
import { GraouErrorLookup } from "./grou-error.lookup";

export interface ErrorHelper {
  factory: GraouErrorFactory;
  lookup: GraouErrorLookup;
  decorate: (cause: any) => GraouError;
  $throw: <ResultType = void>(cause: any) => ResultType;
  trap: <ResultType>(fn: () => ResultType) => ResultType;
  with: (options: { reason?: string; uid?: string }) => ErrorHelper;
}
