'use client';

import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (isProcessing) return;

    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['.docx', '.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(fileExtension)) {
      alert('Please upload a DOCX or PDF file');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`au-upload-card ${dragActive ? 'drag-active' : ''} ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.pdf"
          onChange={handleChange}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="au-upload-icon">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--au-red)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {selectedFile ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold" style={{ color: 'var(--au-text-main)' }}>
              {selectedFile.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--au-text-muted)' }}>
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--au-red)' }}
              disabled={isProcessing}
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-lg font-semibold" style={{ color: 'var(--au-text-main)' }}>
              Drop your study plan file here, or click to browse
            </p>
            <p className="text-sm" style={{ color: 'var(--au-text-muted)' }}>
              Supports DOCX and PDF files up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
