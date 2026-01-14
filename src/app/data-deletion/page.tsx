'use client'

import { GCPLayout } from '@/components/GCPLayout'
import { Trash2, Mail, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function DataDeletionPage() {
  return (
    <GCPLayout activeFeature="Data Deletion" projectName="Data Deletion">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Trash2 className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Data Deletion Policy</h1>
          </div>

          {/* Last Updated */}
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800">
              At AU-Monitoring, we respect your right to control your personal data. This page explains how you can request deletion of your data from our platform.
            </p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What Data Can Be Deleted
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>Upon your request, we can delete the following data:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Your account information (username, email, name)</li>
                  <li>Profile data and preferences</li>
                  <li>Authentication tokens and session data</li>
                  <li>Activity logs associated with your account</li>
                  <li>Any data obtained through social login (Google, Facebook)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                How to Request Data Deletion
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>You can request deletion of your data through any of the following methods:</p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Option 1: Email Request</h4>
                    <p>Send an email to <a href="mailto:privacy@au-monitoring.site" className="text-red-600 hover:underline">privacy@au-monitoring.site</a> with the subject line "Data Deletion Request" and include:</p>
                    <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                      <li>Your registered email address</li>
                      <li>Your username (if known)</li>
                      <li>Reason for deletion (optional)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Option 2: Account Settings</h4>
                    <p>Log in to your account, go to Account Settings, and click "Delete Account" in the Security section.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Option 3: Facebook Data Deletion</h4>
                    <p>If you signed up using Facebook, you can also request data deletion through Facebook's app settings by removing AU-Monitoring from your connected apps.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Deletion Timeline
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>Once we receive your deletion request:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Verification:</strong> Within 24-48 hours, we will verify your identity</li>
                  <li><strong>Processing:</strong> Data deletion will be processed within 7 business days</li>
                  <li><strong>Confirmation:</strong> You will receive an email confirmation once deletion is complete</li>
                  <li><strong>Backup Removal:</strong> Data may persist in backups for up to 30 days before being permanently removed</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Important Notes
              </h2>
              <div className="text-gray-600 space-y-2">
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Data deletion is <strong>permanent and irreversible</strong></li>
                  <li>You will lose access to all features and saved data</li>
                  <li>If you wish to use the platform again, you will need to create a new account</li>
                  <li>Some anonymized, aggregated data may be retained for analytics purposes</li>
                  <li>We may retain certain data if required by law or for legitimate business purposes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Facebook Users</h2>
              <div className="text-gray-600 space-y-2">
                <p>If you logged in using Facebook, we receive the following data from Facebook:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Your public profile (name, profile picture)</li>
                  <li>Email address</li>
                </ul>
                <p className="mt-3">When you request data deletion, all Facebook-related data will be removed from our systems. You can also revoke our access through your Facebook settings at any time.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Users</h2>
              <div className="text-gray-600 space-y-2">
                <p>If you logged in using Google, we receive the following data from Google:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Your public profile (name, profile picture)</li>
                  <li>Email address</li>
                </ul>
                <p className="mt-3">When you request data deletion, all Google-related data will be removed from our systems. You can also revoke our access through your Google Account settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <div className="text-gray-600">
                <p>For any questions about data deletion or privacy concerns, please contact:</p>
                <p className="mt-2">Email: <a href="mailto:privacy@au-monitoring.site" className="text-red-600 hover:underline">privacy@au-monitoring.site</a></p>
                <p>Assumption University</p>
                <p>Student Registration & Monitoring Platform</p>
              </div>
            </section>

            {/* Callback URL Info for Facebook */}
            <section className="bg-gray-50 rounded-lg p-4 mt-8">
              <h3 className="font-medium text-gray-900 mb-2">For Developers (Facebook Data Deletion Callback)</h3>
              <p className="text-sm text-gray-600">
                Data Deletion Callback URL: <code className="bg-gray-200 px-2 py-1 rounded">https://au-monitoring.site/api/facebook/data-deletion</code>
              </p>
            </section>
          </div>
        </div>
      </div>
    </GCPLayout>
  )
}
