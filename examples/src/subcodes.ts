import graou, { GraouError, GraouErrorFactory } from "@carthage-js/graou";

// The mojo on this exemple is to use less possible the try catch keywords.
// The dev should use subscope to improve errors on the whole thing.
// With subscope, you find the calling more easily.
const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "subcodes",
});

const errors = errorsFactory("HANDLER", ["METHOD_A", "METHOD_B"], {
  METHOD_B: ["CALL_1", "CALL_2", "CALL_3"],
});

class Handler {
  private method_a(errorFactory: GraouErrorFactory, _throw: boolean) {
    if (!_throw) {
      return;
    }

    throw errorFactory("ERROR", {
      cause: errors.codes.METHOD_A.factory("ROOT ERROR"),
    });
  }

  method_b(throw_on_call: number) {
    this.method_a(errors.codes.METHOD_B.subcodes.CALL_1.factory, throw_on_call === 1);
    this.method_a(errors.codes.METHOD_B.subcodes.CALL_2.factory, throw_on_call === 2);
    this.method_a(errors.codes.METHOD_B.subcodes.CALL_3.factory, throw_on_call === 3);
  }
}

const handler = new Handler();
for (let i = 1; i < 4; i++) {
  console.log(`### Throw on call ${i} ###`);
  try {
    handler.method_b(i);
  } catch (err) {
    console.log(err);
  }
}
