"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graou_1 = __importDefault(require("@carthage-js/graou"));
// Create a single errorsFactory by node package
const errorsFactory = graou_1.default.makeModuleErrorsFactory({
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
