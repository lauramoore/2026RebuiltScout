import { describe, it, expect } from "vitest";

describe("Vitest Test Harness Validation", () => {
  it("should confirm that basic assertions work", () => {
    expect(true).toBe(true);
    expect(1 + 1).toEqual(2);
  });

  it("should handle asynchronous tests correctly", async () => {
    const data = await Promise.resolve("test-data");
    expect(data).toBe("test-data");
  });

  it("should demonstrate the difference between toBe and toEqual for objects", () => {
    const objA = { id: 1 };
    const objB = { id: 1 };
    expect(objA).not.toBe(objB); // Fails because they are different object references.
    expect(objA).toEqual(objB); // Passes because their values are equivalent.
  });
});
