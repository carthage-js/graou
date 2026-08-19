import { makeErrors } from "./errors.factory";

describe("makeErrors", () => {
  test("Check if the properties match the final object", () => {
    const messageFactory = jest.fn();
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
    expect(errorsAsAny.codes.CODE_B.factory).not.toBeDefined();

    expect(errors.codes.CODE_C.name).toEqual("CODE_C");
    expect(errorsAsAny.codes.CODE_C.factory).toBeDefined();
    expect(errorsAsAny.codes.CODE_C.subcodes).not.toBeDefined();

    expect(errors.codes.CODE_A.factory("test")).toBeInstanceOf(errors.scope.$class);
    expect(errors.codes.CODE_A.factory("test")).toBeInstanceOf(errors.codes.CODE_A.$class);
    expect(errors.codes.CODE_A.factory("test")).not.toBeInstanceOf(errors.codes.CODE_B.$class);
    expect(errors.codes.CODE_A.factory("test")).not.toBeInstanceOf(
      errors.codes.CODE_B.subcodes.SUBCODE_A.$class,
    );
    expect(errors.codes.CODE_A.factory("test")).not.toBeInstanceOf(errors.codes.CODE_C.$class);

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
});
