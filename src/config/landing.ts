/**
 * 着陆页配置
 * 可以在这里修改首页展示的文字内容
 */

export interface LandingConfig {
  /** 品牌名称 */
  brandName: string
  /** 副标题 */
  subtitle: string
  /** 提示文字 */
  hint: string
  /** 环绕文字内容（支持多行，用 | 分隔） */
  flowingText: string[]
  /** 进入按钮文字 */
  buttonText: string
}

/** 默认配置 */
export const landingConfig: LandingConfig = {
  brandName: 'OFB',
  subtitle: 'OpenFindBearings',
  hint: '文字环绕',
  flowingText: [
    '|The web renders text through a pipeline that was designed thirty years ago for static documents. A browser loads a font, shapes the text into glyphs, measures their combined width, determines where lines break, and positions each line vertically.',
    'For a paragraph in a blog post, this pipeline is invisible. The browser loads, lays out, and paints before the readers eye has traveled from the address bar to the first word. But the web is no longer a collection of static documents.',
    'CSS Shapes specification, finalized in 2014, was supposed to bring magazine-style text wrap to the web. It allows text to flow around a defined shape — a circle, an ellipse, a polygon, even an image alpha channel.',
    'The editorial layouts we see in print magazines — text flowing around photographs, pull quotes interrupting the column, multiple columns with seamless text handoff — have remained out of reach for the web.',
    'What if text measurement did not require the DOM at all? What if you could compute exactly where every line of text would break, exactly how wide each line would be, and exactly how tall the entire text block would be.',
    '|This is the core insight of pretext. The browser canvas API includes a measureText method that returns the width of any string in any font without triggering a layout reflow.',
    'With DOM-free text measurement, an entire class of previously impractical interfaces becomes trivial. Text can flow around arbitrary shapes, not because the browsers layout engine supports it, but because you control the line widths directly.',
    'For each line of text, you compute which horizontal intervals are blocked by obstacles, subtract them from the available width, and pass the remaining width to the layout engine. The engine returns the text that fits, and you position the line at the correct offset.',
    'This approach opens new possibilities for digital typography. Text can dance around interactive elements, weave through data visualizations, and respond to user input in real-time. The boundary between content and container begins to dissolve.',
    'Yet the technology alone is insufficient. What makes text truly readable is not just the measurements, but the judgment — the subtle art of determining line breaks that honor both content and context, that serve the readers eye rather than the algorithms convenience.',
  ],
  buttonText: '进入平台',
}

/** 从环境变量覆盖配置（可选） */
export function getLandingConfig(): LandingConfig {
  // 如果需要从环境变量读取，可以这样：
  // return {
  //   ...landingConfig,
  //   brandName: import.meta.env.VITE_BRAND_NAME || landingConfig.brandName,
  // }

  // 未来可以从 API 获取：
  // const response = await fetch('/api/landing-config')
  // return await response.json()

  return landingConfig
}
