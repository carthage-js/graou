import { utilsErrors } from "$project/errors/utils.errors";
import { ClassErrors, ClassErrorsFactory } from "$project/types";

const graouClassSymbol = Symbol.for("Graou");

export function guardClassErrorsMismatch<Type extends Function & (new (...args: any) => any)>(
  errors: ClassErrors,
  $class: Type,
): void {
  if (errors.scope.name !== $class.name) {
    throw utilsErrors.codes.guardBindClassErrors.factory(
      `Unsafe to bind errors to class because the class name (${$class.name}) mismatch the scope name (${errors.scope.name}).`,
    );
  }

  const codeKeys = Object.keys(errors.codes);
  const methodKeys = Object.getOwnPropertyNames($class.prototype).filter(
    (key) => typeof $class.prototype[key] === "function",
  );

  const missingCodeKeys: string[] = methodKeys.filter((k) => !codeKeys.includes(k));
  const additionnalCodeKeys: string[] = codeKeys.filter((k) => !methodKeys.includes(k));

  if (missingCodeKeys.length > 0 || additionnalCodeKeys.length > 0) {
    throw utilsErrors.codes.guardBindClassErrors.factory(
      `Unsafe to bind errors to class because we have ${missingCodeKeys.length} missing codes (${missingCodeKeys.join(", ")}) and ${additionnalCodeKeys.length} additional codes (${additionnalCodeKeys.join(", ")}).`,
    );
  }
}

export function bindClassWithErrors<Type extends Function & (new (...args: any) => any)>(
  errors: ClassErrors,
  $class: Type,
): Type {
  guardClassErrorsMismatch(errors, $class);

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
      return errorHelper
        .with({ uid: `${errors.scope.name}:${errorHelper.name}` })
        .trap($class.prototype[key].bind(this, ...args));
    };

    newFn[graouClassSymbol] = errorHelper;
    $decoratedClass.prototype[key] = newFn;
  }

  return $decoratedClass;
}

export function decorateClassWithErrors<Type extends Function & (new (...args: any) => any)>(
  errorsFactory: ClassErrorsFactory,
  $class: Type,
): Type {
  return bindClassWithErrors(
    errorsFactory(
      $class.name,
      Object.getOwnPropertyNames($class.prototype).filter(
        (key) => typeof $class.prototype[key] === "function",
      ),
    ),
    $class,
  );
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
