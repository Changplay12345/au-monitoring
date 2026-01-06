'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, ArrowLeft, User, Mail, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.name.trim()) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username)
        .single()

      if (existingUser) {
        setError('Username already exists')
        setIsLoading(false)
        return
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .single()

      if (existingEmail) {
        setError('Email already exists')
        setIsLoading(false)
        return
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(formData.password, salt)

      // Create user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          username: formData.username,
          email: formData.email,
          password: hashedPassword,
          name: formData.name
        })

      if (insertError) {
        setError(insertError.message)
        setIsLoading(false)
        return
      }

      // Success
      setIsSuccess(true)
      setIsTransitioning(true)
      
      setTimeout(() => {
        router.push('/login?registered=true')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Success transition overlay */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-500 ${
          isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`text-center transform transition-all duration-500 ${
          isTransitioning ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
          <p className="text-gray-500">Redirecting to login...</p>
        </div>
      </div>

      {/* Modern background with subtle red accent */}
      <div className={`min-h-screen bg-gray-100 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 transition-all duration-500 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle red gradient accent - top left corner */}
          <div 
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.8) 0%, rgba(185,28,28,0) 70%)' }}
          />
          {/* Subtle red gradient accent - bottom right */}
          <div 
            className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.6) 0%, rgba(220,38,38,0) 70%)' }}
          />
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
          {/* Floating geometric shapes */}
          <div className="absolute top-20 right-20 w-20 h-20 border-2 border-red-200/30 rounded-xl rotate-12" />
          <div className="absolute top-40 right-40 w-12 h-12 border-2 border-red-300/20 rounded-lg rotate-45" />
          <div className="absolute bottom-32 left-20 w-16 h-16 border-2 border-red-200/25 rounded-xl -rotate-12" />
          <div className="absolute top-1/3 left-10 w-8 h-8 bg-red-500/10 rounded-full" />
          <div className="absolute bottom-1/4 right-32 w-6 h-6 bg-red-400/15 rounded-full" />
          {/* Diagonal lines */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5">
            <div className="absolute top-0 right-20 w-px h-full bg-gradient-to-b from-transparent via-red-500 to-transparent rotate-12 origin-top" />
            <div className="absolute top-0 right-40 w-px h-full bg-gradient-to-b from-transparent via-red-400 to-transparent rotate-12 origin-top" />
          </div>
        </div>
        {/* Centered container with max-width for zoomed-out effect */}
        <div 
          className={`w-full max-w-6xl flex rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-700 ease-out ${
            mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
          }`}
        >
          {/* Left side - Brand/Imagery */}
          <aside className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-l-2xl">
            {/* Background image - using local asset */}
            <img 
              src="/login1.webp"
              alt="Assumption University Campus"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle dark gradient overlay for text readability */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.4) 100%)'
              }}
            />
            {/* Text overlay - top left */}
            <div className="absolute top-0 left-0 p-10 z-10">
              <h1 
                className="text-3xl xl:text-4xl font-light tracking-wide text-white font-[var(--font-inter)]"
                style={{ 
                  textShadow: '0 2px 10px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)'
                }}
              >
                Assumption University
              </h1>
              <p 
                className="text-lg xl:text-xl text-white/90 font-light mt-1 font-[var(--font-inter)]"
                style={{ 
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                of Thailand
              </p>
            </div>
          </aside>

          {/* Right side - Register Form */}
          <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10 bg-white lg:rounded-r-2xl">
            <div className="w-full max-w-md">
              {/* Back button */}
              <a 
                href="/login"
                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </a>

              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/5/50/Assumption_University_of_Thailand_%28logo%29.png"
                  alt="AU Logo"
                  className="w-20 h-20 object-contain"
                />
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
                  Create Account
                </h2>
                <p className="text-gray-500 text-sm mt-1">Join <span className="text-red-700 font-bold">AU-Monitoring</span> today</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading || isSuccess}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={isLoading || isSuccess}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@au.edu"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading || isSuccess}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading || isSuccess}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading || isSuccess}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSuccess 
                      ? 'bg-green-600' 
                      : 'bg-red-700 hover:bg-red-800 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Account Created!
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              {/* Login link */}
              <a 
                href="/login" 
                className="block w-full py-3 px-4 rounded-md font-semibold text-red-700 border-2 border-red-700 text-center hover:bg-red-50 transition-all duration-200 active:scale-[0.98]"
              >
                Sign in instead
              </a>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
