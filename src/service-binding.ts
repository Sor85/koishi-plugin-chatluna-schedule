import { Context } from "koishi";
import type { ScheduleService } from "./types";

export function bindScheduleContextService(
  ctx: Context,
  scheduleService: ScheduleService,
) {
  // Koishi 控制台的服务表通过实例上的 ctx 描述符判断服务归属；普通对象服务没有这个标记会被误判为未加载。
  Object.defineProperty(scheduleService, Context.current, {
    value: ctx,
    configurable: true,
  });

  return ctx.set("chatluna_schedule", scheduleService);
}
