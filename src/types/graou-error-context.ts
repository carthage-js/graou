import { Annotation } from "$project/types/annotation";

export class GraouErrorContext {
  #_labels: string[];
  #_annotations: Annotation[];

  constructor() {
    this.#_labels = [];
    this.#_annotations = [];
  }

  addLabels(...labels: string[]): this {
    this.#_labels.push(...labels);
    return this;
  }

  getLabels(): string[] {
    return this.#_labels;
  }

  setLabels(...labels: string[]): this {
    this.#_labels.length = 0;
    this.#_labels.push(...labels);
    return this;
  }

  addAnnotations(...annotations: Annotation[]): this {
    this.#_annotations.push(...annotations);
    return this;
  }

  getAnnotations(): Annotation[] {
    return this.#_annotations;
  }

  setAnnotations(...annotations: Annotation[]): this {
    this.#_annotations.length = 0;
    this.#_annotations.push(...annotations);
    return this;
  }
}
