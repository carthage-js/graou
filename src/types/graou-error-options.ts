import { Annotation } from "$project/types/annotation";

export interface GraouErrorOptions extends ErrorOptions {
  labels?: Array<string>;
  annotations?: Array<Annotation>;
}
