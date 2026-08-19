# Graou

## 🐺 What is Graou?

Graou is a lightweight TypeScript library that aims to provide a clean, structured, and reusable approach
to creating and managing application errors instead of handling exceptions in an inconsistent way throughout the codebase.

> [!NOTE]
> Check our examples to see our way to use it 😀
> [examples](https://github.com/carthage-js/graou/tree/main/examples)

## How to use ?

> [!IMPORTANT]
> Use constants on the makeModuleErrorsFactory and makeModuleErrorsFactory result
> because typings is magic. The whole thing is really to use.

```javascript
const graou = require("@carthage-js/graou");

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "<SHOULD REFERE TO YOUR name FIELD OF package.json>",
});


const errors = errorsFactory("<SCOPE NAME>", ["<CODE NAME>", "<OTHER CODE NAME>"]);

// Use errors like that:
throw errors.codes.<CODE NAME>.factory("<YOUR REASON>");
throw errors.codes.<CODE NAME>.factory("<YOUR REASON>", { cause: "<PASS THE PARENT EXCEPTION HERE>" })
```
