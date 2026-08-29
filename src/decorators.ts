import { ClassErrorsFactory } from "./types";
import { decorateClassWithErrors } from "./utils";

export function AutoErrors(errorsFactory: ClassErrorsFactory) {
  return function <Type extends Function & (new (...args: any) => any)>($class: Type) {
    return decorateClassWithErrors(errorsFactory, $class);
  };
}
