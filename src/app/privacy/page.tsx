'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { Shield, Eye, Lock, Database } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <GCPLayout activeFeature="Privacy" projectName="Privacy Policy">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          {/* Last Updated */}
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-600" />
                Information We Collect
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>We collect the following information to provide and improve our services:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Authentication data (username, email for login purposes)</li>
                  <li>Session information to maintain your logged-in state</li>
                  <li>Usage analytics to understand how our platform is used</li>
                  <li>Course monitoring data (seat availability, registration statistics)</li>
                  <li>Technical data (IP address, browser type, access times)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-600" />
                How We Use Your Information
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>Your information is used to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide access to the monitoring platform</li>
                  <li>Authenticate and authorize users</li>
                  <li>Display real-time course availability</li>
                  <li>Improve our services through analytics</li>
                  <li>Ensure platform security and prevent unauthorized access</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-600" />
                Data Storage and Security
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>We take data security seriously:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All data is encrypted in transit using HTTPS</li>
                  <li>Passwords are securely hashed</li>
                  <li>Access to personal data is restricted to authorized personnel</li>
                  <li>We regularly update our security practices</li>
                  <li>Data is stored on secure, managed infrastructure</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
              <div className="text-gray-600 space-y-2">
                <p>We use cookies to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Maintain your login session (essential cookies)</li>
                  <li>Remember your preferences (functional cookies)</li>
                  <li>Analyze platform usage (analytics cookies)</li>
                </ul>
                <p className="mt-3">You can control cookie preferences through the cookie consent banner or your browser settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <div className="text-gray-600 space-y-2">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request deletion of your account</li>
                  <li>Opt-out of non-essential cookies</li>
                  <li>Request a copy of your data</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="text-gray-600">
                <p>For privacy-related questions or concerns, please contact:</p>
                <p className="mt-2">Email: privacy@au-monitoring.site</p>
                <p>Assumption University</p>
                <p>Student Registration & Monitoring Platform</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </GCPLayout>
  )
}
