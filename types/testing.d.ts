// Ambient test runner type declarations
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function test(name: string, fn: () => void | Promise<void>): void;
declare function beforeEach(fn: () => void | Promise<void>): void;
declare function afterEach(fn: () => void | Promise<void>): void;
declare function beforeAll(fn: () => void | Promise<void>): void;
declare function afterAll(fn: () => void | Promise<void>): void;

declare function expect(actual: any): {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toBeDefined(): void;
  toBeNull(): void;
  toBeUndefined(): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeGreaterThan(expected: number): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toContain(expected: any): void;
  toMatch(expected: RegExp | string): void;
  toThrow(expected?: any): void;
  resolves: {
    toEqual(expected: any): Promise<void>;
    toBe(expected: any): Promise<void>;
  };
  not: {
    toBe(expected: any): void;
    toEqual(expected: any): void;
    toBeNull(): void;
    toContain(expected: any): void;
  };
};
