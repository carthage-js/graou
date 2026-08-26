export class GraouError extends Error {
  // Add typing because intellisense of vscode didn't detect property define with Object.defineProperties
  readonly nodeModule!: string;
  readonly scope!: string;
  readonly code!: string;
  readonly subcode!: string | null;
  readonly reason!: string;

  constructor(
    nodeModule: string,
    scope: string,
    code: string,
    subcode: string | null,
    reason: string,
    fullMessage: string,
    options?: ErrorOptions,
  ) {
    super(fullMessage, options);
    // Discard dev to modify this properties because they are readonly
    Object.defineProperties(this, {
      nodeModule: {
        get: () => nodeModule,
      },
      scope: {
        get: () => scope,
      },
      code: {
        get: () => code,
      },
      subcode: {
        get: () => subcode,
      },
      reason: {
        get: () => reason,
      },
    });
  }

  toJSON(depth?: number): any {
    if (typeof depth !== "number" || Number.isNaN(depth)) {
      depth = Number.MAX_VALUE;
    }

    if (depth < 0) {
      depth = 0;
    }

    const result: any = {};
    const visited: GraouError[] = [];
    let stack: [GraouError, any][] = [[this, result]];

    while (depth >= 0 && stack.length > 0) {
      const [current, target] = stack.pop()!;
      depth--;

      if (visited.includes(current)) {
        Object.assign(target, {
          recursive: true,
          referTo: visited.indexOf(current),
        });
        continue;
      }

      visited.push(current);
      Object.assign(target, {
        nodeModule: current.nodeModule,
        scope: current.scope,
        code: current.code,
        reason: current.reason,
      });

      if (current.subcode) {
        target.subcode = current.subcode;
      }

      if (depth >= 0) {
        if (current.cause instanceof GraouError) {
          target.cause = {};
          stack.push([current.cause, target.cause]);
        } else if (current.cause instanceof Error) {
          target.cause = current.cause.message;
        }
      }
    }

    return result;
  }
}
