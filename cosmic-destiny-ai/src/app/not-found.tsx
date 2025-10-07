'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white/20 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">页面未找到</h2>
          <p className="text-white/70 text-lg mb-8">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="bg-transparent hover:bg-white/10 text-white border-white/20"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上页
          </Button>
        </div>
      </div>
    </div>
  )
}
