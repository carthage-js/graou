import graou from "@carthage-js/graou";

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "DecoratedClass",
});

@graou.decorators.AutoErrors(errorsFactory)
class Test {
  a() {
    this.b();
  }

  b() {
    throw new Error("Failed from B");
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
}

console.log("\n\n### Call method withAsync ###");
instance.withAsync().catch(console.error);
