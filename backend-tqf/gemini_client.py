import os
import json
from typing import Dict, Any
import google.generativeai as genai
from models import ParseResponse, ProgramInfo, Course


class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('models/gemini-pro-latest')

    def extract_study_plan(self, document_text: str) -> ParseResponse:
        """
        Extract structured study plan data from document text using Gemini Pro
        """
        prompt = self._get_extraction_prompt()
        full_prompt = f"{prompt}\n\nDocument Text:\n{document_text}"
        
        try:
            response = self.model.generate_content(full_prompt)
            response_text = response.text
            
            # Clean response text - remove any markdown formatting
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Parse JSON response
            data = json.loads(response_text)
            
            # Validate with Pydantic
            return ParseResponse(**data)
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse Gemini JSON response: {e}")
        except Exception as e:
            raise ValueError(f"Gemini API error: {e}")

    def _get_extraction_prompt(self) -> str:
        """
        Returns the structured prompt for Gemini Pro extraction
        """
        return """

You are an expert academic data extractor. Extract the university study plan information from the provided document and return it as structured JSON.

CRITICAL: Extract courses ONLY from the study plan table with Year/Semester headers. DO NOT extract from course description sections or narrative paragraphs.

The study plan is organized in a table with the following structure:
- Year 1, Semester 1
- Year 1, Semester 2  
- Year 2, Semester 1
- Year 2, Semester 2
- Year 3, Semester 1
- Year 3, Semester 2
- Year 4, Semester 1
- Year 4, Semester 2

Each course entry contains: Course Code | Course Title | Credits

RULES:
1. Extract program metadata: program_code, program_title, total_credits
2. Extract courses ONLY from rows immediately following "Year X, Semester Y" headers until the next Year/Semester header appears
3. Course codes follow patterns: CSX (Computer Science), ITX (Information Technology), GE (General Education), MA (Mathematics)
4. For elective courses, create rows with:
   - course_code: "" (empty)
   - course_title: "Major Elective" or "Free Elective" based on context
5. For prerequisites: Look for "Prerequisite:" or "Prerequisites:" text and extract ONLY course codes (CSX, ITX, GE, MA followed by numbers). 
   - Single prerequisite: "Prerequisite: CSX 2008 Mathematics Foundation" → extract "CSX2008"
   - Multiple prerequisites: "Prerequisites: CSX 3001 and ITX 2007" → extract "CSX3001, ITX2007"
   - Ignore non-course prerequisites like "Junior or senior students" or status requirements
   - Only include actual course codes that exist in the study plan
6. For OR-choice courses listed as alternatives in the same semester, set or_flag="or"
7. Ignore credit details like "3 (3-0-6)" - only extract course code and title
8. DO NOT extract from course descriptions, narrative paragraphs, or sections outside the study plan table
9. Return ONLY valid JSON - no additional text or explanations

JSON FORMAT:
{
  "program_info": {
    "program_code": "string",
    "program_title": "string", 
    "total_credits": integer
  },
  "courses": [
    {
      "year": integer,
      "semester": integer,
      "course_code": "string",
      "course_title": "string",
      "credits": integer,
      "prerequisite": "string",
      "or_flag": "string"
    }
  ]
}

Examples:
- Regular course: {"year": 1, "semester": 1, "course_code": "CSX3001", "course_title": "Fundamentals of Computer Programming", "credits": 3, "prerequisite": "", "or_flag": ""}
- Course with prerequisite: {"year": 2, "semester": 1, "course_code": "CSX3003", "course_title": "Data Structures and Algorithms", "credits": 3, "prerequisite": "CSX3001", "or_flag": ""}
- Major elective: {"year": 3, "semester": 1, "course_code": "", "course_title": "Major Elective", "credits": 3, "prerequisite": "", "or_flag": ""}
- OR-choice course: {"year": 2, "semester": 2, "course_code": "GE1401", "course_title": "General Education", "credits": 3, "prerequisite": "", "or_flag": "or"}
"""
