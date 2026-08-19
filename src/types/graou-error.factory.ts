import { GraouError } from "./graou-error";

export type GraouErrorFactory = (reason: string, options?: ErrorOptions) => GraouError;
