'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/tqf/FileUpload';
import ProgramInfo from '@/components/tqf/ProgramInfo';
import CoursesTable from '@/components/tqf/CoursesTable';
import WelcomeOverlay from '@/components/tqf/WelcomeOverlay';
import { GCPLayout } from '@/components/GCPLayout';
import type { ParseResponse, ProgramInfo as ProgramInfoType, Course } from '@/types/tqf';

export default function TQFMasterPage() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isWelcomeChecked, setIsWelcomeChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFastProcessing, setIsFastProcessing] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [parseResponse, setParseResponse] = useState<ParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user has seen welcome before (optional - for persistence)
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('tqf-welcome-seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
    setIsWelcomeChecked(true);
  }, []);

  const handleGetStarted = () => {
    sessionStorage.setItem('tqf-welcome-seen', 'true');
    setShowWelcome(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const isProcessing = isFastProcessing || isAIProcessing;

  const handleExtract = async (useFast: boolean = false) => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (useFast) {
      setIsFastProcessing(true);
    } else {
      setIsAIProcessing(true);
    }
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = useFast ? 'http://localhost:8001/parse-fast' : 'http://localhost:8001/parse';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Failed to parse document');
      }

      const data: ParseResponse = await response.json();
      setParseResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setParseResponse(null);
    } finally {
      setIsFastProcessing(false);
      setIsAIProcessing(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!parseResponse?.session_id) {
      setError('No data available for download');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/csv/${parseResponse.session_id}`);
      
      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'study-plan.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CSV');
    }
  };

  const handleGenerateStudyPlan = () => {
    if (!parseResponse?.session_id) {
      setError('No data available for study plan generation');
      return;
    }
    
    // Navigate to study plan editor with session ID
    router.push(`/tqf-master/study-plan?session=${parseResponse.session_id}`);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setParseResponse(null);
    setError(null);
  };

  return (
    <GCPLayout activeFeature="TQF Master 2.0" projectName="TQF Master 2.0">
      <div className="min-h-screen" style={{ background: 'var(--au-light-bg)' }}>
        {/* Welcome Overlay */}
        <WelcomeOverlay isVisible={showWelcome && isWelcomeChecked} onGetStarted={handleGetStarted} />
        
        {/* Main Content - Only show after welcome check is complete */}
        {isWelcomeChecked && (
          <>
        {/* Page Title Section */}
        <div style={{ background: 'var(--au-white)', borderBottom: '1px solid var(--au-border-soft)' }}>
          <div className="au-container">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="au-page-title">
                  TQF Master 2.0
                </h1>
                <p className="mt-6 text-sm" style={{ color: 'var(--au-text-muted)' }}>
                  Study Plan Extractor
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="au-container py-12">
        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="text-center">
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            
            {/* Extract Buttons */}
            <div className="mt-8 flex justify-center gap-4">
              {/* Fast Extract Button */}
              <button
                onClick={() => handleExtract(true)}
                disabled={!selectedFile || isProcessing}
                className="au-btn-secondary text-base"
                style={{ 
                  border: '2px solid var(--au-navy)',
                  color: 'var(--au-navy)',
                  fontWeight: 600,
                }}
              >
                {isFastProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Extracting...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Fast Extract
                  </>
                )}
              </button>

              {/* Download Sample Button */}
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/TQF_Sample.docx';
                  link.download = 'TQF_Sample.docx';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="au-btn-secondary text-base flex items-center gap-2"
                style={{ 
                  border: '2px solid #2B579A',
                  color: '#2B579A',
                  fontWeight: 600,
                }}
              >
                {/* Microsoft Word Icon */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm7 1.5V9h5.5L13 3.5zM7 13l1.5 6h1l1-4 1 4h1l1.5-6h-1l-1 4-1-4h-1l-1 4-1-4H7z"/>
                </svg>
                Download Sample
              </button>
            </div>
            
            {/* Hint text */}
            <p className="mt-3 text-xs" style={{ color: 'var(--au-text-muted)' }}>
              Fast Extract: ~2-5 seconds | Download sample TQF document to test
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-4xl mx-auto">
              <div className="p-4" style={{ 
                background: 'rgba(254, 20, 20, 0.05)', 
                border: '1px solid rgba(254, 20, 20, 0.2)',
                borderRadius: '4px'
              }}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5"
                      style={{ color: 'var(--au-red)' }}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium" style={{ color: 'var(--au-red)' }}>
                      Error
                    </h3>
                    <div className="mt-1 text-sm" style={{ color: 'var(--au-text-main)' }}>
                      {error}
                    </div>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setError(null)}
                      style={{ color: 'var(--au-red)' }}
                      className="hover:opacity-70"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {parseResponse && (
            <div className="space-y-8">
              {/* Program Info */}
              <ProgramInfo programInfo={parseResponse.program_info} />

              {/* Courses Table */}
              <CoursesTable courses={parseResponse.courses} />

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDownloadCSV}
                  className="au-btn-secondary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download CSV
                </button>
                
                <button
                  onClick={handleGenerateStudyPlan}
                  className="au-btn-primary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Generate Study Plan
                </button>
                
                <button
                  onClick={resetForm}
                  className="au-btn-secondary"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Feature Cards Dark Section */}
      {!parseResponse && (
        <section className="au-dark-section">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="au-section-title mb-8">
              Manage Your Study Plan in Just a Few Steps
            </h2>
            <p className="text-sm mb-12" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '24px auto 48px' }}>
              Extract course information from your study plan documents and generate structured data for easy management.
            </p>
            
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 - Primary */}
              <div className="au-feature-card au-feature-card-primary">
                <div className="au-feature-card-icon">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="au-feature-card-title">Upload Study Plan</h3>
                <p className="au-feature-card-text">Upload your DOCX or PDF study plan document to get started</p>
              </div>
              
              {/* Card 2 - Secondary */}
              <div className="au-feature-card au-feature-card-secondary">
                <div className="au-feature-card-icon">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="au-feature-card-title">Review Courses</h3>
                <p className="au-feature-card-text">Extracts and validates all course information automatically</p>
              </div>
              
              {/* Card 3 - Secondary */}
              <div className="au-feature-card au-feature-card-secondary">
                <div className="au-feature-card-icon">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="au-feature-card-title">Generate Visual Plan</h3>
                <p className="au-feature-card-text">Create an interactive visual study plan with course dependencies</p>
              </div>
              
              {/* Card 4 - Secondary */}
              <div className="au-feature-card au-feature-card-secondary">
                <div className="au-feature-card-icon">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="au-feature-card-title">Export & Download</h3>
                <p className="au-feature-card-text">Download CSV data or export your visual study plan as PDF</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
        <footer className="au-footer">
          <p className="au-footer-text">
            TQF Master 2.0
          </p>
        </footer>
      </>
      )}
      </div>
    </GCPLayout>
  );
}
