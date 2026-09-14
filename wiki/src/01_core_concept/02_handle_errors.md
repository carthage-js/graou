# Handle errors

![added 1.1.0](https://img.shields.io/badge/added->=%201.1.0-green?logo=git&style=for-the-badge)

An error created using a factory comes with a set of helper methods to handle different cases throughout the codebase.
These methods are not available on a code error when the code has subcodes. However, they are available on errors created from those subcodes.

> [!NOTE]
> Check out those examples:
>
> - [async](https://github.com/carthage-js/graou/blob/devel/examples/src/async.ts)
> - [loader](https://github.com/carthage-js/graou/blob/devel/examples/src/loader.ts)
> - [decoratedClassAndSubcodes](https://github.com/carthage-js/graou/blob/devel/examples/src/decoratedClassAndSubcodes.ts)

## with

This method creates a copy of the code helper with options that affect the behavior of its methods.

### reason

You can define a default reason if the factory is called with a null reason.

```typescript
const errors = errorsFactory("MyScope", ["Code"]);

throw errors.codes.Code.with({ reason: "My reason" }).factory(); // Error will use 'My reason' as error reason.
throw errors.codes.Code.with({ reason: "My reason" }).factory("A reason"); // Error will use 'A reason' as error reason.
```

### uid

> [!NOTE]
> ![changed 1.2.0](https://img.shields.io/badge/changed->=%201.2.0-green?logo=git&style=for-the-badge)  
> Field has been rename from symbol to uid. It's also no longer a symbol to make it work with lookup feature.

You can define a uid to flag an error and avoid decorate something that you think the base error is suffcient.

```typescript
const errors = errorsFactory("MyScope", ["CodeA", "CodeB"]);

const uid = "my use case";

throw errors.codes.CodeA.with({ uid }).factory(null, {
  cause: errors.codes.CodeB.with({ uid }).factory(),
}); // Will result into only a CodeB error
```

We got two major use case that can beneficiate of this feature:

- Promise: without the symbol all the catch will decorate the previous throwing catch.

```typescript
const errors = errorsFactory("MyScope", ["CodeA", "CodeB", "CodeC"]);

const uid = "my use case";

const promise = (async () => {
  // ... Critical code
})();

promise
  .catch(errors.codes.CodeA.with({ uid }).$throw)
  .then(() => {
    // ... Critical code
  })
  .catch(errors.codes.CodeB.with({ uid }).$throw)
  .then(() => {
    // ... Critical code
  })
  .catch(errors.codes.CodeC.with({ uid }).$throw);
// Throwing will result into either CodeA, CodeB, CodeC where cause is not a CodeA, CodeB, CodeC error
```

- Recusive function: without the symbol each call will decorate the error

```typescript
const errors = errorsFactory("MyScope", ["Code"]);

const uid = "my use case";

function recurse(steps: number) {
  errors.codes.Code.with({ uid }).trap(() => {
    if (steps >= 0) {
      recurse(steps - 1);
    } else {
      throw new Error("Oupsie");
    }
  });
}
// Throwing will result into a single Code error rather than a Code with [steps - 1] Code cause.
```

### Special case with subcodes

![added 1.2.0](https://img.shields.io/badge/added->=%201.2.0-green?logo=git&style=for-the-badge)

The whole design about using subcode is about to make thing clear about a peculiar case.
This way, you decorate only errors that you didn't expect or didn't want to manage their.
This whole idea is to hydrate information on an error than remove it.
So in this case, the subcode is not decorated with the code error.

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

## lookup

![added 1.2.0](https://img.shields.io/badge/added->=%201.2.0-green?logo=git&style=for-the-badge)

This function is able to quickly query nested error no matter how big is your error.

```typescript
const errors = errorsFactory("MyScope", ["Code", "Code2"]);
const errExample = errors.codes.Code.factory(null, {
  cause: errors.codes.Code2.factory(),
});

// usage
const result = errors.codes.Code2.lookup(errExample);
const result = errors.codes.Code2.lookup(() => {
  // Same result than before but it's pretty neat on test unit.
  throw errExample;
});
```

You can use the uid property to lookup a specific instance when you got twice the same error type.

```typescript
const errors = errorsFactory("MyScope", ["Code"]);
const errExample = errors.codes.Code.with({ uid: "Code1" }).factory(null, {
  cause: errors.codes.Code.with({ uid: "Code2" }).factory(),
});

// usage
const result = errors.codes.Code.lookup(errExample); // root error
const result = errors.codes.Code.lookup(errExample, "Code1"); // root error
const result = errors.codes.Code2.lookup(errExample, "Code2"); // nested error
const result = errors.codes.Code2.lookup(errExample, "Code3"); // undefined because no error exist with this id
```
