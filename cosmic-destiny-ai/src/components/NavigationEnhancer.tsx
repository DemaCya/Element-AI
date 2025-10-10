'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

interface NavigationEnhancerProps {
  children: React.ReactNode
}

/**
 * 导航增强组件
 * 在静态导出模式下模拟SPA导航体验，减少状态丢失
 */
export default function NavigationEnhancer({ children }: NavigationEnhancerProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationMessage, setNavigationMessage] = useState('')

  useEffect(() => {
    // 保存当前状态到sessionStorage，在页面导航后恢复
    const saveStateBeforeNavigation = () => {
      try {
        const state = {
          timestamp: Date.now(),
          url: window.location.href,
          hasUserData: !!(window as any).__cosmicUserState?.cachedUser,
          hasSupabaseClient: !!(window as any).__cosmicSupabaseState?.supabase,
          logsCount: logger.getLogs().length
        }

        sessionStorage.setItem('cosmicNavigationState', JSON.stringify(state))
        logger.supabase('💾 Navigation state saved before navigation')
      } catch (error) {
        logger.error('Failed to save navigation state:', error)
      }
    }

    // 恢复导航前的状态
    const restoreStateAfterNavigation = () => {
      try {
        const savedState = sessionStorage.getItem('cosmicNavigationState')
        if (savedState) {
          const state = JSON.parse(savedState)
          const timeSinceNavigation = Date.now() - state.timestamp

          // 如果是2秒内的导航，认为是SPA导航而不是页面刷新
          if (timeSinceNavigation < 2000 && state.url !== window.location.href) {
            logger.supabase(`🔄 Restoring state after navigation (${timeSinceNavigation}ms ago)`)
            logger.supabase(`📊 Previous state: logs=${state.logsCount}, user=${state.hasUserData}, supabase=${state.hasSupabaseClient}`)
          }

          // 清除保存的状态
          sessionStorage.removeItem('cosmicNavigationState')
        }
      } catch (error) {
        logger.error('Failed to restore navigation state:', error)
      }
    }

    // 监听页面卸载事件（导航前）
    const handleBeforeUnload = () => {
      saveStateBeforeNavigation()
    }

    // 监听页面加载事件（导航后）
    const handleLoad = () => {
      setTimeout(restoreStateAfterNavigation, 100)
    }

    // 监听路由变化
    const handleRouteChange = () => {
      setIsNavigating(true)
      setNavigationMessage('Navigating...')

      setTimeout(() => {
        setIsNavigating(false)
        setNavigationMessage('')
      }, 500)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('load', handleLoad)

      // 监听导航事件
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function(...args) {
        handleRouteChange()
        setTimeout(() => {
          originalPushState.apply(history, args)
        }, 0)
      }

      history.replaceState = function(...args) {
        handleRouteChange()
        setTimeout(() => {
          originalReplaceState.apply(history, args)
        }, 0)
      }

      window.addEventListener('popstate', handleRouteChange)

      // 页面加载完成后恢复状态
      if (document.readyState === 'complete') {
        setTimeout(restoreStateAfterNavigation, 100)
      }

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('load', handleLoad)
        window.removeEventListener('popstate', handleRouteChange)
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [])

  // 导航中的loading覆盖层
  if (isNavigating) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {navigationMessage || 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}