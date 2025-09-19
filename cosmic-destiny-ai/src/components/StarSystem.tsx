'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface StarSystemProps {
  className?: string
  onCanvasClick?: () => void
}

export default function StarSystem({ className, onCanvasClick }: StarSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    })

    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    // 设置相机位置，向左下倾斜
    camera.position.set(-100, -80, 600)
    camera.lookAt(0, 0, 0)

    // 创建星空背景
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8
    })

    const starVertices = []
    for (let i = 0; i < 3000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000
      starVertices.push(x, y, z)
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    // 创建中心恒星
    const starGeometryCore = new THREE.SphereGeometry(20, 32, 32)
    const starMaterialCore = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      emissive: 0xffd700,
      emissiveIntensity: 0.5
    })
    const centralStar = new THREE.Mesh(starGeometryCore, starMaterialCore)
    scene.add(centralStar)

    // 添加恒星光晕
    const glowGeometry = new THREE.SphereGeometry(30, 32, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3
    })
    const starGlow = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(starGlow)

    // 五行元素配置
    const elements = [
      { name: "金", color: 0xffd700, radius: 130, speed: 0.01, size: 8 },
      { name: "木", color: 0x32cd32, radius: 210, speed: 0.008, size: 10 },
      { name: "水", color: 0x4169e1, radius: 300, speed: 0.015, size: 6 },
      { name: "火", color: 0xff4500, radius: 400, speed: 0.012, size: 12 },
      { name: "土", color: 0x8b4513, radius: 500, speed: 0.006, size: 9 }
    ]

    const planets: THREE.Mesh[] = []
    const orbits: THREE.Line[] = []

    elements.forEach(element => {
      // 创建轨道
      const orbitGeometry = new THREE.RingGeometry(element.radius - 1, element.radius + 1, 64)
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: element.color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      })
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
      orbit.rotation.x = Math.PI / 2
      scene.add(orbit)
      orbits.push(orbit as any)

      // 创建行星
      const planetGeometry = new THREE.SphereGeometry(element.size, 16, 16)
      const planetMaterial = new THREE.MeshBasicMaterial({
        color: element.color,
        emissive: element.color,
        emissiveIntensity: 0.2
      })
      const planet = new THREE.Mesh(planetGeometry, planetMaterial)
      planet.position.x = element.radius
      scene.add(planet)
      planets.push(planet)
    })

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    // 添加点光源
    const pointLight = new THREE.PointLight(0xffffff, 1, 1000)
    pointLight.position.set(0, 0, 0)
    scene.add(pointLight)

    // 鼠标交互
    const mouse = new THREE.Vector2()
    const targetRotation = new THREE.Vector2()
    const currentRotation = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // 降低鼠标灵敏度
      targetRotation.x = mouse.y * 0.2  // 从 0.5 降到 0.2
      targetRotation.y = mouse.x * 0.2  // 从 0.5 降到 0.2
    }

    canvas.addEventListener('mousemove', onMouseMove)

    // 动画循环
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      // 旋转中心恒星和光晕
      centralStar.rotation.y += 0.005
      starGlow.rotation.y += 0.003

      // 旋转行星
      planets.forEach((planet, index) => {
        const element = elements[index]
        const angle = Date.now() * element.speed * 0.001
        planet.position.x = Math.cos(angle) * element.radius
        planet.position.z = Math.sin(angle) * element.radius
        planet.rotation.y += 0.01
      })

      // 平滑旋转场景，使用更慢的插值让旋转更平稳
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.03  // 从 0.05 降到 0.03
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.03  // 从 0.05 降到 0.03

      scene.rotation.x = currentRotation.x
      scene.rotation.y = currentRotation.y

      // 星空缓慢旋转
      stars.rotation.y += 0.0002

      renderer.render(scene, camera)
    }

    animate()

    // 响应式处理
    const handleResize = () => {
      if (!canvas) return
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      onClick={onCanvasClick}
      style={{ cursor: 'pointer' }}
    />
  )
}