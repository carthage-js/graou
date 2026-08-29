# Handle errors

![added 1.1.0](https://img.shields.io/badge/added->=%201.1.0-green?logo=git&style=for-the-badge)

An error created using a factory comes with a set of helper methods to handle different cases throughout the codebase.
These methods are not available on a code error when the code has subcodes. However, they are available on errors created from those subcodes.

> [!NOTE]
> Check out those examples:
>
> - [async](https://github.com/carthage-js/graou/blob/devel/examples/src/async.ts)
> - [loader](https://github.com/carthage-js/graou/blob/devel/examples/src/loader.ts)

## with

This method creates a copy of the code helper with options that affect the behavior of its methods.

### reason

You can define a default reason if the factory is called with a null reason.

```typescript
const errors = errorsFactory("MyScope", ["Code"]);

throw errors.codes.Code.with({ reason: "My reason" }).factory(); // Error will use 'My reason' as error reason.
throw errors.codes.Code.with({ reason: "My reason" }).factory("A reason"); // Error will use 'A reason' as error reason.
```

### symbol

You can define a symbol to flag an error and avoid decorate something that you think the base error is suffcient.

```typescript
const errors = errorsFactory("MyScope", ["CodeA", "CodeB"]);

const symbol = Symbol.for("my use case");

throw errors.codes.CodeA.with({ symbol }).factory(null, {
  cause: errors.codes.CodeB.with({ symbol }).factory(),
}); // Will result into only a CodeB error
```

We got two major use case that can beneficiate of this feature:

- Promise: without the symbol all the catch will decorate the previous throwing catch.

```typescript
const errors = errorsFactory("MyScope", ["CodeA", "CodeB", "CodeC"]);

const symbol = Symbol.for("my use case");

const promise = (async () => {
  // ... Critical code
})();

promise
  .catch(errors.codes.CodeA.with({ symbol }).$throw)
  .then(() => {
    // ... Critical code
  })
  .catch(errors.codes.CodeB.with({ symbol }).$throw)
  .then(() => {
    // ... Critical code
  })
  .catch(errors.codes.CodeC.with({ symbol }).$throw);
// Throwing will result into either CodeA, CodeB, CodeC where cause is not a CodeA, CodeB, CodeC error
```

- Recusive function: without the symbol each call will decorate the error

```typescript
const errors = errorsFactory("MyScope", ["Code"]);

const symbol = Symbol.for("my use case");

function recurse(steps: number) {
  errors.codes.Code.with({ symbol }).trap(() => {
    if (steps >= 0) {
      recurse(steps - 1);
    } else {
      throw new Error("Oupsie");
    }
  });
}
// Throwing will result into a single Code error rather than a Code with [steps - 1] Code cause.
```

## decorate / $throw

A method that decorate an error with the code error.
`$throw` automaticly rethrow the error.
Here some exemples of how to use them:

```typescript
const errors = errorsFactory("MyScope", ["Code"]);

try {
  // ... Something critical
} catch (err) {
  throw errors.codes.Code.decorate(err);
}

// $throw is usefull to work with promise
// $throw has template parameter to avoid lost typing of the promise.
Promise.resolve(10).catch(errors.codes.Code.$throw<number>);
```

## trap

This function captures errors thrown by both synchronous and asynchronous functions.
It uses both of the previously mentioned methods to decorate the error.

```typescript
const errors = errorsFactory("MyScope", ["Code"]);

const result = errors.codes.Code.trap(() => {
  // ... Critical things
  return "my result";
});
```
