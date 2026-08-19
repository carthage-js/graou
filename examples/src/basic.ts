import graou from "@carthage-js/graou";

// Create a single errorsFactory by node package
const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "basic",
});

// Errors will always be a root variable and not a dynamic use.
// Define a scope with a bunch of codes you will use.
// There should be a scope for each handlers and services you have created.
const errors = errorsFactory("BASIC_SCOPE", ["ERROR_A", "ERROR_B"]);

// In this demo we will show you the output made by the lib.
const err = errors.codes.ERROR_A.factory("First layer error", {
  cause: errors.codes.ERROR_B.factory("Second layer error"),
});

console.log("### JSON OUTPUT ###");
console.log(err.toJSON());

console.log("### UNHANDLED OUTPUT ###");
throw err;
