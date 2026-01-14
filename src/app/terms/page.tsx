'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { FileText, Users, AlertCircle, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <GCPLayout activeFeature="Terms" projectName="Terms of Service">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          {/* Last Updated */}
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <div className="text-gray-600">
                <p>By accessing and using the AU-Monitoring (Assumption University Student Registration & Monitoring Platform), you agree to comply with and be bound by these Terms of Service.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                User Responsibilities
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>As a user of this platform, you agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide accurate information during registration</li>
                  <li>Maintain the confidentiality of your login credentials</li>
                  <li>Use the platform for legitimate academic purposes</li>
                  <li>Not attempt to circumvent security measures</li>
                  <li>Not share your account with unauthorized users</li>
                  <li>Report any security vulnerabilities or issues</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                Prohibited Activities
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>You are strictly prohibited from:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Attempting to hack or compromise the system</li>
                  <li>Using automated tools to scrape data</li>
                  <li>Interfering with other users' access</li>
                  <li>Violating academic integrity policies</li>
                  <li>Using the platform for commercial purposes</li>
                  <li>Distributing malware or malicious code</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gray-600" />
                Service Availability
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>While we strive to maintain 99.9% uptime, please note:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>The service may be temporarily unavailable for maintenance</li>
                  <li>We are not liable for service interruptions</li>
                  <li>Data is regularly backed up but we cannot guarantee zero data loss</li>
                  <li>Real-time data may have slight delays</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Accuracy</h2>
              <div className="text-gray-600">
                <p>While we make every effort to provide accurate course information, seat availability data is subject to change without notice. The platform should be used as a guide, and official registration systems should be consulted for final confirmation.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy and Data</h2>
              <div className="text-gray-600">
                <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using this platform, you consent to the collection and use of data as described in our Privacy Policy.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <div className="text-gray-600">
                <p>All content, features, and functionality of the AU-Monitoring platform are owned by Assumption University and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Termination</h2>
              <div className="text-gray-600">
                <p>We reserve the right to suspend or terminate your access to the platform at any time, with or without cause, particularly if you violate these Terms of Service. You may also terminate your account at any time through the account settings or by contacting support.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <div className="text-gray-600">
                <p>The AU-Monitoring platform is provided "as is" without warranties of any kind. Assumption University shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <div className="text-gray-600">
                <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the platform constitutes acceptance of any modified terms.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="text-gray-600">
                <p>For questions about these Terms of Service, please contact:</p>
                <p className="mt-2">Email: legal@au-monitoring.site</p>
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
