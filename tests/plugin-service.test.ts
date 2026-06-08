import { Context } from "koishi";
import { describe, expect, it } from "vitest";
import { bindScheduleContextService } from "../src/service-binding";
import type { ScheduleService } from "../src/types";

function createScheduleServiceStub(): ScheduleService {
  return {
    enabled: true,
    registerVariables: () => [],
    registerTool: () => null,
    registerCommand: () => {},
    start: () => {},
    dispose: () => {},
    regenerateSchedule: async () => null,
    getSchedule: async () => null,
    getScheduleText: async () => "",
    getCurrentSummary: async () => "",
    getCurrentActivity: async () => "",
  };
}

describe("schedule plugin service binding", () => {
  it("marks chatluna_schedule as a loaded Koishi service", () => {
    const ctx = new Context();
    const service = createScheduleServiceStub();

    const dispose = bindScheduleContextService(ctx, service);
    const loaded = ctx.get("chatluna_schedule");

    expect(loaded).toBe(service);
    expect(
      Reflect.getOwnPropertyDescriptor(loaded, Context.current)?.value,
    ).toBe(ctx);

    dispose();
    expect(ctx.get("chatluna_schedule")).toBeUndefined();
  });
});
