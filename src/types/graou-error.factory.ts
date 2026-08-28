import { GraouError } from "./graou-error";

export type GraouErrorFactory = (reason?: string | null, options?: ErrorOptions) => GraouError;
