import { GraouError } from "./graou-error";

export type GraouErrorLookup = (errOrLambda: any, uid?: string) => GraouError | undefined;
