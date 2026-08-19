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
    if (typeof depth !== "number" || isNaN(depth)) {
      depth = Number.MAX_VALUE;
    }

    if (depth < 0) {
      depth = 0;
    }

    const visited: GraouError[] = [];
    let current: GraouError = this;

    const result: any = {};
    let target = result;

    while (depth >= 0) {
      depth--;

      if (visited.includes(current)) {
        Object.assign(target, {
          recursive: true,
          referTo: visited.indexOf(current),
        });
        break;
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
          target = target.cause = {};
          current = current.cause;
          continue;
        } else if (current.cause instanceof Error) {
          target.cause = current.cause.message;
        }
      }

      break;
    }

    return result;
  }
}
