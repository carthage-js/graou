// This file is dedicated to this function because the graou error depend on it?
// This can't import another file from this project.

export function deepFreeze<Type>(data: Type): Type {
  if (Array.isArray(data)) {
    return Object.freeze(data.map((v) => deepFreeze(v))) as Type;
  } else if (typeof data === "object" && data !== null) {
    return Object.freeze(
      Object.fromEntries(Object.entries(data).map(([k, v]) => [k, deepFreeze(v)])),
    ) as Type;
  } else {
    return data;
  }
}
