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

> [!NOTE]
> ![changed 1.2.0](https://img.shields.io/badge/changed->=%201.2.0-green?logo=git&style=for-the-badge)  
> You can pass directly an errors that match your class because it can be much easier for the typing over the usage.
> You must aware that errors object must match your class declaration. Otherwise, Graou throw an error due to the mismatch between the two objects.

## Bind class errors

![added 1.2.0](https://img.shields.io/badge/added->=%201.2.0-green?logo=git&style=for-the-badge)

> [!NOTE]
> Check out the example: [TS](https://github.com/carthage-js/graou/blob/devel/examples/src/decoratedClassAndSubcodes.ts)

Graou offer also an alternate way to alterate your class.
The whole reason is due to typing.
Make the errors fully generated mean that you must rely upon `getClassErrors` and `getMethodError` function to access the basic concepts of Graou for those class.
There are not bad but they can create some dumb error because the things are solved during runtime.
To avoid that, you can define separetly the class and errors.
This way typescript will be able to ensure the typing.
Other tools will also be able to issue early error if something is undefined (like webpack).
Graou is gonna check the class and errors are matching when he decorate the class with them to avoid issues.

```typescript
import graou from "@carthage-js/graou";

const errorsFactory = graou.makeModuleErrorsFactory({
  moduleName: "<YOUR PROJECT NAME>",
});

const errors = errorsFactory("MyClass", ["myMethod", "myAsyncMethod"]);

class MyClass {
  myMethod() {
    // ... my code
  }

  async myAsyncMethod() {
    // ... my code
  }
}

const MyClassDecorated = graou.utils.bindClassWithErrors(errors, MyClass);

// Usage
const instance = new MyClassDecorated();
instance.myMethod();
```
