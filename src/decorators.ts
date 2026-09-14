import { ClassErrors, ClassErrorsFactory } from "./types";
import { decorateClassWithErrors, bindClassWithErrors } from "./utils";

export function AutoErrors(errorsOrErrorsFactory: ClassErrorsFactory | ClassErrors) {
  return function <Type extends Function & (new (...args: any) => any)>($class: Type) {
    if (typeof errorsOrErrorsFactory === "function") {
      return decorateClassWithErrors(errorsOrErrorsFactory, $class);
    } else {
      return bindClassWithErrors(errorsOrErrorsFactory, $class);
    }
  };
}
