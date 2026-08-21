# Graou

[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=carthage-js_graou)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=carthage-js_graou&metric=coverage)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=carthage-js_graou&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)

[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=carthage-js_graou&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=carthage-js_graou&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=carthage-js_graou&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=carthage-js_graou&metric=bugs)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=carthage-js_graou&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-highlight.svg)](https://sonarcloud.io/summary/new_code?id=carthage-js_graou)


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
