import { useRef, useState } from 'react'
import { 
  Plus, 
  FileText, 
  X,
  Calendar,
  ChevronDown,
  Mic,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { useAssessmentStore } from '../store/useAssessmentStore'

export default function AssessmentForm() {
  const {
    assignmentTitle,
    setAssignmentTitle,
    dueDate,
    setDueDate,
    additionalInstructions,
    setAdditionalInstructions,
    questionTypes,
    addQuestionTypeRow,
    removeQuestionTypeRow,
    updateQuestionTypeRow,
    uploadedFile,
    setUploadedFile,
    startGeneration,
    isGenerating,
    setScreenStage
  } = useAssessmentStore()

  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  // Types available in dropdown
  const allowedTypes = [
    'Multiple Choice Questions',
    'Short Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems'
  ]

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const textVal = file.type.startsWith('text/') ? reader.result : 'Binary text mock structure';
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        textContent: textVal
      })
    }
    if (file.type.startsWith('text/')) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const removeFile = (e) => {
    e.stopPropagation()
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="create-assignment-container">
      {/* Page Header */}
      <div className="create-assignment-page-header">
        <div className="page-title-row">
          <span className="status-dot-green"></span>
          <h2 className="page-title">Create Assignment</h2>
        </div>
        <p className="page-subtitle">Set up a new assignment for your students</p>
      </div>
      
      {/* Progress bar line */}
      <div className="progress-bar-line">
        <div className="progress-line-filled"></div>
      </div>

      <div className="card assignment-details-card">
        {/* Assignment Details Title */}
        <div className="details-header">
          <h3>Assignment Details</h3>
          <p className="body-sm">Basic information about your assignment</p>
        </div>

        {/* Form elements */}
        <div className="details-body">
          {/* Upload Dropzone */}
          <div className="dropzone-section">
            <div 
              className={`custom-dropzone ${dragOver ? 'drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
              />
              {!uploadedFile ? (
                <>
                  <div className="custom-dropzone-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 16.3A5 5 0 0 0 16 7h-.18a7 7 0 0 0-13.82 2.75 4 4 0 0 0 0 7.55" />
                      <path d="M12 12v9" />
                      <path d="m9 15 3-3 3 3" />
                    </svg>
                  </div>
                  <div className="dropzone-text-primary">Choose a file or drag & drop it here</div>
                  <div className="dropzone-text-secondary">JPEG, PNG, upto 10MB</div>
                  <button type="button" className="browse-files-btn">Browse Files</button>
                </>
              ) : (
                <div className="uploaded-file-details" onClick={(e) => e.stopPropagation()}>
                  <div className="file-info-row">
                    <FileText size={20} className="file-icon" />
                    <div className="file-meta">
                      <span className="file-name">{uploadedFile.name}</span>
                      <span className="file-size">{uploadedFile.size}</span>
                    </div>
                  </div>
                  <button type="button" className="remove-file-btn" onClick={removeFile}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="dropzone-help-text">Upload images of your preferred document/image</p>
          </div>

          {/* Due date picker */}
          <div className="due-date-section">
            <label className="input-label">Due Date</label>
            <div className="date-input-container">
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="custom-date-input"
              />
              <Calendar size={18} className="calendar-icon-indicator" />
            </div>
          </div>

          {/* Question types template rows */}
          <div className="template-config-section">
            <div className="template-headers">
              <span className="header-type">Question Type</span>
              <span className="header-spacer"></span>
              <span className="header-count">No. of Questions</span>
              <span className="header-marks">Marks</span>
            </div>

            <div className="template-rows">
              {questionTypes.map((row) => (
                <div key={row.id} className="template-row">
                  <div className="select-wrapper-custom">
                    <select
                      className="custom-select"
                      value={row.type}
                      onChange={(e) => updateQuestionTypeRow(row.id, { type: e.target.value })}
                    >
                      {allowedTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="select-chevron-icon" />
                  </div>

                  <button 
                    type="button" 
                    className="delete-row-btn"
                    onClick={() => removeQuestionTypeRow(row.id)}
                    disabled={questionTypes.length <= 1}
                    aria-label="Delete question type"
                  >
                    <X size={18} />
                  </button>

                  <div className="row-counter-block">
                    <button 
                      type="button" 
                      onClick={() => updateQuestionTypeRow(row.id, { count: Math.max(1, Number(row.count) - 1) })}
                    >—</button>
                    <span>{row.count}</span>
                    <button 
                      type="button" 
                      onClick={() => updateQuestionTypeRow(row.id, { count: Number(row.count) + 1 })}
                    >+</button>
                  </div>

                  <div className="row-counter-block">
                    <button 
                      type="button" 
                      onClick={() => updateQuestionTypeRow(row.id, { marks: Math.max(1, Number(row.marks) - 1) })}
                    >—</button>
                    <span>{row.marks}</span>
                    <button 
                      type="button" 
                      onClick={() => updateQuestionTypeRow(row.id, { marks: Number(row.marks) + 1 })}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="template-footer-row">
              <button 
                type="button" 
                className="add-row-btn-custom" 
                onClick={addQuestionTypeRow}
              >
                <span className="plus-icon-circle">
                  <Plus size={14} />
                </span>
                <span className="add-row-text">Add Question Type</span>
              </button>

              <div className="template-totals-box">
                <div>Total Questions : {questionTypes.reduce((acc, r) => acc + Number(r.count || 0), 0)}</div>
                <div>Total Marks : {questionTypes.reduce((acc, r) => acc + (Number(r.count || 0) * Number(r.marks || 0)), 0)}</div>
              </div>
            </div>
          </div>

          {/* Additional instructions */}
          <div className="additional-info-section">
            <label className="input-label">Additional Information (For better output)</label>
            <div className="textarea-container-custom">
              <textarea
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
              />
              <Mic className="mic-icon" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer navigation actions */}
      <div className="create-footer-actions no-print">
        <button 
          type="button" 
          className="form-prev-btn"
          onClick={() => setScreenStage('assignments_list')}
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        <button 
          type="button" 
          className="form-next-btn"
          onClick={() => {
            if (!assignmentTitle || assignmentTitle === 'Chemistry Midterm Assessment') {
              setAssignmentTitle('Quiz on Electricity')
            }
            startGeneration()
          }}
          disabled={isGenerating}
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  )
}
