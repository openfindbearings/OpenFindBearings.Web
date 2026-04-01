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
    '|2026年1月，NTN Corporation宣布在轴承行业首次引入基于AI的机器学习技术，应用于第三代轮毂轴承的自动化计算系统"ABICS"[^6^]。通过结合Lasso回归和贝叶斯优化算法，NTN将有限元分析（FEM）的计算时间缩短至传统方法的十分之一以下，同时实现满足要求的尺寸自动设计。该技术使设计工时相比传统方法减少约80%，预计2029财年实现全部功能后，设计工时将减少90',
    '|在2025年轴承与动力传动世界会议上，K2TECH公司展示了AI驱动的光学检测技术如何变革轴承及零部件制造[^7^]。通过将AI"智能"作为大脑、机器视觉作为眼睛、机器人自动化作为手，制造商可以创建完全集成的检测生态系统，实现0.1毫米以内的精度、低于1%的过杀率，以及超过8%的整体设备效率（OEE）提升。每条生产线可节省相当于四名全职操作员的人力成本。深度学习算法可以区分真实缺陷和无害变异，将误检率降',
    '|智能轴承正在成为AI驱动工厂的关键数据提供者[^8^]。现代轴承 increasingly 被设计为带有集成传感器，可以实时测量振动、温度、负载和润滑状态，将轴承转变为活跃的数据源。这些智能轴承成为预测性维护策略的核心，使制造商能够监测轴承健康状况以检测早期预警信号。',
    '|德国百年轴承企业舍弗勒与乐聚机器人达成战略合作，成为其首个中国具身智能合作伙伴[^10^]。双方将围绕工业场景应用、数据训练场、新技术研发三大方向，共同推动人形机器人的规模化落地，标志着"全球顶尖供应链+中国人形本体能力"的',
    '当前，我国轴承产业发展迅猛，2024年全国轴承行业营业收入同比增长6.20%，轴承产量同比增长17.3%，产业规模连续多年稳居世界第三[^11^]。科技创新已成为驱动我国轴承产业变革的核心力量，数智技术在研发设计、生产制造、质量检测、预测维护等全链条的深度融合应用，正推动产业向高端化、智能化方向升级。随着"人工智能+"行动的深入实施和人形机器人等新兴产业的快速发展，轴承行业智能化转型将迎来更广阔的',
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
