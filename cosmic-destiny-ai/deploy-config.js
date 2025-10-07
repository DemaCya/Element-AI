// 部署配置 - 用于切换静态和动态模式
const DEPLOYMENT_MODE = process.env.DEPLOYMENT_MODE || 'static'; // 'static' 或 'dynamic'

const config = {
  static: {
    // 静态部署配置
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    images: { unoptimized: true },
    eslint: { ignoreDuringBuilds: true },
    // 禁用API路由
    apiRoutes: false,
    // 使用静态报告页面
    useStaticReport: true
  },
  dynamic: {
    // 动态部署配置
    output: undefined, // 使用默认配置
    trailingSlash: false,
    skipTrailingSlashRedirect: false,
    images: { unoptimized: false },
    eslint: { ignoreDuringBuilds: false },
    // 启用API路由
    apiRoutes: true,
    // 使用动态报告页面
    useStaticReport: false
  }
};

module.exports = {
  DEPLOYMENT_MODE,
  currentConfig: config[DEPLOYMENT_MODE],
  isStatic: DEPLOYMENT_MODE === 'static',
  isDynamic: DEPLOYMENT_MODE === 'dynamic'
};
