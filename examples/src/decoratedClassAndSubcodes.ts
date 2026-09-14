import graou from "@carthage-js/graou";

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "DecoratedClass",
});

const TestErrors = errorsFactory("Test", ["constructor", "a", "b", "withAsync", "withAsyncB"], {
  constructor: [],
  b: ["Error"],
});

@graou.decorators.AutoErrors(TestErrors)
class Test {
  a() {
    this.b();
  }

  b() {
    throw TestErrors.codes.b.subcodes.Error.factory("Failed from B");
  }

  async withAsync() {
    await this.withAsyncB();
  }

  async withAsyncB() {
    await Promise.resolve();
    throw new Error("Failed from async");
  }
}

const instance = new Test();
console.log("### Call method A & B ###");
try {
  instance.a();
} catch (err) {
  console.error(err);

  // Use lookup if you need to check is something has been run:
  if (TestErrors.codes.b.lookup(err)) {
    console.log("I got a b code error inside that error.");
  }
}

console.log("\n\n### Call method withAsync ###");
instance.withAsync().catch(console.error);
