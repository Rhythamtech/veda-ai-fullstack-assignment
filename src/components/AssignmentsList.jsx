import React, { useState, useRef, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  Trash2, 
  Eye, 
  FileText, 
  X,
  Sparkles
} from 'lucide-react'
import { useAssessmentStore } from '../store/useAssessmentStore'

export default function AssignmentsList() {
  const { 
    assignments, 
    deleteAssignment, 
    viewAssignment, 
    setScreenStage 
  } = useAssessmentStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenuId, setActiveMenuId] = useState(null)
  const menuRef = useRef(null)

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close context menu on clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = (e, id) => {
    e.stopPropagation()
    if (activeMenuId === id) {
      setActiveMenuId(null)
    } else {
      setActiveMenuId(id)
    }
  }

  return (
    <div className="assignments-stage-container">
      {/* Page Title Context (Mobile Only header replacement details) */}
      <div className="page-heading-block">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="title-dot"></div>
          <h2>Assignments</h2>
        </div>
        <p className="body-sm">Manage and create assignments for your classes.</p>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="filter-search-bar">
        <div className="filter-side">
          <Filter size={18} />
          <span>Filter By</span>
        </div>
        <div className="search-side">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Assignment" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conditional rendering of empty state or grid */}
      {assignments.length === 0 ? (
        /* Empty 0 State Screen */
        <div className="empty-state-card">
          <div className="empty-state-illustration">
            {/* Minimalist Vector-style SVG drawing for A4 paper, loop, sparkles, and search with Red X */}
            <svg viewBox="0 0 320 320" className="illustration-svg">
              {/* Main background soft circle */}
              <circle cx="160" cy="160" r="110" fill="url(#bgGrad)" />
              
              {/* Decorative elements */}
              {/* Loop line on left */}
              <path d="M70,80 Q50,130 90,130 T110,180" fill="none" stroke="#303030" strokeWidth="2.5" strokeLinecap="round" />
              {/* Star/Sparkle 1 */}
              <path d="M210,120 L212,128 L220,130 L212,132 L210,140 L208,132 L200,130 L208,128 Z" fill="#3B82F6" opacity="0.8" />
              {/* Star/Sparkle 2 */}
              <path d="M110,210 L112,216 L118,218 L112,220 L110,226 L108,220 L102,218 L108,216 Z" fill="#3B82F6" opacity="0.8" />
              {/* Blue dot on right */}
              <circle cx="230" cy="170" r="4.5" fill="#3B82F6" />
              
              {/* Floating micro-card at top right */}
              <rect x="200" y="80" width="40" height="24" rx="6" fill="#FFFFFF" filter="url(#shadow-illustration)" />
              <rect x="206" y="88" width="10" height="8" rx="2" fill="#A9A9A9" opacity="0.4" />
              <rect x="220" y="88" width="14" height="8" rx="2" fill="#A9A9A9" opacity="0.4" />

              {/* White A4 paper block */}
              <g transform="translate(115, 75)">
                <rect x="0" y="0" width="86" height="114" rx="8" fill="#FFFFFF" filter="url(#shadow-illustration)" />
                {/* Horizontal line details */}
                <line x1="14" y1="20" x2="38" y2="20" stroke="#303030" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="14" y1="36" x2="62" y2="36" stroke="#DADADA" strokeWidth="3" strokeLinecap="round" />
                <line x1="14" y1="48" x2="72" y2="48" stroke="#DADADA" strokeWidth="3" strokeLinecap="round" />
                <line x1="14" y1="60" x2="72" y2="60" stroke="#DADADA" strokeWidth="3" strokeLinecap="round" />
                <line x1="14" y1="72" x2="52" y2="72" stroke="#DADADA" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Magnifying Glass overlaying paper */}
              <g transform="translate(130, 100)">
                {/* Handle */}
                <line x1="42" y1="42" x2="78" y2="78" stroke="#CBCBD6" strokeWidth="11" strokeLinecap="round" />
                <line x1="42" y1="42" x2="78" y2="78" stroke="#A9A9A9" strokeWidth="6" strokeLinecap="round" />
                {/* Outer Glass ring */}
                <circle cx="28" cy="28" r="28" fill="#EFEFEF" stroke="#CBCBD6" strokeWidth="6" opacity="0.9" />
                {/* Red X icon inside lens */}
                <path d="M19,19 L37,37 M37,19 L19,37" stroke="#EF4444" strokeWidth="6.5" strokeLinecap="round" />
              </g>

              <defs>
                <linearGradient id="bgGrad" x1="160" y1="50" x2="160" y2="270" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F2F2F2" />
                  <stop offset="100%" stopColor="#EFEFEF" />
                </linearGradient>
                <filter id="shadow-illustration" x="-10" y="-10" width="120" height="150" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.06" />
                </filter>
              </defs>
            </svg>
          </div>
          <h3>No assignments yet</h3>
          <p className="empty-desc">
            Create your first assignment to start collecting and grading student submissions. 
            You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
          <button 
            className="btn btn-primary primary-dark-btn"
            onClick={() => setScreenStage('create_assignment')}
          >
            <Plus size={18} />
            <span>Create Your First Assignment</span>
          </button>
        </div>
      ) : (
        /* Filled State Grid View */
        <div style={{ position: 'relative', width: '100%', minHeight: '400px', paddingBottom: '80px' }}>
          {filteredAssignments.length === 0 ? (
            <div className="notif-empty" style={{ padding: '60px 0' }}>
              No assignments match your search query.
            </div>
          ) : (
            <div className="assignments-grid">
              {filteredAssignments.map((a) => (
                <div 
                  key={a.id} 
                  className="assignment-card"
                  onClick={() => viewAssignment(a.id)}
                >
                  <div className="card-top-row">
                    <h4>{a.title}</h4>
                    <div style={{ position: 'relative' }}>
                      <button 
                        className="three-dot-btn"
                        onClick={(e) => toggleMenu(e, a.id)}
                        aria-label="Options"
                      >
                        <MoreVertical size={20} />
                      </button>

                      {/* Dropdown Options Menu */}
                      {activeMenuId === a.id && (
                        <div className="card-context-menu" ref={menuRef}>
                          <button 
                            className="menu-action-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewAssignment(a.id);
                              setActiveMenuId(null);
                            }}
                          >
                            <Eye size={14} />
                            <span>View Assignment</span>
                          </button>
                          <button 
                            className="menu-action-item delete-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAssignment(a.id);
                              setActiveMenuId(null);
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-dates-row">
                    <span className="date-item">
                      <strong>Assigned on :</strong> {a.assignedOn}
                    </span>
                    <span className="date-item">
                      <strong>Due :</strong> {a.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating action button at the bottom center */}
          <div className="floating-action-container no-print">
            <button 
              className="floating-action-btn"
              onClick={() => setScreenStage('create_assignment')}
            >
              <Plus size={18} />
              <span>Create Assignment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
