# Auto errors

![added 1.1.0](https://img.shields.io/badge/added->=%201.1.0-green?logo=git&style=for-the-badge)

## Auto class errors

> [!NOTE]
> Check out the example: [TS](https://github.com/carthage-js/graou/blob/devel/examples/src/decoratedClass.ts)

Graou can edit your class to automaticly implements the whole concepts without the need to do much things.

> [!IMPORTANT]
> Only the owned methods of the class are decorated.
> Inherit methods are not altered.

```typescript
import graou from "@carthage-js/graou";

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "<YOUR PROJECT NAME>",
});

class MyClass {
  myMethod() {
    // ... my code
  }

  async myAsyncMethod() {
    // ... my code
  }
}

const MyClassDecorated = graou.utils.decorateClassWithErrors(errorsFactory, MyClass);

// Usage
const instance = new MyClassDecorated();
instance.myMethod();
```

In this example, the resulting class is attach to Errors
where the scope is `MyClass` with 3 codes: `constructor`, `myMethod`, `myAsyncMethod`.
Each code matching a method of the class.
You got a `constructor` code no matter what because they are implicitly declarated by the js class.
Both methods and constructor on the decorated use the trap mecanism to handle errors.
The decorated class define a symbol for each method to handle recursive method.

Graou offer methods to easily access errors that got attached to the class and methods:

```typescript
const errors = graou.utils.getClassErrors(MyClassDecorated);
const error = graou.utils.getMethodError(MyClassDecorated.prototype.myMethod);
```

If you allow yourself to use `experimentalDecorators` on your typescript project then it's even easier:

```typescript
import graou from "@carthage-js/graou";

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "<YOUR PROJECT NAME>",
});

@graou.decorators.AutoErrors(errorsFactory)
class MyClass {
  myMethod() {
    // ... my code
  }

  async myAsyncMethod() {
    // ... my code
  }
}

// Usage
const instance = new MyClass();
instance.myMethod();
```
