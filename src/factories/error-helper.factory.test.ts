import { describe, test, expect, jest } from "@jest/globals";

import { makeErrorHelper } from "./error-helper.factory";
import { GraouError, GraouErrorFactory, GraouErrorLookup } from "../types";

function makeErrorFactory($class: any): GraouErrorFactory {
  return jest.fn(
    (reason?: string | null, options?: ErrorOptions) =>
      new $class("jest", "tu", "makeErrorHelper", null, reason, "", options),
  );
}

class TuError extends GraouError {}
const tuErrorFactoryMock = makeErrorFactory(TuError);
const tuErrorLookupMock: GraouErrorLookup = jest.fn((error: any, uid?: string) => {
  if (error instanceof GraouError) {
    return error.lookup({
      nodeModule: "jest",
      scope: "tu",
      code: "makeErrorHelper",
      uid,
    });
  } else {
    return undefined;
  }
});

describe("makeErrorHelper", () => {
  test("lookup", () => {
    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);
    const childHelper = helper.with({
      uid: "uid",
    });
    const result = helper.decorate(new Error("TEST"));
    const result2 = childHelper.decorate(new Error("TEST"));
    expect(helper.lookup(result)).toEqual(result);
    expect(childHelper.lookup(result)).toBeUndefined();
    expect(helper.lookup(result2)).toEqual(result2);
    expect(childHelper.lookup(result2)).toEqual(result2);
  });

  test("lookup (uid)", () => {
    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);
    const result = helper.decorate(new Error("TEST"));
    expect(helper.with({}).lookup(result)).toEqual(result);
  });

  test("decorate", () => {
    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);
    const result = helper.decorate(new Error("TEST"));
    expect(tuErrorFactoryMock).toHaveBeenCalled();
    expect(result).toBeInstanceOf(TuError);
    expect(Boolean(result.reason)).toBeFalsy();
    expect((result.cause as any).message).toEqual("TEST");
  });

  test("$throw", () => {
    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);
    expect(() => helper.$throw(new Error("TEST"))).toThrow(TuError);
  });

  test("with", () => {
    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);
    const childHelper = helper.with({
      reason: "My reason",
    });
    const result = childHelper.decorate(new Error("TEST"));
    expect(tuErrorFactoryMock).toHaveBeenCalled();
    expect(result).toBeInstanceOf(TuError);
    expect(result.reason).toEqual("My reason");
    expect((result.cause as any).message).toEqual("TEST");

    const redecoratedResult = childHelper.decorate(result);
    expect(redecoratedResult === result).toBeFalsy();
    expect(redecoratedResult.cause === result).toBeTruthy();
  });

  test("with (uid)", () => {
    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);
    const childHelper = helper.with({
      reason: "My reason",
      uid: "test",
    });
    const result = childHelper.decorate(new Error("TEST"));
    expect(tuErrorFactoryMock).toHaveBeenCalled();
    expect(result).toBeInstanceOf(TuError);
    expect(result.reason).toEqual("My reason");
    expect((result.cause as any).message).toEqual("TEST");

    const redecoratedResult = childHelper.decorate(result);
    expect(redecoratedResult === result).toBeTruthy();
  });

  test("with (uid & subcode)", () => {
    class Subcode extends TuError {}
    const subcodeFactory = makeErrorFactory(Subcode);

    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);
    const childHelper = helper.with({
      reason: "My reason",
      uid: "test",
    });
    const result = childHelper.decorate(subcodeFactory());
    expect(tuErrorFactoryMock).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Subcode);

    const redecoratedResult = childHelper.decorate(result);
    expect(redecoratedResult === result).toBeTruthy();
  });

  describe("trap", () => {
    class TrapError extends GraouError {}
    const trapErrorFactoryMock = makeErrorFactory(TrapError);
    const helper = makeErrorHelper(TuError, tuErrorFactoryMock, tuErrorLookupMock);

    describe("sync", () => {
      test("Nothing went wrong", () => {
        expect(() => helper.trap(() => undefined)).not.toThrow();
      });

      test("Throw an error", () => {
        expect(() =>
          helper.trap(() => {
            throw trapErrorFactoryMock("TRAP");
          }),
        ).toThrow(TuError);

        try {
          helper.trap(() => {
            throw trapErrorFactoryMock("TRAP");
          });
        } catch (err: any) {
          expect(err).toBeInstanceOf(TuError);
          expect(err.cause).toBeInstanceOf(TrapError);
        }
      });
    });

    describe("async", () => {
      test("Nothing went wrong", async () => {
        await expect(() => helper.trap(async () => 10)).resolves.toEqual(10);
      });

      test("Throw an error during sync phase", async () => {
        await expect(
          async () =>
            await helper.trap(async () => {
              throw trapErrorFactoryMock("TRAP");
            }),
        ).rejects.toBeInstanceOf(TuError);

        try {
          await helper.trap(async () => {
            throw trapErrorFactoryMock("TRAP");
          });
        } catch (err: any) {
          expect(err).toBeInstanceOf(TuError);
          expect(err.cause).toBeInstanceOf(TrapError);
        }
      });
    });
  });
});
