import { describe, expect, it } from 'vitest'
import { createScheduleRenderer } from '../../src/renders/schedule'

describe('createScheduleRenderer', () => {
  it('使用 Takumi 渲染中文日程 PNG', async () => {
    const render = createScheduleRenderer()
    const image = await render({
      title: '今日日程',
      date: '2026-07-14',
      description: '按计划完成工作',
      entries: [
        {
          start: '09:00',
          end: '10:00',
          startMinutes: 540,
          endMinutes: 600,
          summary: '处理 <重要> 事项',
        },
      ],
    })

    expect(image).not.toBeNull()
    expect(image?.subarray(0, 8)).toEqual(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
    expect(image?.readUInt32BE(16)).toBe(1200)
  })
})
