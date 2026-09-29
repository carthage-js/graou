export type AnnotationValue =
  | { [key: string]: AnnotationValue }
  | AnnotationValue[]
  | string
  | number
  | boolean
  | null;

export interface Annotation {
  name: string;
  value: AnnotationValue;
}
