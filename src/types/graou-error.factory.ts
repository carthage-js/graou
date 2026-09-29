import { GraouError } from "./graou-error";
import { GraouErrorOptions } from "$project/types/graou-error-options";

export type GraouErrorFactory = (reason?: string | null, options?: GraouErrorOptions) => GraouError;
