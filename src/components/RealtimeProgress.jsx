import React, { useEffect, useRef } from 'react'
import { Sparkles, X, Terminal, Loader2 } from 'lucide-react'
import { useAssessmentStore } from '../store/useAssessmentStore'

export default function RealtimeProgress() {
  const {
    isGenerating,
    generationStep,
    generationProgress,
    progressLogs,
    cancelGeneration
  } = useAssessmentStore()

  const consoleEndRef = useRef(null)

  // Auto-scroll the terminal logs box
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [progressLogs])

  if (!isGenerating) return null

  // Capitalize current step for user display
  const getReadableStep = (step) => {
    switch (step) {
      case 'connecting':
        return 'Establishing Secure Bridge...'
      case 'upload':
        return 'Parsing Uploaded Materials...'
      case 'analysis':
        return 'Analyzing Curriculum Context...'
      case 'generation':
        return 'Generating Target Questions...'
      case 'review':
        return 'Auditing Grading Rubrics...'
      case 'formatting':
        return 'Rendering Standard A4 Template...'
      default:
        return 'Connecting to VedaAI Engine...'
    }
  }

  return (
    <div className="progress-overlay">
      <div className="progress-window">
        
        {/* Visual Loading Phase */}
        <div className="progress-loading-visual">
          <div style={{ position: 'relative' }}>
            <div className="loader-ring"></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold' }}>
              <Sparkles className="text-warning animate-pulse" size={24} style={{ color: 'var(--brand-accent)' }} />
            </div>
          </div>

          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="progress-status-title">{getReadableStep(generationStep)}</span>
              <span className="progress-pct">{generationProgress}%</span>
            </div>
            
            {/* Animated filling bar */}
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Live Terminal Console Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Terminal size={14} />
            <span>AI Stream Logs (WebSocket)</span>
          </div>

          <div className="terminal-console">
            {progressLogs.map((log, index) => (
              <div key={index} className="terminal-log-line">
                {log}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        </div>

        {/* Cancel Generation Button */}
        <button
          type="button"
          className="btn btn-destructive"
          style={{ width: '100%', height: '46px' }}
          onClick={cancelGeneration}
        >
          <X size={16} />
          <span>Abort Generation</span>
        </button>

      </div>
    </div>
  )
}
