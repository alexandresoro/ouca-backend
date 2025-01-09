import { type Mock, mock as mockNode } from "node:test";

type MockProxy<T> = {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  [K in keyof T]: T[K] extends Function ? T[K] & Mock<T[K]> : T[K];
};

export const mock = <T>(params?: Partial<T>): MockProxy<T> & T => {
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  const mocks: Record<string | symbol, Mock<Function>> = {};

  return new Proxy(params ?? {}, {
    ownKeys(target: MockProxy<T>) {
      return Reflect.ownKeys(target);
    },
    get: (target, property) => {
      if (property in target) {
        return target[property as keyof typeof target];
      }
      if (mocks[property] == null) {
        mocks[property] = mockNode.fn();
      }

      return mocks[property];
    },
  }) as MockProxy<T> & T;
};
