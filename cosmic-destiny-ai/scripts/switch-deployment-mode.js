#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DEPLOYMENT_MODE = process.env.DEPLOYMENT_MODE || 'static';

console.log(`🔄 切换部署模式: ${DEPLOYMENT_MODE.toUpperCase()}`);

const reportDir = path.join(__dirname, '../src/app/report');
const dynamicRouteDir = path.join(reportDir, '[id]');
const backupDir = path.join(__dirname, '../backup/original-pages/[id]');

if (DEPLOYMENT_MODE === 'static') {
  // 静态模式：备份并移除动态路由
  if (fs.existsSync(dynamicRouteDir)) {
    console.log('📁 备份动态路由目录...');
    // 确保备份目录存在
    const backupParentDir = path.dirname(backupDir);
    if (!fs.existsSync(backupParentDir)) {
      fs.mkdirSync(backupParentDir, { recursive: true });
    }
    // 如果备份目录已存在，先删除
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    // 移动动态路由到备份目录
    fs.renameSync(dynamicRouteDir, backupDir);
    console.log('📁 移除动态路由目录...');
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
