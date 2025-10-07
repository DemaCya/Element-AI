#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEPLOYMENT_MODE = process.env.DEPLOYMENT_MODE || 'static';

console.log(`🔄 切换部署模式: ${DEPLOYMENT_MODE.toUpperCase()}`);

const reportDir = path.join(__dirname, '../src/app/report');
const dynamicRouteDir = path.join(reportDir, '[id]');
const backupDir = path.join(__dirname, '../backup/original-pages/[id]');

if (DEPLOYMENT_MODE === 'static') {
  // 静态模式：移除动态路由
  if (fs.existsSync(dynamicRouteDir)) {
    console.log('📁 移除动态路由目录...');
    fs.rmSync(dynamicRouteDir, { recursive: true, force: true });
  }
  console.log('✅ 静态模式：动态路由已移除');
} else {
  // 动态模式：恢复动态路由
  if (fs.existsSync(backupDir) && !fs.existsSync(dynamicRouteDir)) {
    console.log('📁 恢复动态路由目录...');
    fs.renameSync(backupDir, dynamicRouteDir);
  }
  console.log('✅ 动态模式：动态路由已恢复');
}

console.log(`🎯 部署模式切换完成: ${DEPLOYMENT_MODE.toUpperCase()}`);
