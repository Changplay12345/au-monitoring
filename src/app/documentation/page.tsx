'use client'

import { useState, useEffect } from 'react'
import { GCPLayout } from '@/components/GCPLayout'
import { 
  FileText, 
  Download, 
  Eye, 
  BookOpen,
  ChevronRight,
  CheckCircle2,
  Clock,
  Users,
  Target,
  Shield,
  Zap
} from 'lucide-react'

interface Document {
  id: string
  title: string
  description: string
  type: 'requirements' | 'technical' | 'user-guide' | 'api'
  size: string
  lastUpdated: string
  downloadUrl: string
  viewUrl?: string
  icon: React.ReactNode
  features: string[]
}

const documents: Document[] = [
  {
    id: 'tqf-requirements',
    title: 'AU-Monitoring Software Requirements Specification ',
    description: 'Complete software requirements and technical specifications ',
    type: 'requirements',
    size: '432 KB',
    lastUpdated: 'December 2025',
    downloadUrl: '/Project_SRS_proto.pdf',
    viewUrl: '/Project_SRS_proto.pdf',
    icon: <FileText className="w-6 h-6" />,
    features: [
      'Functional requirements',
      'Non-functional requirements', 
      'System architecture',
      'User stories and use cases',
      'Data models and workflows'
    ]
  },
  // {
  //   id: 'tqf-requirements',
  //   title: 'TQF Software Requirements Specification ',
  //   description: 'Complete software requirements and technical specifications for TQF Master 2.0 system.',
  //   type: 'requirements',
  //   size: '248 KB',
  //   lastUpdated: 'December 2025',
  //   downloadUrl: '/TQF_Software Requirements Specification.pdf',
  //   viewUrl: '/TQF_Software Requirements Specification.pdf',
  //   icon: <FileText className="w-6 h-6" />,
  //   features: [
  //     'Functional requirements',
  //     'Non-functional requirements', 
  //     'System architecture',
  //     'User stories and use cases',
  //     'Data models and workflows'
  //   ]
  //},
  {
    id: 'tqf-user-manual',
    title: 'TQF UserManual',
    description: 'Comprehensive user guide with step-by-step instructions for using TQF Master 2.0.',
    type: 'user-guide',
    size: '811 KB',
    lastUpdated: 'December 2025',
    downloadUrl: '/TQF_UserManual.pdf',
    viewUrl: '/TQF_UserManual.pdf',
    icon: <Users className="w-6 h-6" />,
    features: [
      'Step-by-step tutorials',
      'Screen captures and examples',
      'Troubleshooting guide',
      'FAQ section',
      'Best practices'
    ]
  },
  // {
  //   id: 'usr-requirements',
  //   title: 'USR Software Requirements Specification',
  //   description: 'Detailed software requirements and system architecture for USR platform.',
  //   type: 'requirements',
  //   size: '289 KB',
  //   lastUpdated: 'December 2025',
  //   downloadUrl: '/USR_Software Requirements Specification.pdf',
  //   viewUrl: '/USR_Software Requirements Specification.pdf',
  //   icon: <FileText className="w-6 h-6" />,
  //   features: [
  //     'Functional requirements',
  //     'Non-functional requirements', 
  //     'System architecture',
  //     'User stories and use cases',
  //     'Data models and workflows'
  //   ]
  // },
  {
    id: 'usr-user-manual',
    title: 'USR UserManual',
    description: 'Complete user manual for the USR student registration and monitoring platform.',
    type: 'user-guide',
    size: '881 KB',
    lastUpdated: 'December 2025',
    downloadUrl: '/USR_UserManual.pdf',
    viewUrl: '/USR_UserManual.pdf',
    icon: <Users className="w-6 h-6" />,
    features: [
      'Step-by-step tutorials',
      'Screen captures and examples',
      'Troubleshooting guide',
      'FAQ section',
      'Best practices'
    ]
  },
  {
    id: 'technical-spec',
    title: 'Technical Specifications',
    description: 'Detailed technical implementation guidelines and system architecture',
    type: 'technical',
    size: 'No file',
    lastUpdated: 'December 2025',
    downloadUrl: '/technical-specifications.pdf',
    icon: <Shield className="w-6 h-6" />,
    features: [
      'Database schema',
      'API documentation',
      'Security requirements',
      'Performance specifications',
      'Integration guidelines'
    ]
  },{
    id: 'api-documentation',
    title: 'API Documentation ',
    description: 'RESTful API endpoints and integration documentation',
    type: 'api',
    size: 'No file',
    lastUpdated: 'December 2025',
    downloadUrl: '/api-documentation.pdf',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'Endpoint reference',
      'Authentication guide',
      'Request/response examples',
      'Error handling',
      'Rate limiting'
    ]
  }

]

const typeColors = {
  requirements: 'bg-blue-100 text-blue-800',
  technical: 'bg-purple-100 text-purple-800',
  'user-guide': 'bg-green-100 text-green-800',
  api: 'bg-orange-100 text-orange-800'
}

export default function DocumentationPage() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  const openModal = (doc: Document) => {
    setSelectedDoc(doc)
    setIsOpening(true)
    setIsModalOpen(true)
    // Trigger opening animation after a small delay
    setTimeout(() => setIsOpening(false), 50)
  }

  const closeModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setSelectedDoc(null)
      setIsModalOpen(false)
      setIsClosing(false)
    }, 300)
  }

  // ESC key handler - close modal first
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDoc) {
        e.stopPropagation()
        closeModal()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedDoc])

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.downloadUrl
    link.download = doc.title.replace(/\s+/g, '_') + '.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (doc: Document) => {
    if (doc.viewUrl) {
      window.open(doc.viewUrl, '_blank')
    }
  }

  return (
    <GCPLayout activeFeature="Documentation" projectName="Documentation">
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                USR Software
                <span className="block text-blue-200">Documentation</span>
              </h1>
              
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Complete documentation for the AU Student Registration & Monitoring Platform. 
                Access software requirements, technical specifications, and user guides.
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Updated December 2025</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4" />
                  <span>For Students, Faculty & Admin</span>
                </div>
                {/* <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                  <Target className="w-4 h-4" />
                  <span>Production Ready</span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* Documents Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Available Documents
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Click on any document to view details, download, or open in a new tab.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => openModal(doc)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      {doc.icon}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[doc.type]}`}>
                      {doc.type.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {doc.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{doc.lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{doc.size}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(doc)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    {doc.viewUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleView(doc)
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Document Detail Modal */}
        {selectedDoc && (
          <div 
            className={`fixed inset-0 flex items-center justify-center p-6 z-50 transition-all duration-300 ${
              isClosing || isOpening ? 'bg-black/0' : 'bg-black/50'
            }`}
            onClick={closeModal}
          >
            <div 
              className={`bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto transform transition-all duration-300 ${
                isClosing 
                  ? 'scale-95 opacity-0 translate-y-4' 
                  : isOpening
                    ? 'scale-95 opacity-0 -translate-y-4'
                    : 'scale-100 opacity-100 translate-y-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      {selectedDoc.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedDoc.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedDoc.size} • Updated {selectedDoc.lastUpdated}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  {selectedDoc.description}
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Document Contents:</h4>
                  <ul className="space-y-2">
                    {selectedDoc.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(selectedDoc)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  {selectedDoc.viewUrl && (
                    <button
                      onClick={() => handleView(selectedDoc)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Open in New Tab
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GCPLayout>
  )
}
