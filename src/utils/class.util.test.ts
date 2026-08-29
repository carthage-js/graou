import { describe, test, expect } from "@jest/globals";

import { makeModuleErrorsFactory } from "../factories";
import {
  decorateClassWithErrors,
  getClassErrors,
  getMethodError,
  isInstanceOfClassErrors,
  isInstanceOfMethodError,
} from "./class.util";
import { GraouError } from "../types";

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
