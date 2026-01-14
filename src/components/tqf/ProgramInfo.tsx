'use client';

import React from 'react';
import type { ProgramInfo } from '@/types/tqf';

interface ProgramInfoProps {
  programInfo: ProgramInfo | null;
}

export default function ProgramInfo({ programInfo }: ProgramInfoProps) {
  if (!programInfo) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800">
              No program information available
            </h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            Upload and parse a study plan document to see program details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Program Information
          </h2>
        </div>
        
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Program Code
              </dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {programInfo.program_code || 'Not specified'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Total Credits
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {programInfo.total_credits || 'Not specified'} credits
              </dd>
            </div>
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Program Title
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {programInfo.program_title || 'Not specified'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
