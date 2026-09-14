import { describe, test, expect, jest } from "@jest/globals";

import { makeErrors } from "./errors.factory";
import { MessageFactory, graouErrorUidSymbol } from "../types";

describe("makeErrors", () => {
  test("Check if the properties match the final object", () => {
    const messageFactory: jest.Mock<MessageFactory> = jest.fn();
    const errors = makeErrors(
      {
        moduleName: "jest",
        messageFactory,
      },
      "Errors",
      ["CODE_A", "CODE_B", "CODE_C"],
      {
        CODE_B: ["SUBCODE_A"],
      },
    );
    const errorsAsAny: any = errors as never;

    expect(errors.scope.name).toEqual("Errors");

    expect(errors.codes.CODE_A.name).toEqual("CODE_A");
    expect(errors.codes.CODE_A.factory).toBeDefined();
    expect(errorsAsAny.codes.CODE_A.subcodes).not.toBeDefined();

    expect(errors.codes.CODE_B.name).toEqual("CODE_B");
    expect(errors.codes.CODE_B.subcodes.SUBCODE_A.name).toEqual("SUBCODE_A");
    expect(errorsAsAny.codes.CODE_B.factory).toBeDefined();

    expect(errors.codes.CODE_C.name).toEqual("CODE_C");
    expect(errorsAsAny.codes.CODE_C.factory).toBeDefined();
    expect(errorsAsAny.codes.CODE_C.subcodes).not.toBeDefined();

    expect(errors.codes.CODE_A.factory()).toBeInstanceOf(errors.scope.$class);
    expect(errors.codes.CODE_A.factory("test")).toBeInstanceOf(errors.scope.$class);
    expect(errors.codes.CODE_A.factory("test")).toBeInstanceOf(errors.codes.CODE_A.$class);
    expect(errors.codes.CODE_A.factory("test")).not.toBeInstanceOf(errors.codes.CODE_B.$class);
    expect(errors.codes.CODE_A.factory("test")).not.toBeInstanceOf(
      errors.codes.CODE_B.subcodes.SUBCODE_A.$class,
    );
    expect(errors.codes.CODE_A.factory("test")).not.toBeInstanceOf(errors.codes.CODE_C.$class);

    expect(errors.codes.CODE_B.factory("test")).toBeInstanceOf(errors.scope.$class);
    expect(errors.codes.CODE_B.factory("test")).not.toBeInstanceOf(errors.codes.CODE_A.$class);
    expect(errors.codes.CODE_B.factory("test")).not.toBeInstanceOf(
      errors.codes.CODE_B.subcodes.SUBCODE_A.$class,
    );
    expect(errors.codes.CODE_B.factory("test")).not.toBeInstanceOf(errors.codes.CODE_C.$class);

    expect(errors.codes.CODE_B.subcodes.SUBCODE_A.factory("test")).toBeInstanceOf(
      errors.scope.$class,
    );
    expect(errors.codes.CODE_B.subcodes.SUBCODE_A.factory("test")).not.toBeInstanceOf(
      errors.codes.CODE_A.$class,
    );
    expect(errors.codes.CODE_B.subcodes.SUBCODE_A.factory("test")).toBeInstanceOf(
      errors.codes.CODE_B.$class,
    );
    expect(errors.codes.CODE_B.subcodes.SUBCODE_A.factory("test")).toBeInstanceOf(
      errors.codes.CODE_B.subcodes.SUBCODE_A.$class,
    );
    expect(errors.codes.CODE_B.subcodes.SUBCODE_A.factory("test")).not.toBeInstanceOf(
      errors.codes.CODE_C.$class,
    );

    expect(errors.codes.CODE_C.factory("test")).toBeInstanceOf(errors.scope.$class);
    expect(errors.codes.CODE_C.factory("test")).not.toBeInstanceOf(errors.codes.CODE_A.$class);
    expect(errors.codes.CODE_C.factory("test")).not.toBeInstanceOf(errors.codes.CODE_B.$class);
    expect(errors.codes.CODE_C.factory("test")).not.toBeInstanceOf(
      errors.codes.CODE_B.subcodes.SUBCODE_A.$class,
    );
    expect(errors.codes.CODE_C.factory("test")).toBeInstanceOf(errors.codes.CODE_C.$class);
  });

  describe("Use lookup to query nested error", () => {
    const messageFactory: jest.Mock<MessageFactory> = jest.fn();
    const errors = makeErrors(
      {
        moduleName: "jest",
        messageFactory,
      },
      "Errors",
      ["CODE_A", "CODE_B", "CODE_C"],
      {
        CODE_A: ["SUBCODE_A", "SUBCODE_B"],
      },
    );

    test("if lambda didn't throw then lookup must return undefined", () => {
      expect(errors.codes.CODE_A.lookup(() => null)).toBeUndefined();
    });

    test("if the error isn't a graou error then lookup must return undefined", () => {
      expect(errors.codes.CODE_A.lookup(new Error("Test"))).toBeUndefined();
    });

    test("simple case", () => {
      expect(
        errors.scope.lookup(() => {
          throw errors.codes.CODE_A.factory("test");
        }),
      ).not.toBeUndefined();
      expect(
        errors.codes.CODE_A.lookup(() => {
          throw errors.codes.CODE_A.factory("test");
        }),
      ).not.toBeUndefined();
      expect(
        errors.codes.CODE_A.lookup(() => {
          throw errors.codes.CODE_A.subcodes.SUBCODE_A.factory("test");
        }),
      ).not.toBeUndefined();
      expect(
        errors.codes.CODE_B.lookup(() => {
          throw errors.codes.CODE_A.subcodes.SUBCODE_A.factory("test");
        }),
      ).toBeUndefined();
      expect(
        errors.codes.CODE_C.lookup(() => {
          throw errors.codes.CODE_A.subcodes.SUBCODE_A.factory("test");
        }),
      ).toBeUndefined();
    });

    test("with nested error", () => {
      const err3 = errors.codes.CODE_B.factory();
      const err2 = errors.codes.CODE_A.subcodes.SUBCODE_A.factory(null, { cause: err3 });
      const err1 = errors.codes.CODE_C.factory(null, { cause: err2 });

      expect(errors.scope.lookup(err1)).toEqual(err1);
      expect(errors.scope.lookup(err2)).toEqual(err2);
      expect(errors.scope.lookup(err3)).toEqual(err3);

      expect(errors.codes.CODE_B.lookup(err1)).toEqual(err3);
      expect(errors.codes.CODE_B.lookup(err2)).toEqual(err3);
      expect(errors.codes.CODE_B.lookup(err3)).toEqual(err3);

      expect(errors.codes.CODE_A.subcodes.SUBCODE_A.lookup(err1)).toEqual(err2);
      expect(errors.codes.CODE_A.subcodes.SUBCODE_A.lookup(err2)).toEqual(err2);
      expect(errors.codes.CODE_A.subcodes.SUBCODE_A.lookup(err3)).toBeUndefined();

      expect(errors.codes.CODE_A.lookup(err1)).toEqual(err2);
      expect(errors.codes.CODE_A.lookup(err2)).toEqual(err2);
      expect(errors.codes.CODE_A.lookup(err3)).toBeUndefined();

      expect(errors.codes.CODE_C.lookup(err1)).toEqual(err2);
      expect(errors.codes.CODE_C.lookup(err2)).toBeUndefined();
      expect(errors.codes.CODE_C.lookup(err3)).toBeUndefined();
    });

    test("lookup for a specific with uid flag", () => {
      const err2 = errors.codes.CODE_A.factory(null);
      Object.defineProperty(err2, graouErrorUidSymbol, {
        get: () => "ID2",
      });
      const err1 = errors.codes.CODE_A.factory(null, { cause: err2 });
      Object.defineProperty(err1, graouErrorUidSymbol, {
        get: () => "ID1",
      });

      expect(errors.codes.CODE_A.lookup(err1)).toEqual(err1);
      expect(errors.codes.CODE_A.lookup(err1, "ID1")).toEqual(err1);
      expect(errors.codes.CODE_A.lookup(err1, "ID2")).toEqual(err2);

      expect(errors.codes.CODE_A.lookup(err2)).toEqual(err2);
      expect(errors.codes.CODE_A.lookup(err2, "ID1")).toBeUndefined();
      expect(errors.codes.CODE_A.lookup(err2, "ID2")).toEqual(err2);
    });
  });
});
