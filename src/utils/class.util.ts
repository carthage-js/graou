import { ClassErrors, ClassErrorsFactory } from "$project/types";

const graouClassSymbol = Symbol.for("Graou");

export function decorateClassWithErrors<Type extends Function & (new (...args: any) => any)>(
  errorsFactory: ClassErrorsFactory,
  $class: Type,
): Type {
  const errors = errorsFactory(
    $class.name,
    Object.getOwnPropertyNames($class.prototype).filter(
      (key) => typeof $class.prototype[key] === "function",
    ),
  );

  const $decoratedClass = class extends $class {
    constructor(...args: any[]) {
      try {
        super(...args);
      } catch (cause) {
        throw errors.codes["constructor"].decorate(cause);
      }
    }
  };

  $decoratedClass.prototype[graouClassSymbol] = errors;

  for (const key of Object.keys(errors.codes)) {
    if (key === "constructor") {
      continue;
    }

    const errorHelper = errors.codes[key];
    const newFn = function (...args: any[]) {
      return errorHelper.trap($class.prototype[key].bind(this, ...args));
    };

    newFn[graouClassSymbol] = errorHelper;
    $decoratedClass.prototype[key] = newFn;
  }

  return $decoratedClass;
}

export function getClassErrors($class: Function): ClassErrors | undefined {
  return $class.prototype[graouClassSymbol];
}

export function isInstanceOfClassErrors($class: Function, error: any) {
  const $classErrors = getClassErrors($class);

  if (!$classErrors) {
    return false;
  }

  return error instanceof $classErrors.scope.$class;
}

export function getMethodError($method: Function): ClassErrors["codes"][""] | undefined {
  return ($method as any)[graouClassSymbol];
}

export function isInstanceOfMethodError($method: Function, error: any) {
  const $methodError = getMethodError($method);

  if (!$methodError) {
    return false;
  }

  return error instanceof $methodError.$class;
}
