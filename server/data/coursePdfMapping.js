const fs = require('fs');
const path = require('path');

/**
 * Canonical Mapping between recommended demo courses and the 6 course PDFs.
 * 
 * Each record satisfies:
 * - courseId
 * - courseName
 * - officerId
 * - pdfFileName
 * - pdfPath (resolved dynamically)
 * - source
 */
const COURSE_PDF_MAPPINGS = [
  // Officer 1: Ananya Sharma (usr-001) - Senior Statistical Officer, National Accounts Division (NAD)
  {
    officerId: 'usr-001',
    courseId: 'tpac-stat-analysis-14',
    aliasCourseIds: ['igot-stat-analysis-15'],
    competencyId: 'statistical_analysis',
    courseName: 'Statistical Analysis and Inference',
    pdfFileName: 'officer 1-course -1.pdf',
    source: 'TPAC / NSSTA'
  },
  {
    officerId: 'usr-001',
    courseId: 'nssta-price-stats-12',
    aliasCourseIds: [],
    competencyId: 'price_statistics',
    courseName: 'Price Statistics and Index Numbers',
    pdfFileName: 'officer-1 course-2.pdf',
    source: 'NSSTA MoSPI'
  },

  // Officer 2: Rahul Verma (usr-002) - Statistical Officer, Survey Design and Research Division (SDRD)
  {
    officerId: 'usr-002',
    courseId: 'igot-sql-01',
    aliasCourseIds: [],
    competencyId: 'sql',
    courseName: 'SQL and Relational Databases',
    pdfFileName: 'officer-2 course-1.pdf',
    source: 'iGOT Karmayogi'
  },
  {
    officerId: 'usr-002',
    courseId: 'nssta-python-ai-05',
    aliasCourseIds: [],
    competencyId: 'ai_ml',
    courseName: 'AI and Machine Learning in Statistics',
    pdfFileName: 'officer-2 course-2.pdf',
    source: 'NSSTA MoSPI'
  },

  // Officer 3: Priya Nair (usr-003) - Deputy Director, Data Quality Assurance Division (DQAD) / Big Data Cell
  {
    officerId: 'usr-003',
    courseId: 'igot-data-viz-06',
    aliasCourseIds: [],
    competencyId: 'data_visualization',
    courseName: 'Data Visualization and Dashboards',
    pdfFileName: 'officer-3 course-1.pdf',
    source: 'iGOT Karmayogi'
  },
  {
    officerId: 'usr-003',
    courseId: 'igot-python-04',
    aliasCourseIds: [],
    competencyId: 'python',
    courseName: 'Python for Statistical Computing',
    pdfFileName: 'officer-3 course-2.pdf',
    source: 'iGOT Karmayogi'
  }
];

/**
 * Searches candidate directory locations for a course PDF file.
 */
function resolvePdfPath(fileName) {
  if (!fileName) return null;

  const candidateDirs = [
    path.resolve(__dirname, '../../course-materials'),
    path.resolve(__dirname, '../course-materials'),
    path.resolve(__dirname, '../../course_materials'),
    path.resolve(__dirname, '../course_materials'),
    path.resolve(process.cwd(), 'course-materials'),
    path.resolve(process.cwd(), 'course_materials'),
    'C:\\Users\\afrin begum\\Desktop\\course-materials',
    'C:\\Users\\afrin begum\\Desktop\\course_materials'
  ];

  for (const dir of candidateDirs) {
    try {
      if (fs.existsSync(dir)) {
        const fullPath = path.join(dir, fileName);
        if (fs.existsSync(fullPath)) {
          return fullPath;
        }
      }
    } catch (err) {
      // ignore directory read errors and check next candidate
    }
  }

  return null;
}

/**
 * Locates the canonical directory containing course materials.
 */
function getCourseMaterialsDir() {
  const candidateDirs = [
    path.resolve(__dirname, '../../course-materials'),
    path.resolve(__dirname, '../course-materials'),
    path.resolve(__dirname, '../../course_materials'),
    path.resolve(__dirname, '../course_materials'),
    path.resolve(process.cwd(), 'course-materials'),
    path.resolve(process.cwd(), 'course_materials'),
    'C:\\Users\\afrin begum\\Desktop\\course-materials',
    'C:\\Users\\afrin begum\\Desktop\\course_materials'
  ];

  for (const dir of candidateDirs) {
    try {
      if (fs.existsSync(dir)) {
        return dir;
      }
    } catch (err) {}
  }
  return path.resolve(__dirname, '../../course-materials');
}

/**
 * Finds the mapped course record for a given courseId and officerId.
 */
function getCourseMapping(courseId, officerId = null) {
  if (!courseId) return null;

  const normalizedCourseId = courseId.trim().toLowerCase();

  // First, look for an exact match on courseId and officerId
  if (officerId) {
    const match = COURSE_PDF_MAPPINGS.find(m => 
      m.officerId === officerId && 
      (m.courseId.toLowerCase() === normalizedCourseId || (m.aliasCourseIds && m.aliasCourseIds.includes(normalizedCourseId)))
    );
    if (match) {
      const resolvedPath = resolvePdfPath(match.pdfFileName);
      return {
        ...match,
        pdfPath: resolvedPath,
        pdfAvailable: Boolean(resolvedPath)
      };
    }
  }

  // Fallback: search by courseId across all mappings
  const genericMatch = COURSE_PDF_MAPPINGS.find(m => 
    m.courseId.toLowerCase() === normalizedCourseId || 
    (m.aliasCourseIds && m.aliasCourseIds.includes(normalizedCourseId))
  );

  if (genericMatch) {
    const resolvedPath = resolvePdfPath(genericMatch.pdfFileName);
    return {
      ...genericMatch,
      officerId: officerId || genericMatch.officerId,
      pdfPath: resolvedPath,
      pdfAvailable: Boolean(resolvedPath)
    };
  }

  return null;
}

/**
 * Returns all mapped courses for a specific officer.
 */
function getAllMappingsForOfficer(officerId = 'usr-001') {
  return COURSE_PDF_MAPPINGS
    .filter(m => m.officerId === officerId)
    .map(m => {
      const resolvedPath = resolvePdfPath(m.pdfFileName);
      return {
        ...m,
        pdfPath: resolvedPath,
        pdfAvailable: Boolean(resolvedPath)
      };
    });
}

module.exports = {
  COURSE_PDF_MAPPINGS,
  resolvePdfPath,
  getCourseMaterialsDir,
  getCourseMapping,
  getAllMappingsForOfficer
};
