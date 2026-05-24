import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Download, 
  Sparkles, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileJson,
  Check,
  Edit2,
  ArrowUp,
  ArrowDown,
  Plus,
  X
} from 'lucide-react'
import { useAssessmentStore } from '../store/useAssessmentStore'

export default function A4PreviewCanvas() {
  const {
    assessmentPaper,
    updatePaperHeader,
    updateQuestion,
    deleteQuestion,
    regenerateSingleQuestion,
    setScreenStage,
    addNotification,
    moveQuestion,
    addCustomQuestion,
    addMCQOption,
    removeMCQOption,
    updateMCQOption
  } = useAssessmentStore()

  const [showAnswerKey, setShowAnswerKey] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!assessmentPaper) return null

  // Copy standard assessment as Markdown to clipboard
  const handleCopyMarkdown = () => {
    let md = `# ${assessmentPaper.schoolName}\n`
    md += `## ${assessmentPaper.title}\n`
    md += `**Subject:** ${assessmentPaper.subject}  |  **Time Allowed:** ${assessmentPaper.timeAllowed}\n`
    md += `**Total Marks:** ${assessmentPaper.totalMarks} Marks\n\n`
    md += `**Instructions:** ${assessmentPaper.instructions || 'Answer all questions.'}\n\n`
    md += `--- \n\n`

    assessmentPaper.questions.forEach((q) => {
      md += `**Q${q.number}.** ${q.text}  [${q.marks} Marks]\n`
      if (q.type === 'Multiple Choice' && q.options) {
        q.options.forEach((opt, idx) => {
          md += `   ${opt}\n`
        })
      }
      md += `\n`
    })

    if (showAnswerKey) {
      md += `\n--- \n## ANSWER KEY & RUBRIC\n\n`
      assessmentPaper.questions.forEach((q) => {
        md += `**Q${q.number} Answer:** ${q.rubric}\n\n`
      })
    }

    navigator.clipboard.writeText(md)
    setCopied(true)
    addNotification('Copied', 'Assessment paper markdown copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  // Export as raw JSON
  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assessmentPaper, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `${assessmentPaper.title.replace(/\s+/g, '_')}_spec.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    addNotification('Downloaded', 'Assessment JSON blueprint downloaded!', 'success')
  }

  const handlePrint = () => {
    const originalTitle = document.title
    document.title = assessmentPaper.title ? `${assessmentPaper.title.replace(/\s+/g, '_')}` : 'Assessment'
    window.print()
    document.title = originalTitle
  }

  return (
    <div className="output-stage-wrapper">

      {/* Top Assistance Banner Card */}
      <div className="output-top-banner no-print">
        <div className="banner-content">
          <p className="banner-text">
            Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
          </p>
          <div className="banner-actions">
            <button className="banner-btn primary-download" onClick={handlePrint}>
              <Download size={16} />
              <span>Download as PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* A4 paper scroll container */}
      <div className="a4-scrollbox-container">
        <div className="a4-sheet-canvas">

          {/* ── School / Paper Header ── */}
          <div className="a4-school-header">
            <input
              type="text"
              className="a4-school-name-field"
              value={assessmentPaper.schoolName}
              onChange={(e) => updatePaperHeader({ schoolName: e.target.value })}
              title="Edit School Name"
            />
            <div className="a4-subject-class-line">
              <span style={{ fontWeight: 600 }}>Subject:&nbsp;</span>
              <input
                type="text"
                className="a4-header-inline-input"
                value={assessmentPaper.subject}
                onChange={(e) => updatePaperHeader({ subject: e.target.value })}
                style={{ width: '160px', fontWeight: 600 }}
              />
            </div>
            <div className="a4-subject-class-line">
              <span style={{ fontWeight: 600 }}>Class:&nbsp;</span>
              <input
                type="text"
                className="a4-header-inline-input"
                value={assessmentPaper.classLevel || '5th'}
                onChange={(e) => updatePaperHeader({ classLevel: e.target.value })}
                style={{ width: '80px', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* ── Time / Marks row ── */}
          <div className="a4-meta-cols">
            <div className="meta-col-left" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 600 }}>Time Allowed:</span>
              <input
                type="text"
                className="a4-header-inline-input"
                value={assessmentPaper.timeAllowed}
                onChange={(e) => updatePaperHeader({ timeAllowed: e.target.value })}
                style={{ width: '130px', fontWeight: 600 }}
              />
            </div>
            <div className="meta-col-right" style={{ fontWeight: 700 }}>
              Maximum Marks:&nbsp;<span className="marks-total-bold">{assessmentPaper.totalMarks}</span>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="a4-header-divider" />

          {/* ── Instructions ── */}
          <div className="a4-instructions-line">
            <input
              type="text"
              className="a4-instruction-input a4-instruction-bold"
              value={assessmentPaper.instructions || 'All questions are compulsory unless stated otherwise.'}
              onChange={(e) => updatePaperHeader({ instructions: e.target.value })}
            />
          </div>

          {/* ── Student fill fields (no box border) ── */}
          <div className="a4-student-fill-fields">
            <div className="student-field-row">
              <span className="field-label">Name: ______________________________________</span>
            </div>
            <div className="student-field-row">
              <span className="field-label">Roll Number: _______________________________</span>
            </div>
            <div className="student-field-row">
              <span className="field-label">Class: {assessmentPaper.classLevel || '5th'} &nbsp; &nbsp; &nbsp; &nbsp; Section: ____________________</span>
            </div>
          </div>

          {/* ── Section heading ── */}
          <div className="a4-section-indicator">Section A</div>

          {/* ── Section type title ── */}
          <div className="a4-section-details">
            <h4 className="section-title-heading">Short Answer Questions</h4>
            <p className="section-instruction-sub">Attempt all questions. Each question carries 2 marks</p>
          </div>

          {/* ── Question list ── */}
          <div className="a4-questions-list-block">
            {assessmentPaper.questions.map((q) => (
              <div
                key={q.id}
                className={`a4-question-row-item ${q.isRegenerating ? 'q-regenerating-active' : ''}`}
              >
                {/* Hover action buttons */}
                <div className="q-hover-actions-panel no-print">
                  <button className="q-hover-action-btn" onClick={() => moveQuestion(q.id, 'up')} disabled={q.number === 1} title="Move up">
                    <ArrowUp size={14} />
                  </button>
                  <button className="q-hover-action-btn" onClick={() => moveQuestion(q.id, 'down')} disabled={q.number === assessmentPaper.questions.length} title="Move down">
                    <ArrowDown size={14} />
                  </button>
                  <button className="q-hover-action-btn sparkle-action" onClick={() => regenerateSingleQuestion(q.id)} title="Regenerate">
                    <Sparkles size={14} />
                  </button>
                  <button className="q-hover-action-btn delete-action" onClick={() => deleteQuestion(q.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="a4-q-render-layout">
                  <span className="q-index-num">{q.number}.</span>
                  <div className="q-content-text-block">
                    <textarea
                      className="q-text-input-canvas"
                      rows={1}
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                      style={{ height: 'auto', overflow: 'hidden' }}
                    />
                    {q.type === 'Multiple Choice' && q.options && (
                      <div className="a4-mcq-options-container">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="a4-mcq-option-row">
                            <span className="option-letter">{opt.substring(0, 2)}</span>
                            <input
                              type="text"
                              className="a4-mcq-option-inline"
                              value={opt.substring(3)}
                              onChange={(e) => updateMCQOption(q.id, oIdx, e.target.value)}
                            />
                            <button
                              type="button"
                              className="q-hover-action-btn delete-option-btn no-print"
                              onClick={() => removeMCQOption(q.id, oIdx)}
                              disabled={q.options.length <= 2}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm add-option-btn-custom no-print"
                          onClick={() => addMCQOption(q.id)}
                        >
                          <Plus size={10} /> Add Option
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="q-marks-block">
                    [{q.marks} Marks]
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* End of paper */}
          <div className="a4-end-paper">End of Question Paper</div>

          {/* Answer Key */}
          {showAnswerKey && (
            <div className="a4-answers-sheet-section">
              <h4 className="answers-sheet-title">Answer Key:</h4>
              <div className="answers-sheet-list">
                {assessmentPaper.questions.map((q) => (
                  <div key={q.id} className="answer-key-row-item">
                    <span className="answer-key-number">{q.number}.</span>
                    <textarea
                      className="answer-key-rubric-input"
                      rows={2}
                      value={q.rubric}
                      onChange={(e) => updateQuestion(q.id, { rubric: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating exit toolbar */}
      <div className="floating-bottom-toolbar no-print">
        <button
          className="btn btn-secondary exit-btn"
          onClick={() => setScreenStage('assignments_list')}
        >
          <ArrowLeft size={16} />
          <span>Exit Preview</span>
        </button>
      </div>

    </div>
  )
}
