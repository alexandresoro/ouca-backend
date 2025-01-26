import { type Mock, mock as mockNode } from "bun:test";

type MockProxy<T> = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] & Mock<T[K]> : T[K];
};

export const mock = <T>(params?: Partial<T>): MockProxy<T> & T => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const mocks: Record<string | symbol, Mock<(...args: any[]) => any>> = {};

  return new Proxy(params ?? {}, {
    ownKeys(target: MockProxy<T>) {
      return Reflect.ownKeys(target);
    },
    get: (target, property) => {
      if (property in target) {
        return target[property as keyof typeof target];
      }
      if (mocks[property] == null) {
        mocks[property] = mockNode();
      }

      return mocks[property];
    },
  }) as MockProxy<T> & T;
};
