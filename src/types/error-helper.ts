import { GraouError } from "./graou-error";
import { GraouErrorFactory } from "./graou-error.factory";

export interface ErrorHelper {
  factory: GraouErrorFactory;
  decorate: (cause: any) => GraouError;
  $throw: (cause: any) => void;
  trap: <ResultType>(fn: () => ResultType) => ResultType;
  with: (options: { reason?: string; symbol?: symbol }) => ErrorHelper;
}
