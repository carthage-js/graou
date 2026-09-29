import { describe, expect, test } from "@jest/globals";

import {
  bindClassWithErrors,
  decorateClassWithErrors,
  getClassErrors,
  getMethodError,
  guardClassErrorsMismatch,
  isInstanceOfClassErrors,
  isInstanceOfMethodError,
} from "$project/utils/class.util";
import { utilsErrors } from "$project/errors";
import { GraouError, GraouErrorContext } from "$project/types";
import { makeModuleErrorsFactory } from "$project/factories";

describe("guardClassErrorsMismatch", () => {
  const errorsFactory = makeModuleErrorsFactory({
    moduleName: "jest",
  });

  test("Must not throw when errors are matching class methods and constructor", () => {
    expect(() =>
      guardClassErrorsMismatch(errorsFactory("SUCCESS", ["constructor"]), class SUCCESS {}),
    ).not.toThrow();

    class Parent {
      d() {}
    }

    expect(() =>
      guardClassErrorsMismatch(
        errorsFactory("SUCCESS", ["constructor", "a", "b", "c"]),
        class SUCCESS extends Parent {
          private _attr = false;

          private a() {}

          b() {}

          c() {}
        },
      ),
    ).not.toThrow();
  });

  test("Must throw when errors are not matching class methods and constructor", () => {
    expect(() => guardClassErrorsMismatch(errorsFactory("FAILURE", []), class FAILURE {})).toThrow(
      utilsErrors.codes.guardBindClassErrors.$class,
    );

    expect(() =>
      guardClassErrorsMismatch(errorsFactory("FAILURE", ["constructor"]), class {}),
    ).toThrow(utilsErrors.codes.guardBindClassErrors.$class);

    class Parent {
      d() {}
    }

    expect(() =>
      guardClassErrorsMismatch(
        errorsFactory("FAILURE", ["constructor", "a", "c", "d"]),
        class FAILURE extends Parent {
          private _attr = false;

          private a() {}

          b() {}

          c() {}
        },
      ),
    ).toThrow(utilsErrors.codes.guardBindClassErrors.$class);
  });
});

describe("bindClassWithErrors", () => {
  const errorsFactory = makeModuleErrorsFactory({
    moduleName: "jest",
  });

  class Parent {
    my_parent_class() {
      throw new Error("Not decorated");
    }
  }

  class Demo extends Parent {
    private _graouErrorContext!: GraouErrorContext;

    constructor($throw: boolean) {
      super();
      if ($throw) {
        throw new Error("contructor");
      }
    }

    my_child_class() {
      throw new Error("Decorated");
    }

    with_error_context() {
      this._graouErrorContext.addLabels("1", "2");

      this._graouErrorContext.addAnnotations({
        name: "demo",
        value: 0,
      });

      this._graouErrorContext.addAnnotations({
        name: "demo2",
        value: 1,
      });

      throw new Error("context");
    }

    with_self() {
      this._graouErrorContext.addLabels("1");
      return this;
    }

    async with_async_self() {
      this._graouErrorContext.addLabels("1");
      return this;
    }

    async with_async_other() {
      this._graouErrorContext.addLabels("1");
      return 0;
    }
  }

  const errors = errorsFactory("Demo", [
    "constructor",
    "my_child_class",
    "with_error_context",
    "with_self",
    "with_async_self",
    "with_async_other",
  ]);
  const DemoDecorated = bindClassWithErrors(errors, Demo);

  test("Must throw the raw error of a parent class", () => {
    expect(() => new DemoDecorated(false).my_parent_class()).toThrow();
    expect(() => new DemoDecorated(false).my_parent_class()).not.toThrow(errors.scope.$class);
  });

  test("Must throw the right code upon the right function", () => {
    expect(() => new DemoDecorated(true)).toThrow(errors.codes.constructor.$class);
    expect(() => new DemoDecorated(false).my_child_class()).toThrow(
      errors.codes.my_child_class.$class,
    );
  });

  test("The error context must hydrate on the error", () => {
    const err = errors.codes.with_error_context.lookup(() =>
      new DemoDecorated(false).with_error_context(),
    );
    expect(err).toBeDefined();
    expect(err?.toJSON()).toEqual({
      annotations: [
        {
          name: "demo",
          value: 0,
        },
        {
          name: "demo2",
          value: 1,
        },
      ],
      cause: "context",
      code: "with_error_context",
      labels: ["1", "2"],
      nodeModule: "jest",
      reason: null,
      scope: "Demo",
    });
  });

  test("The error context can't reach outside the function", () => {
    expect(new DemoDecorated(false).with_self()).toBeInstanceOf(DemoDecorated);
  });

  test("The error context can't reach outside the async function", async () => {
    await expect(new DemoDecorated(false).with_async_self()).resolves.toBeInstanceOf(DemoDecorated);
  });

  test("The error context doesn't alter an async result", async () => {
    await expect(new DemoDecorated(false).with_async_other()).resolves.toEqual(0);
  });
});

describe("decorateClassWithErrors", () => {
  const errorsFactory = makeModuleErrorsFactory({
    moduleName: "jest",
  });

  test("basic usage", () => {
    const Test = decorateClassWithErrors(
      errorsFactory,
      class Test {
        constructor($throw: boolean = false) {
          if ($throw) {
            throw new Error("Fatal");
          }
        }

        a() {
          this.b();
        }

        b() {
          throw new Error("Oupsie");
        }

        c() {}
      },
    );

    const test = new Test();
    expect(() => test.a()).toThrow();
    expect(() => test.b()).toThrow();
    expect(() => test.c()).not.toThrow();

    try {
      test.a();
    } catch (err: any) {
      expect(err.scope).toEqual("Test");
      expect(err.code).toEqual("a");
      expect(err.cause.scope).toEqual("Test");
      expect(err.cause.code).toEqual("b");
      expect(err.cause.cause.message).toEqual("Oupsie");
      expect(Boolean(err.cause.cause.cause)).toBeFalsy();
    }

    try {
      test.b();
    } catch (err: any) {
      expect(err.scope).toEqual("Test");
      expect(err.code).toEqual("b");
      expect(err.cause.message).toEqual("Oupsie");
      expect(Boolean(err.cause.cause)).toBeFalsy();
    }

    expect(() => new Test(true)).toThrow();

    try {
      new Test(true);
    } catch (err: any) {
      expect(err.scope).toEqual("Test");
      expect(err.code).toEqual("constructor");
      expect(err.cause.message).toEqual("Fatal");
    }
  });

  test("don't overwrite inherited class", () => {
    class Parent {
      parent() {
        throw new Error("PARENT_ERROR");
      }
    }

    const Test = decorateClassWithErrors(
      errorsFactory,
      class Test extends Parent {
        child() {
          throw new Error("CHILD_ERROR");
        }
      },
    );

    const test = new Test();
    expect(() => test.parent()).toThrow();
    expect(() => test.child()).toThrow();

    try {
      test.parent();
    } catch (err: any) {
      expect(err).not.toBeInstanceOf(GraouError);
      expect(err.message).toEqual("PARENT_ERROR");
      expect(Boolean(err.cause)).toBeFalsy();
    }

    try {
      test.child();
    } catch (err: any) {
      expect(err).toBeInstanceOf(GraouError);
      expect(err.scope).toEqual("Test");
      expect(err.code).toEqual("child");
      expect(err.cause.message).toEqual("CHILD_ERROR");
      expect(Boolean(err.cause.cause)).toBeFalsy();
    }
  });
});

describe("getClassErrors & isInstanceOfClassErrors", () => {
  const errorsFactory = makeModuleErrorsFactory({
    moduleName: "jest",
  });

  test("basic usage", () => {
    const Test = decorateClassWithErrors(
      errorsFactory,
      class Test {
        a() {
          throw new Error("Oupsie");
        }
      },
    );

    expect(Boolean(getClassErrors(class {}))).toBeFalsy();
    expect(Boolean(getClassErrors(Test))).toBeTruthy();

    const test = new Test();
    expect(() => test.a()).toThrow();

    try {
      test.a();
    } catch (err: any) {
      expect(isInstanceOfClassErrors(class {}, err)).toBeFalsy();
      expect(isInstanceOfClassErrors(Test, err)).toBeTruthy();
    }
  });
});

describe("getMethodError & isInstanceOfMethodError", () => {
  const errorsFactory = makeModuleErrorsFactory({
    moduleName: "jest",
  });

  test("basic usage", () => {
    const Test = decorateClassWithErrors(
      errorsFactory,
      class Test {
        a() {
          throw new Error("Oupsie");
        }

        b() {
          throw new Error("Oupsie 2");
        }
      },
    );

    class OrdinaryTest {
      a() {}
    }

    expect(Boolean(getMethodError(OrdinaryTest.prototype.a))).toBeFalsy();
    expect(Boolean(getMethodError(Test.prototype.a))).toBeTruthy();

    const test = new Test();
    expect(() => test.a()).toThrow();

    try {
      test.a();
    } catch (err: any) {
      expect(isInstanceOfMethodError(OrdinaryTest.prototype.a, err)).toBeFalsy();
      expect(isInstanceOfMethodError(Test.prototype.a, err)).toBeTruthy();
      expect(isInstanceOfMethodError(Test.prototype.b, err)).toBeFalsy();
    }
  });
});
