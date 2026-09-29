import { GraouError } from "./graou-error";
import { GraouErrorFactory } from "./graou-error.factory";
import { GraouErrorLookup } from "./grou-error.lookup";
import { Annotation } from "$project/types/annotation";

export interface ErrorHelper {
  factory: GraouErrorFactory;
  lookup: GraouErrorLookup;
  decorate: (cause: any) => GraouError;
  $throw: <ResultType = void>(cause: any) => ResultType;
  trap: <ResultType>(fn: () => ResultType) => ResultType;
  with: (options: {
    annotations?: Array<Annotation>;
    labels?: Array<string>;
    reason?: string;
    uid?: string;
  }) => ErrorHelper;
}
