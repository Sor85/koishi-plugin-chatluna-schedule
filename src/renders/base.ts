/**
 * Takumi 渲染基础工具
 * 负责复用渲染器、加载中文字体并准备 Emoji 图片资源
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { Renderer, extractResourceUrls } from '@takumi-rs/core'
import { extractEmojis } from '@takumi-rs/helpers/emoji'
import { fetchResources } from '@takumi-rs/helpers'
import { fromHtml } from '@takumi-rs/helpers/html'
import type { LogFn } from '../types'

export interface RenderOptions {
  width?: number
  deviceScaleFactor?: number
}

const fontDirectory = resolve(
  dirname(require.resolve('@fontsource-variable/noto-sans-sc/package.json')),
  'files',
)
const fonts = readdirSync(fontDirectory)
  .filter((name) => name.endsWith('.woff2'))
  .sort()
  .map((name, index) => ({
    name: `NotoSansSC_${index}`,
    data: readFileSync(resolve(fontDirectory, name)),
  }))
const fontFamily = fonts.map((font) => `'${font.name}'`).join(',')
const renderer = new Renderer({ fonts, loadDefaultFonts: true })

function parseHtml(html: string) {
  const stylesheets: string[] = []
  const content = html.replace(
    /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
    (_, stylesheet: string) => {
      stylesheets.push(stylesheet)
      return ''
    },
  )
  const parsed = fromHtml(content)
  return {
    node: parsed.node,
    stylesheets: [...parsed.stylesheets, ...stylesheets].map((stylesheet) =>
      stylesheet.replaceAll('"Noto Sans SC"', fontFamily),
    ),
  }
}

export async function renderHtml(
  html: string,
  options: RenderOptions,
  log?: LogFn,
): Promise<Buffer | null> {
  const { width = 600, deviceScaleFactor = 2 } = options

  try {
    const parsed = parseHtml(html)
    // Takumi 不直接绘制 Unicode Emoji，需要先转换为图片节点并显式下载资源。
    const node = extractEmojis(parsed.node, 'twemoji')
    const fetchedResources = await fetchResources(extractResourceUrls(node), {
      throwOnError: false,
    })

    return await renderer.render(node, {
      width: width * deviceScaleFactor,
      devicePixelRatio: deviceScaleFactor,
      format: 'png',
      stylesheets: parsed.stylesheets,
      fetchedResources,
    })
  } catch (error) {
    log?.('warn', '图片渲染失败', error)
    return null
  }
}

export function escapeHtmlForRender(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
