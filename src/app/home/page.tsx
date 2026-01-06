'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { GCPLayout } from '@/components/GCPLayout'
import { 
  Brain, 
  Database, 
  Code2, 
  Users, 
  ArrowRight, 
  BookOpen,
  Activity,
  Shield,
  Zap
} from 'lucide-react'

interface FeatureCard {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  color: string
}

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const features: FeatureCard[] = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'Course Monitoring',
      description: 'Real-time seat tracking and availability monitoring for all courses',
      href: '/course-monitoring',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: 'Registration Simulator',
      description: 'Test and simulate student registrations with real-time data updates',
      href: '/registration-simulator',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Code2 className="w-8 h-8" />,
      title: 'APIs & Services',
      description: 'Access RESTful APIs and integration services for external systems',
      href: '/apis-services',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Admin Panel',
      description: 'Administrative tools for system management and user control',
      href: '/admin-panel',
      color: 'from-red-500 to-red-600'
    }
  ]

  const stats = [
    { label: 'Active Courses', value: '150+', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Real-time Updates', value: '24/7', icon: <Activity className="w-5 h-5" /> },
    { label: 'System Uptime', value: '99.9%', icon: <Shield className="w-5 h-5" /> },
    { label: 'Response Time', value: '<100ms', icon: <Zap className="w-5 h-5" /> }
  ]

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <GCPLayout activeFeature="Home" projectName="AU USR&MP">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Welcome to
                <span className="block text-red-200">AU USR&MP</span>
              </h1>
              <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
                Assumption University Student Registration & Monitoring Platform
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => router.push('/course-monitoring')}
                  className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  Start Monitoring
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/registration-simulator')}
                  className="px-8 py-3 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors flex items-center gap-2"
                >
                  <Database className="w-5 h-5" />
                  Test Simulator
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="flex justify-center mb-3 text-red-600">
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Platform Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive tools for course management, registration simulation, and system monitoring
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  onClick={() => router.push(feature.href)}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center text-red-600 font-medium group-hover:text-red-700">
                    Explore Feature
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Welcome Message */}
        {user && (
          <section className="py-16 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Welcome back, {user.name || user.username}!
              </h2>
              <p className="text-gray-300 text-lg">
                You have full access to all monitoring and simulation tools.
              </p>
            </div>
          </section>
        )}
      </div>
    </GCPLayout>
  )
}
