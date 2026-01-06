import csv
import io
from typing import List, Dict, Tuple
from models import Course, StudyPlanNode, StudyPlanEdge, StudyPlanGraph


def generate_csv(courses: List[Course]) -> str:
    """
    Generate formatted CSV content from courses list with year grouping and better spacing
    """
    output = io.StringIO()
    
    # Sort courses by year, semester for consistent output
    sorted_courses = sorted(courses, key=lambda x: (x.year, x.semester))
    
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Year', 'Semester', 'CourseCode', 'CourseTitle', 'Prerequisite', 'Or'])
    
    # Group courses by year for better organization
    current_year = None
    
    for course in sorted_courses:
        # Add year separator if this is a new year
        if current_year is None or course.year != current_year:
            current_year = course.year
            # Add empty row for visual separation between years
            if current_year != sorted_courses[0].year:  # Don't add separator before first year
                writer.writerow(['', '', '', '', '', ''])
        
        # Clean course data for better CSV output
        course_code = course.course_code.strip() if course.course_code else ''
        course_title = course.course_title.strip() if course.course_title else ''
        prerequisite = course.prerequisite.strip() if course.prerequisite and course.prerequisite != '-' else ''
        or_flag = course.or_flag.strip() if course.or_flag else ''
        
        writer.writerow([
            course.year,
            course.semester,
            course_code,
            course_title,
            prerequisite,
            or_flag
        ])
    
    return output.getvalue()


def generate_study_plan_graph(courses: List[Course]) -> StudyPlanGraph:
    """
    Generate a graph structure for study plan visualization
    """
    
    # Sort courses by year, semester for consistent layout
    sorted_courses = sorted(courses, key=lambda x: (x.year, x.semester))
    
    # Create nodes
    nodes = []
    course_code_to_id = {}  # Map for prerequisite matching
    or_group_counter = {}  # Track OR groups per (year, semester)
    
    # Track vertical position within each semester
    semester_positions = {}  # (year, semester) -> current_row
    
    for course in sorted_courses:
        # Determine node type (check for partial match to handle variations)
        title_lower = course.course_title.lower() if course.course_title else ""
        if "major elective" in title_lower:
            node_type = "major_elective"
        elif "free elective" in title_lower:
            node_type = "free_elective"
        else:
            node_type = "course"
        
        # Generate node ID
        if course.course_code:
            node_id = course.course_code
            # Store both with and without space for lookup
            course_code_to_id[course.course_code] = node_id
            course_code_to_id[course.course_code.replace(" ", "")] = node_id
        else:
            # Generate ID for electives
            semester_key = (course.year, course.semester)
            if semester_key not in or_group_counter:
                or_group_counter[semester_key] = 0
            or_group_counter[semester_key] += 1
            node_id = f"Y{course.year}S{course.semester}-{node_type.upper()}-{or_group_counter[semester_key]}"
        
        # Handle OR-group assignment
        or_group = None
        if course.or_flag == "or":
            or_group = f"Y{course.year}S{course.semester}-OR"
        
        # Calculate position (grid layout)
        semester_index = (course.year - 1) * 2 + course.semester  # 1-8
        semester_key = (course.year, course.semester)
        
        if semester_key not in semester_positions:
            semester_positions[semester_key] = 0
        
        row = semester_positions[semester_key]
        x = semester_index * 300  # Horizontal spacing
        y = row * 150  # Vertical spacing
        semester_positions[semester_key] += 1
        
        node = StudyPlanNode(
            id=node_id,
            year=course.year,
            semester=course.semester,
            code=course.course_code or "",
            title=course.course_title,
            credits=course.credits,
            type=node_type,
            or_group=or_group,
            position={"x": x, "y": y}
        )
        nodes.append(node)
    
    # Create edges from prerequisites with branching support
    edges = []
    
    
    # Group prerequisites by target course for branching
    course_prerequisites = {}  # target_course -> [source_courses]
    
    for course in sorted_courses:
        if not course.course_code or not course.prerequisite or course.prerequisite in ["", "-"]:
            continue
        
        
        # Parse prerequisite string (comma-separated)
        prereq_list = [p.strip() for p in course.prerequisite.split(",")]
        valid_prereqs = []
        
        for prereq in prereq_list:
            if not prereq:
                continue
            
            # Extract course code (handle both "CSX 3001" and "CSX3001" formats)
            # Pattern: 2-4 letters followed by optional space and 4 digits
            import re
            code_match = re.match(r'^([A-Z]{2,4}\s*\d{4})', prereq)
            if code_match:
                prereq_code = code_match.group(1).replace(" ", "")
            else:
                prereq_code = prereq.replace(" ", "")
            
            
            # Only include if prerequisite exists in our nodes
            if prereq_code in course_code_to_id:
                valid_prereqs.append(prereq_code)
        
        if valid_prereqs:
            course_prerequisites[course.course_code] = valid_prereqs
    
    # Create branching edges for courses with multiple prerequisites
    for target_course, source_courses in course_prerequisites.items():
        if len(source_courses) == 1:
            # Single prerequisite - create regular edge
            edge = StudyPlanEdge(
                from_id=course_code_to_id[source_courses[0]],
                to_id=course_code_to_id[target_course]
            )
            edges.append(edge)
        else:
            # Multiple prerequisites - create branching edge
            # Keep first prerequisite as from_id for compatibility
            edge = StudyPlanEdge(
                from_id=course_code_to_id[source_courses[0]],  # First prerequisite
                to_id=course_code_to_id[target_course],
                sources=[course_code_to_id[prereq] for prereq in source_courses]  # All prerequisites
            )
            edges.append(edge)
    
    return StudyPlanGraph(nodes=nodes, edges=edges)


def validate_and_clean_courses(courses: List[Course]) -> List[Course]:
    """
    Validate courses and clean prerequisites to only include in-plan courses
    """
    # Get all valid course codes from the plan
    valid_codes = {course.course_code for course in courses if course.course_code}
    
    cleaned_courses = []
    
    for course in courses:
        # Clean prerequisites
        if course.prerequisite and course.prerequisite not in ["", "-"]:
            # Split by comma and clean each prerequisite
            prereq_list = [p.strip() for p in course.prerequisite.split(",")]
            valid_prereqs = []
            
            for prereq in prereq_list:
                if prereq:
                    # Extract course code (pattern: 2-4 letters + optional space + 4 digits)
                    import re
                    code_match = re.match(r'^([A-Z]{2,4}\s*\d{4})', prereq)
                    if code_match:
                        prereq_code = code_match.group(1).replace(" ", "")
                        # Check both with and without space
                        if prereq_code in valid_codes or prereq_code.replace(" ", "") in {c.replace(" ", "") for c in valid_codes}:
                            valid_prereqs.append(prereq)
            
            course.prerequisite = ", ".join(valid_prereqs)
        
        cleaned_courses.append(course)
    
    return cleaned_courses
