'use client'

import { useState } from 'react'

export default function TestPage() {
  const [message, setMessage] = useState('Loading...')
  
  useState(() => {
    // Test basic React functionality
    setTimeout(() => {
      setMessage('React is working!')
    }, 1000)
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-600">{message}</p>
        <button 
          onClick={() => setMessage('Button clicked!')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Button
        </button>
      </div>
    </div>
  )
}
