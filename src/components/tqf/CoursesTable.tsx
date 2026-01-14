'use client';

import React from 'react';
import { Course } from '@/types/tqf';

interface CoursesTableProps {
  courses: Course[];
}

export default function CoursesTable({ courses }: CoursesTableProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload and parse a study plan document to see course information.
          </p>
        </div>
      </div>
    );
  }

  // Sort courses by year and semester
  const sortedCourses = [...courses].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.semester - b.semester;
  });

  const isElective = (course: Course) => {
    return !course.course_code && (
      course.course_title === 'Major Elective' || 
      course.course_title === 'Free Elective'
    );
  };

  const isOrCourse = (course: Course) => {
    return course.or_flag === 'or';
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Courses ({courses.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prerequisite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Or
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCourses.map((course, index) => (
                  <tr
                    key={index}
                    className={`
                      ${isElective(course) ? 'bg-blue-50' : ''}
                      ${isOrCourse(course) ? 'bg-amber-50' : ''}
                      hover:bg-gray-50 transition-colors
                    `}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {course.course_code || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        {course.course_title}
                        {isElective(course) && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Elective
                          </span>
                        )}
                        {isOrCourse(course) && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            OR Choice
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {course.prerequisite || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.or_flag || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Legend */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
              <span>Elective Course</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-100 rounded mr-2"></div>
              <span>OR Choice Course</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
