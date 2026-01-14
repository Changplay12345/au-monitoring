from pydantic import BaseModel
from typing import List, Optional


class ProgramInfo(BaseModel):
    program_code: str
    program_title: str
    total_credits: int


class Course(BaseModel):
    year: int  # 1-4
    semester: int  # 1 or 2
    course_code: str  # empty for electives
    course_title: str  # exact title
    credits: int = 3  # course credits, default 3
    prerequisite: str  # "", "-", or "<CODE> <Title>" or joined list
    or_flag: str  # "or" or ""


class StudyPlanNode(BaseModel):
    id: str
    year: int
    semester: int
    code: str  # course_code (may be empty for electives)
    title: str  # course_title
    credits: int = 3  # course credits
    type: str  # "course" | "major_elective" | "free_elective"
    or_group: Optional[str] = None
    position: Optional[dict] = None  # {x: int, y: int} for initial layout


class StudyPlanEdge(BaseModel):
    from_id: str  # prerequisite course node id
    to_id: str  # dependent course node id
    sources: Optional[List[str]] = None  # multiple sources for branching edges


class StudyPlanGraph(BaseModel):
    nodes: List[StudyPlanNode]
    edges: List[StudyPlanEdge]


class ParseResponse(BaseModel):
    program_info: ProgramInfo
    courses: List[Course]
    session_id: Optional[str] = None
    graph: Optional[StudyPlanGraph] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
