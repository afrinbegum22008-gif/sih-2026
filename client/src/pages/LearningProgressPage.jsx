import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOfficer } from '../context/OfficerContext';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Sparkles, TrendingUp, AlertCircle, HelpCircle, BookOpen, ExternalLink, Eye, EyeOff } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LearningProgressPage() {
  const { user } = useAuth();
  const { progressRecords, refreshAllData, setActiveTab, skillGaps, selectedCourse, setSelectedCourse, recommendations, startCourse } = useOfficer();

  const [selectedFile, setSelectedFile] = useState(null);
  const [competencyId, setCompetencyId] = useState('sql');
  const [materialTitle, setMaterialTitle] = useState('Official Guidelines for Relational Querying of NSSO Survey Microdata');
  const [processingUpload, setProcessingUpload] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(true);

  // Filter mapped demo courses for this officer
  const officerMappedCourses = (recommendations || []).filter(r => r.hasMappedPdf);

  // Auto-select first mapped course if none selected yet
  useEffect(() => {
    if (!selectedCourse && officerMappedCourses.length > 0) {
      setSelectedCourse(officerMappedCourses[0]);
    }
  }, [officerMappedCourses, selectedCourse, setSelectedCourse]);

  // Sync competencyId and materialTitle with selectedCourse
  useEffect(() => {
    if (selectedCourse) {
      if (selectedCourse.competencyId) setCompetencyId(selectedCourse.competencyId);
      if (selectedCourse.courseName) setMaterialTitle(selectedCourse.courseName);
    }
  }, [selectedCourse]);

  // Quiz Taking State
  const [answers, setAnswers] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Generate 15-question final assessment strictly from the mapped PDF
  const handleGenerateCourseAssessment = async (targetCourse = selectedCourse) => {
    const courseToUse = targetCourse || selectedCourse;
    if (!courseToUse) return;
    setProcessingUpload(true);
    setGeneratedQuiz(null);
    setEvaluationResult(null);
    setErrorMessage(null);
    setAnswers({});

    try {
      const res = await fetch('/api/learning/course-assessment/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseToUse.courseId || courseToUse.id,
          userId: user?.id || courseToUse.officerId || 'usr-001'
        })
      });
      const data = await res.json();
      if (data.success && data.quiz) {
        setGeneratedQuiz(data.quiz);
      } else {
        setErrorMessage(data.error || 'Course material is currently unavailable.');
      }
    } catch (err) {
      console.error('Error generating course assessment:', err);
      setErrorMessage('Course material is currently unavailable.');
    } finally {
      setProcessingUpload(false);
    }
  };

  const handleUploadAndGenerate = async (e) => {
    if (e) e.preventDefault();
    setProcessingUpload(true);
    setGeneratedQuiz(null);
    setEvaluationResult(null);
    setAnswers({});

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('document', selectedFile);
      }
      formData.append('competencyId', competencyId);
      formData.append('materialTitle', materialTitle);

      const res = await fetch('/api/learning/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.quiz) {
        setGeneratedQuiz(data.quiz);
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
    } finally {
      setProcessingUpload(false);
    }
  };

  const handleSelectPreloadedSample = (sampleType) => {
    if (sampleType === 'sql') {
      setCompetencyId('sql');
      setMaterialTitle('Official Guidelines for Relational Querying of NSSO Survey Microdata');
      setSelectedFile(null);
    } else if (sampleType === 'sampling') {
      setCompetencyId('sampling');
      setMaterialTitle('NSSTA Module: Two-Stage Stratified Sampling & Variance Estimation');
      setSelectedFile(null);
    } else {
      setCompetencyId('labour_statistics');
      setMaterialTitle('PLFS Labour Indicators & Classification Standards');
      setSelectedFile(null);
    }
    // Auto-trigger generation
    setTimeout(() => {
      handleUploadAndGenerate();
    }, 100);
  };

  const handleSelectQuizOption = (questionId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!generatedQuiz) return;
    setEvaluating(true);

    // Calculate score
    const questions = generatedQuiz.questions || [];
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const quizScore = Math.round((correctCount / questions.length) * 100);

    // Find current before level
    const currentGap = skillGaps.find(g => g.competencyId === competencyId);
    const beforeLevel = currentGap ? currentGap.actualLevel : 'Beginner';

    try {
      const res = await fetch('/api/learning/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || selectedCourse?.officerId || 'usr-001',
          courseId: selectedCourse?.courseId || generatedQuiz?.courseId || null,
          courseName: selectedCourse?.courseName || generatedQuiz?.courseName || materialTitle,
          pdfFileName: selectedCourse?.pdfFileName || generatedQuiz?.pdfFileName || null,
          competencyId: selectedCourse?.competencyId || competencyId,
          competencyName: selectedCourse?.competencyName || (currentGap ? currentGap.competencyName : 'Statistical Competency'),
          beforeLevel,
          quizScore,
          correctCount,
          totalQuestions: questions.length,
          scoreOutOf15: `${correctCount} / ${questions.length}`,
          answers,
          materialTitle: selectedCourse?.courseName || generatedQuiz?.courseName || generatedQuiz.materialTitle || materialTitle
        })
      });
      const data = await res.json();
      if (data.success && data.progressRecord) {
        setEvaluationResult(data.progressRecord);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        await refreshAllData();
      }
    } catch (err) {
      console.error('Failed to evaluate quiz:', err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-emerald" style={{ marginBottom: '8px' }}>
            Page 9 • AI Learning & Progress Evaluation
          </div>
          <h1 className="page-title">
            <TrendingUp size={28} color="#059669" />
            <span>Document-Driven AI Progress Evaluation</span>
          </h1>
          <p className="page-subtitle">
            Upload course materials, slide decks, or technical manuals completed on iGOT or NSSTA.
            The AI extracts key statistical concepts, generates a validation quiz, and scientifically evaluates your
            <strong> BEFORE LEARNING vs AFTER LEARNING competency shift</strong>.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActiveTab('dashboard')}
        >
          <span>View Officer Dashboard</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Missing PDF or Generation Error Alert (TASK 7) */}
      {errorMessage && (
        <div className="callout callout-warning" style={{ marginBottom: '24px', borderLeft: '4px solid #F59E0B', background: '#FFFBEB', padding: '16px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={22} color="#D97706" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#B45309' }}>Course Material Notice:</strong>
            <span style={{ color: '#78350F', marginLeft: '6px' }}>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Selected Course Context & PDF Learning View (TASK 2 & 3) */}
      {selectedCourse && (
        <div className="card" style={{ marginBottom: '28px', border: '2px solid #0C2340', boxShadow: '0 4px 12px rgba(12, 35, 64, 0.08)' }}>
          <div className="card-header" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-navy">Active Course Context</span>
                <span className="badge badge-slate">Officer: {user?.name || selectedCourse.officerId}</span>
                <span className="badge badge-saffron">{selectedCourse.source || 'Official Course'}</span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0C2340', margin: 0 }}>
                {selectedCourse.courseName}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedCourse.pdfUrl && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowPdfViewer(prev => !prev)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {showPdfViewer ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showPdfViewer ? 'Hide PDF' : 'View PDF'}</span>
                  </button>

                  <a
                    href={selectedCourse.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileText size={15} color="#2563EB" />
                    <span>Open in New Tab</span>
                    <ExternalLink size={13} />
                  </a>
                </>
              )}

              <button
                type="button"
                className="btn btn-saffron"
                onClick={() => handleGenerateCourseAssessment(selectedCourse)}
                disabled={processingUpload}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              >
                <Sparkles size={16} />
                <span>{processingUpload ? 'Analyzing PDF & Generating...' : 'Take Course Final Assessment (15 Questions)'}</span>
              </button>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                <strong>Mapped Course Document:</strong> <code style={{ background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', color: '#0F172A' }}>{selectedCourse.pdfFileName || 'Custom Document'}</code>
              </div>

              {/* Course Switcher for Officer */}
              {officerMappedCourses.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Switch Course:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {officerMappedCourses.map(c => {
                      const isSelected = (selectedCourse.courseId === c.courseId) || (selectedCourse.courseName === c.courseName);
                      return (
                        <button
                          key={c.courseId}
                          type="button"
                          className={`btn btn-sm ${isSelected ? 'btn-navy' : 'btn-outline'}`}
                          style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                          onClick={() => {
                            startCourse(c, false);
                            setGeneratedQuiz(null);
                            setEvaluationResult(null);
                            setErrorMessage(null);
                          }}
                        >
                          {c.courseName.length > 25 ? c.courseName.slice(0, 23) + '…' : c.courseName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Integrated PDF Reader */}
            {showPdfViewer && selectedCourse.pdfUrl && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F1F5F9' }}>
                <div style={{ background: '#0C2340', color: '#FFFFFF', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} color="#FF9933" />
                    <span>Official Course Material Reader • {selectedCourse.pdfFileName}</span>
                  </div>
                  <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Study the curriculum before generating the final 15-question validation assessment</span>
                </div>
                <iframe
                  src={selectedCourse.pdfUrl}
                  title={selectedCourse.courseName}
                  width="100%"
                  height="480px"
                  style={{ border: 'none', display: 'block' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section 1: Upload & Material Selector */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div className="card-title">
            <UploadCloud size={20} color="#FF9933" />
            <span>Optional: Upload Additional Training Document or Select Official MoSPI Module</span>
          </div>
        </div>

        {/* Quick Sample Selector for Demo Ease */}
        <div style={{ background: '#FFF7ED', padding: '16px', borderRadius: '10px', border: '1px solid #FED7AA', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚡ 1-Click Official MoSPI / NSSTA Study Material (Instant Demo)
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              style={{ background: '#fff', borderColor: '#EA580C', color: '#9A3412' }}
              onClick={() => handleSelectPreloadedSample('sql')}
            >
              📄 Load: Official SQL Microdata Querying Guide (PLFS)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              style={{ background: '#fff', borderColor: '#2563EB', color: '#1E40AF' }}
              onClick={() => handleSelectPreloadedSample('sampling')}
            >
              📄 Load: NSSTA Two-Stage Stratified Sampling Guide
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              style={{ background: '#fff', borderColor: '#059669', color: '#065F46' }}
              onClick={() => handleSelectPreloadedSample('labour')}
            >
              📄 Load: PLFS Labour Indicators & Classification Standards
            </button>
          </div>
        </div>

        <form onSubmit={handleUploadAndGenerate}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Select Target Competency to Re-evaluate</label>
              <select
                className="form-select"
                value={competencyId}
                onChange={e => setCompetencyId(e.target.value)}
              >
                <option value="sql">SQL & Relational Databases</option>
                <option value="sampling">Sampling Techniques & Variance</option>
                <option value="labour_statistics">Labour Statistics & PLFS</option>
                <option value="python">Python for Statistical Computing</option>
                <option value="leadership">Leadership & Decision Making</option>
                <option value="project_management">Project Management in Official Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Material Title / Handbook Name</label>
              <input
                type="text"
                className="form-input"
                value={materialTitle}
                onChange={e => setMaterialTitle(e.target.value)}
                placeholder="e.g. iGOT Advanced SQL Course Handbook"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Upload File (PDF, DOCX, PPT, PPTX, TXT - Up to 10MB)</label>
            <input
              type="file"
              className="form-input"
              accept=".pdf,.docx,.ppt,.pptx,.txt"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setMaterialTitle(e.target.files[0].name);
                }
              }}
            />
            <div className="form-hint">
              {selectedFile ? `Selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)` : 'Or click any pre-loaded official document button above.'}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-saffron btn-lg"
            disabled={processingUpload}
          >
            <Sparkles size={18} />
            <span>{processingUpload ? 'Extracting Concepts & Generating MCQs...' : 'Extract Concepts & Generate Validation Quiz'}</span>
          </button>
        </form>
      </div>

      {/* Section 2: AI Generated Concept Breakdown & Quiz */}
      {generatedQuiz && !evaluationResult && (
        <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid #FF9933' }}>
          <div className="card-header">
            <div>
              <span className="badge badge-saffron" style={{ marginBottom: '6px' }}>
                AI Psychometric Engine
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0C2340' }}>
                {generatedQuiz.materialTitle}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                Course-Specific Assessment • {generatedQuiz.questions?.length || 15} Questions derived strictly from this uploaded document
              </div>
            </div>
          </div>

          {/* Concepts Extracted */}
          <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0C2340', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>Core Statistical Concepts Extracted from Material:</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(generatedQuiz.conceptsExtracted || []).map((c, i) => (
                <span key={i} className="badge badge-navy" style={{ textTransform: 'none', fontSize: '0.78rem' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {(generatedQuiz.questions || []).map((q, qIndex) => (
              <div key={q.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-slate">Question {qIndex + 1}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Concept: {q.keyConcept}</span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0C2340', marginBottom: '16px', lineHeight: 1.5 }}>
                  {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectQuizOption(q.id, optIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #E65100' : '1px solid #E2E8F0',
                          background: isSelected ? '#FFF7ED' : '#FFFFFF',
                          color: isSelected ? '#7C2D12' : '#334155',
                          fontWeight: isSelected ? 600 : 400,
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid #E65100' : '2px solid #CBD5E1',
                          background: '#fff',
                          flexShrink: 0
                        }} />
                        <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-emerald btn-lg"
              onClick={handleSubmitQuiz}
              disabled={evaluating || Object.keys(answers).length < (generatedQuiz.questions || []).length}
            >
              <span>{evaluating ? 'Evaluating Competency Shift...' : 'Submit Answers & Calculate Competency Shift'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Section 3: Evaluation Results & Before vs After Comparison */}
      {evaluationResult && (
        <div className="card" style={{ marginBottom: '28px', borderLeft: '5px solid #059669', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>
                Progress Verification Completed
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0C2340' }}>
                AI Competency Growth Determination
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.88rem' }}>
                Material Evaluated: {evaluationResult.materialTitle}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Validation Score (Out of 15)
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669' }}>
                {evaluationResult.scoreOutOf15 || `${evaluationResult.correctCount ?? 0} / 15`}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                Overall: {evaluationResult.quizScore}%
              </div>
            </div>
          </div>

          {/* Prominent Before vs After Comparison Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#F8FAFC', padding: '24px', borderRadius: '12px', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                BEFORE LEARNING
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626', marginTop: '6px' }}>
                {evaluationResult.beforeLevel}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Baseline assessment level</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                {evaluationResult.improvementDelta > 0 ? `+${evaluationResult.improvementDelta} Level Upgrade!` : 'Competency Re-enforced'}
              </div>
              <div style={{ fontSize: '1.5rem', margin: '4px 0' }}>➔</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                AFTER LEARNING (CURRENT)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {evaluationResult.afterLevel}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>Verified demonstrated mastery</div>
            </div>
          </div>

          <div className="callout callout-success" style={{ marginBottom: '20px' }}>
            <CheckCircle2 size={18} />
            <div>
              <strong>{evaluationResult.statusMessage}</strong>
            </div>
          </div>

          {/* Recommended Next Step */}
          <div style={{ background: '#FFF7ED', padding: '16px 20px', borderRadius: '10px', border: '1px solid #FED7AA', marginBottom: '24px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', marginBottom: '4px' }}>
              Recommended Next Learning Step
            </div>
            <div style={{ fontSize: '0.9rem', color: '#7C2D12' }}>
              {evaluationResult.nextStep}
            </div>
          </div>

          {/* Answer Explanations */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0C2340', marginBottom: '14px' }}>
              Detailed Question & Answer Review (15 Questions):
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(generatedQuiz?.questions || []).map((q, idx) => {
                const userChoice = answers[q.id];
                const isCorrect = userChoice === q.correctAnswer;
                return (
                  <div key={q.id} style={{ background: '#FFFFFF', border: `1px solid ${isCorrect ? '#10B981' : '#EF4444'}`, borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0C2340' }}>
                        Q{idx + 1}: {q.question}
                      </span>
                      <span className={`badge ${isCorrect ? 'badge-emerald' : 'badge-red'}`}>
                        {isCorrect ? 'Correct (+1 pt)' : 'Incorrect (Review Required)'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                      <strong>Your Answer:</strong> {q.options[userChoice] || 'None'}
                    </div>

                    {!isCorrect && (
                      <div style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '6px' }}>
                        <strong>Correct Answer:</strong> {q.options[q.correctAnswer]}
                      </div>
                    )}

                    <div style={{ fontSize: '0.82rem', color: '#334155', background: '#F8FAFC', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #2563EB', marginTop: '8px' }}>
                      <strong>Statistical Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setEvaluationResult(null);
                setGeneratedQuiz(null);
                setSelectedFile(null);
              }}
            >
              Evaluate Another Document
            </button>

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => setActiveTab('dashboard')}
            >
              <span>View Updated Officer Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Historical Progress Log */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span>Historical Learning Records & Growth Trajectory</span>
          </div>
        </div>

        {progressRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '0.88rem' }}>
            No progress records logged yet. Upload learning materials above to record your first Before vs After progression.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Competency</th>
                  <th>Learning Material Title</th>
                  <th>Before Level</th>
                  <th>After Level</th>
                  <th>Quiz Score</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {progressRecords.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 700, color: '#0C2340' }}>{rec.competencyName}</td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{rec.materialTitle}</td>
                    <td>
                      <span className="badge badge-slate">{rec.beforeLevel}</span>
                    </td>
                    <td>
                      <span className="badge badge-emerald">{rec.afterLevel}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#059669' }}>{rec.quizScore}%</td>
                    <td style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {new Date(rec.evaluatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
