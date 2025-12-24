'use client'

import { useState } from 'react'
import { GCPLayout } from '@/components/GCPLayout'
import { 
  Download, 
  Monitor, 
  Cpu, 
  HardDrive, 
  CheckCircle2,
  Play,
  Calendar,
  FileDown,
  ChevronRight,
  Sparkles
} from 'lucide-react'

interface Version {
  version: string
  date: string
  size: string
  changelog: string[]
  isLatest?: boolean
  downloadUrl?: string
}

const INSTALLER_FILENAME = 'TQF Master 2.0 Setup 2.0.0.exe'
const DOWNLOAD_API_URL = '/api/download'

const versions: Version[] = [
  {
    version: 'v2.0.0',
    date: 'December 18, 2024',
    size: '309 MB',
    changelog: [
      'Complete UI redesign with modern interface',
      'New study plan generator with visual editor',
      'AI-powered course extraction using Gemini',
      'Fast extraction mode for quick parsing',
      'PDF and CSV export support'
    ],
    isLatest: true,
    downloadUrl: `/${INSTALLER_FILENAME}`
  },
  {
    version: 'v1.9.5',
    date: 'October 10, 2024',
    size: '285 MB',
    changelog: [
      'Bug fixes and stability improvements',
      'Updated course database',
      'Minor UI tweaks'
    ]
  },
  {
    version: 'v1.9.0',
    date: 'August 15, 2024',
    size: '280 MB',
    changelog: [
      'Initial public release',
      'Basic document parsing',
      'Study plan visualization'
    ]
  }
]

const videos = [
  { title: 'Getting Started', src: '/Get started.mp4' },
  { title: 'Document Extraction', src: '/Extraction.mp4' },
  { title: 'Study Plan Generator', src: '/Studyplan.mp4' },
]

const systemRequirements = [
  { icon: <Monitor className="w-5 h-5" />, label: 'OS', value: 'Windows 10/11 (64-bit)' },
  { icon: <Cpu className="w-5 h-5" />, label: 'Processor', value: 'Intel Core i3 or equivalent' },
  { icon: <HardDrive className="w-5 h-5" />, label: 'Storage', value: '200 MB available space' },
  { icon: <Sparkles className="w-5 h-5" />, label: 'RAM', value: '4 GB minimum' },
]

export default function TQFDesktopPage() {
  const [downloadingVersion, setDownloadingVersion] = useState<string | null>(null)

  const handleDownload = (ver: Version) => {
    if (!ver.isLatest) return
    
    setDownloadingVersion(ver.version)
    
    // Use API route for trusted download
    const link = document.createElement('a')
    link.href = DOWNLOAD_API_URL
    link.download = INSTALLER_FILENAME
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => {
      setDownloadingVersion(null)
    }, 2000)
  }

  return (
    <GCPLayout activeFeature="TQF Master 2.0 Desktop" projectName="TQF Master 2.0 Desktop">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Desktop Application</span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  TQF Master 2.0
                  <span className="block text-red-200">Desktop Installation</span>
                </h1>
                
                <p className="text-lg text-red-100 mb-8 max-w-xl">
                  The powerful desktop version of TQF Master brings advanced course monitoring 
                  and study plan management directly to your Windows PC. Extract, analyze, and 
                  visualize your academic curriculum with professional-grade tools.
                </p>

                <button 
                  onClick={() => handleDownload(versions[0])}
                  className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <Download className="w-6 h-6" />
                  Download Latest ({versions[0].version})
                </button>
              </div>

              {/* Right - System Requirements Card */}
              <div className="w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    System Requirements
                  </h3>
                  <div className="space-y-4">
                    {systemRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          {req.icon}
                        </div>
                        <div>
                          <p className="text-sm text-red-200">{req.label}</p>
                          <p className="font-medium">{req.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Media Showcase Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                See TQF Master 2.0 in Action
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Watch how TQF Master 2.0 Desktop simplifies your academic workflow with 
                powerful extraction and visualization tools.
              </p>
            </div>

            {/* Video Grid - Autoplay videos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-black">
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    >
                      <source src={video.src} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{video.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Version History & Downloads Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Version History
              </h2>
              <p className="text-gray-600">
                Download the latest version or browse previous releases
              </p>
            </div>

            {/* Version List */}
            <div className="space-y-4">
              {versions.map((ver) => (
                <div 
                  key={ver.version}
                  className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
                    ver.isLatest ? 'border-red-200 shadow-md' : 'border-gray-100'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Version Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{ver.version}</h3>
                          {ver.isLatest && (
                            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {ver.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileDown className="w-4 h-4" />
                            {ver.size}
                          </span>
                        </div>
                      </div>

                      {/* Download Button - Only show for latest version */}
                      {ver.isLatest && (
                        <button
                          onClick={() => handleDownload(ver)}
                          disabled={downloadingVersion === ver.version}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingVersion === ver.version ? (
                            <>
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5" />
                              Download
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Changelog */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">What's new:</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ver.changelog.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <ChevronRight className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="bg-gray-900 text-white py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to streamline your academic workflow?
            </h2>
            <p className="text-gray-400 mb-6">
              Download TQF Master 2.0 Desktop and start managing your study plans today.
            </p>
            <button 
              onClick={() => handleDownload(versions[0])}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Now - Free
            </button>
          </div>
        </section>
      </div>
    </GCPLayout>
  )
}
