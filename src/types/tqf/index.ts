export interface ProgramInfo {
  program_code: string;
  program_title: string;
  total_credits: number;
}

export interface Course {
  year: number;
  semester: number;
  course_code: string;
  course_title: string;
  credits: number;
  prerequisite: string;
  or_flag: string;
}

export interface StudyPlanNode {
  id: string;
  year: number;
  semester: number;
  code: string;
  title: string;
  credits: number;
  type: "course" | "major_elective" | "free_elective";
  or_group?: string;
  position?: { x: number; y: number };
}

export interface StudyPlanEdge {
  from_id: string;
  to_id: string;
  sources?: string[]; // Multiple sources for branching edges
}

export interface StudyPlanGraph {
  nodes: StudyPlanNode[];
  edges: StudyPlanEdge[];
}

export interface ParseResponse {
  program_info: ProgramInfo;
  courses: Course[];
  session_id: string;
  graph?: StudyPlanGraph;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}
