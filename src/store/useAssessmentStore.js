import { create } from 'zustand'

const isDev = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:8000' : window.location.origin);
const WS_BASE_URL = import.meta.env.VITE_WS_URL || (isDev ? 'ws://localhost:8000' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);

export const useAssessmentStore = create((set, get) => ({
  // --- Form & Configuration State ---
  assignmentTitle: 'Chemistry Midterm Assessment',
  dueDate: (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().substring(0, 10);
  })(),
  additionalInstructions: 'Focus on chapters 3 and 4. Emphasize chemical equations and molecular balancing. Keep questions at a moderate difficulty level.',
  questionTypes: [
    { id: '1', type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: '2', type: 'Short Questions', count: 3, marks: 2 },
    { id: '3', type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { id: '4', type: 'Numerical Problems', count: 5, marks: 5 }
  ],
  uploadedFile: null,
  validationErrors: {},
  difficulty: 'Mixed', // 'Mixed' | 'Easy' | 'Medium' | 'Hard'
  cognitiveLevels: ['Remembering', 'Understanding', 'Applying'], 
  syllabusTopics: [
    { id: 't1', name: 'Chemical Equilibrium', active: true },
    { id: 't2', name: 'Electrochemistry', active: true },
    { id: 't3', name: 'Redox Reactions', active: true },
    { id: 't4', name: 'Acid & Base Theory', active: false }
  ],
  topicInput: '',

  // --- Assignments List (Figma Mocking) ---
  assignments: [
    { id: 'a1', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a2', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a3', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a4', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a5', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a6', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a7', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a8', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a9', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' },
    { id: 'a10', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025' }
  ],

  // --- UI Layout States ---
  screenStage: 'assignments_list', // 'assignments_list' | 'create_assignment' | 'assignment_output'
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  darkMode: localStorage.getItem('veda-theme') === 'dark',
  notifications: [
    {
      id: 'n1',
      title: 'Assessment Engine Ready',
      description: 'You can now create highly targeted exams with AI.',
      read: false,
      time: 'Just now'
    },
    {
      id: 'n2',
      title: 'Standard Rubrics Updated',
      description: 'Grading rubric standards for CBSE and ICSE have been loaded.',
      read: true,
      time: '2 hours ago'
    }
  ],

  // --- WebSocket & Generation States ---
  isGenerating: false,
  generationStep: 'idle', // 'idle' | 'connecting' | 'upload' | 'analysis' | 'generation' | 'review' | 'complete' | 'error'
  generationProgress: 0,
  progressLogs: [],
  socket: null,

  // --- Generated Output State ---
  assessmentPaper: null,

  // --- Form Setters ---
  setAssignmentTitle: (title) => set({ assignmentTitle: title }),
  setDueDate: (date) => set({ dueDate: date }),
  setAdditionalInstructions: (instructions) => set({ additionalInstructions: instructions }),
  
  addQuestionTypeRow: () => {
    const rows = get().questionTypes;
    const newId = (Math.max(...rows.map(r => parseInt(r.id) || 0), 0) + 1).toString();
    set({
      questionTypes: [...rows, { id: newId, type: 'Multiple Choice', count: 5, marks: 2 }]
    });
  },
  
  removeQuestionTypeRow: (id) => {
    const rows = get().questionTypes;
    if (rows.length <= 1) return; // Keep at least one row
    set({ questionTypes: rows.filter(r => r.id !== id) });
  },

  updateQuestionTypeRow: (id, fields) => {
    const rows = get().questionTypes.map(row => {
      if (row.id === id) {
        return { ...row, ...fields };
      }
      return row;
    });
    set({ questionTypes: rows });
  },

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setDifficulty: (difficulty) => set({ difficulty }),
  toggleCognitiveLevel: (level) => {
    const current = get().cognitiveLevels;
    if (current.includes(level)) {
      set({ cognitiveLevels: current.filter(l => l !== level) });
    } else {
      set({ cognitiveLevels: [...current, level] });
    }
  },
  setTopicInput: (val) => set({ topicInput: val }),
  addSyllabusTopic: (topicName) => {
    if (!topicName.trim()) return;
    const current = get().syllabusTopics;
    if (current.some(t => t.name.toLowerCase() === topicName.trim().toLowerCase())) {
      return;
    }
    const newId = 't-' + Math.random().toString(36).substring(2, 9);
    set({
      syllabusTopics: [...current, { id: newId, name: topicName.trim(), active: true }],
      topicInput: ''
    });
  },
  toggleSyllabusTopic: (id) => {
    const current = get().syllabusTopics.map(t => {
      if (t.id === id) return { ...t, active: !t.active };
      return t;
    });
    set({ syllabusTopics: current });
  },
  removeSyllabusTopic: (id) => {
    set({ syllabusTopics: get().syllabusTopics.filter(t => t.id !== id) });
  },

  // --- Form Validation ---
  validateForm: () => {
    const errors = {};
    const { assignmentTitle, dueDate, questionTypes } = get();

    if (!assignmentTitle.trim()) {
      errors.assignmentTitle = 'Title is required';
    } else if (assignmentTitle.trim().length < 3) {
      errors.assignmentTitle = 'Title must be at least 3 characters';
    }
    if (!dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(dueDate);
      if (selected < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    // Validate rows
    const rowErrors = {};
    questionTypes.forEach((row, idx) => {
      const singleRowErrors = {};
      if (!row.type.trim()) {
        singleRowErrors.type = 'Type is required';
      }
      if (row.count === '' || row.count === undefined || Number(row.count) <= 0) {
        singleRowErrors.count = 'Must be greater than 0';
      } else if (!Number.isInteger(Number(row.count))) {
        singleRowErrors.count = 'Must be a whole number';
      }
      if (row.marks === '' || row.marks === undefined || Number(row.marks) <= 0) {
        singleRowErrors.marks = 'Must be greater than 0';
      }
      if (Object.keys(singleRowErrors).length > 0) {
        rowErrors[row.id] = singleRowErrors;
      }
    });

    if (Object.keys(rowErrors).length > 0) {
      errors.questionTypes = rowErrors;
    }

    set({ validationErrors: errors });
    return Object.keys(errors).length === 0;
  },

  // --- WebSocket Generation Controller ---
  startGeneration: async () => {
    if (!get().validateForm()) {
      // Trigger error notification
      get().addNotification('Validation Failed', 'Please review the form errors before generating.', 'error');
      return;
    }

    set({
      isGenerating: true,
      generationStep: 'connecting',
      generationProgress: 5,
      progressLogs: ['Initializing assessment engine client...', 'Opening secure WebSocket bridge...'],
      assessmentPaper: null
    });

    const payload = {
      title: get().assignmentTitle,
      dueDate: get().dueDate,
      instructions: get().additionalInstructions,
      questionTypes: get().questionTypes.map(q => ({
        type: q.type,
        count: Number(q.count),
        marks: Number(q.marks)
      })),
      difficulty: get().difficulty,
      cognitiveLevels: get().cognitiveLevels,
      syllabusTopics: get().syllabusTopics.filter(t => t.active).map(t => t.name)
    };

    // Try connecting to real FastAPI backend
    try {
      // 1. POST to /api/generate to enqueue RQ job
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('API server returned an error: ' + response.statusText);
      }

      const { job_id } = await response.json();
      
      // 2. Connect to WebSocket stream
      const ws = new WebSocket(`${WS_BASE_URL}/ws/${job_id}`);
      set({ socket: ws });

      // Connection timeout: after 1.5s, if connection is still connecting, fallback to simulator
      const timeoutId = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn('Real WS server connection timed out, falling back to simulation.');
          ws.close();
          get().runFallbackSimulator(payload);
        }
      }, 1500);

      ws.onopen = () => {
        clearTimeout(timeoutId);
        set({
          progressLogs: [...get().progressLogs, 'Connected to live generation server.', 'Waiting for worker process...']
        });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'progress') {
          set({
            generationStep: data.step,
            generationProgress: data.progress,
            progressLogs: [...get().progressLogs, data.message]
          });
        } else if (data.type === 'complete') {
          const newAssignment = {
            id: `a-${Date.now()}`,
            title: data.paper.title,
            assignedOn: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            due: new Date(get().dueDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
            paper: data.paper
          };
          set({
            isGenerating: false,
            generationStep: 'complete',
            generationProgress: 100,
            progressLogs: [...get().progressLogs, 'AI assessment compiled and signed successfully!'],
            assessmentPaper: data.paper,
            assignments: [newAssignment, ...get().assignments],
            screenStage: 'assignment_output'
          });
          get().addNotification('Assessment Created', `"${data.paper.title}" is ready for review.`, 'success');
        } else if (data.type === 'error' || data.step === 'failed') {
          set({
            isGenerating: false,
            generationStep: 'error',
            progressLogs: [...get().progressLogs, `Server Error: ${data.message || 'Job failed'}`]
          });
          get().addNotification('Generation Error', data.message || 'Job failed', 'error');
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        clearTimeout(timeoutId);
        if (get().generationStep === 'connecting') {
          get().runFallbackSimulator(payload);
        }
      };

      ws.onclose = () => {
        set({ socket: null });
      };

    } catch (e) {
      console.warn('Real backend offline/failed. Falling back to local simulation.', e);
      get().runFallbackSimulator(payload);
    }
  },

  cancelGeneration: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
    }
    set({
      isGenerating: false,
      generationStep: 'idle',
      generationProgress: 0,
      progressLogs: [],
      socket: null
    });
    get().addNotification('Cancelled', 'AI Assessment generation was aborted.', 'info');
  },

  // --- High-Fidelity Client-Side WebSocket Simulator (Fallback) ---
  runFallbackSimulator: (payload) => {
    set({
      progressLogs: [...get().progressLogs, 'Connecting to local simulation agent...', 'Establishing client-side message channel...', 'Mock connection established.']
    });

    const steps = [
      { step: 'upload', progress: 15, delay: 1000, message: payload.file ? `Reading syllabus attachment: "${payload.file.name}"...` : 'No file provided. Initializing baseline curriculum context...' },
      { step: 'upload', progress: 25, delay: 1000, message: payload.file ? 'Successfully extracted topics: Acids and Bases, Redox reaction, Organic compounds.' : 'Retrieved general science and chemistry course standards.' },
      { step: 'analysis', progress: 40, delay: 1200, message: 'Analyzing target cognitive complexity (Bloom\'s Taxonomy: 60% Application, 40% Recall)...' },
      { step: 'analysis', progress: 50, delay: 1000, message: `Integrating custom prompt criteria: "${payload.instructions.substring(0, 40)}..."` },
      { step: 'generation', progress: 65, delay: 1500, message: `Drafting ${payload.questionTypes.map(q => `${q.count}x ${q.type}`).join(', ')}...` },
      { step: 'generation', progress: 80, delay: 1200, message: 'Formulating answers keys, grading schema, and explanatory rubrics...' },
      { step: 'review', progress: 92, delay: 1000, message: 'Running lint rules for educational consistency & word check...' },
      { step: 'formatting', progress: 97, delay: 800, message: 'Formatting document to standard A4 printing canvas...' }
    ];

    let currentStepIndex = 0;

    const executeNextStep = () => {
      if (currentStepIndex < steps.length) {
        const next = steps[currentStepIndex];
        set({
          generationStep: next.step,
          generationProgress: next.progress,
          progressLogs: [...get().progressLogs, next.message]
        });
        currentStepIndex++;
        setTimeout(executeNextStep, next.delay);
      } else {
        // Build final premium assessment object
        const mockQuestions = [];
        let qCount = 1;

        payload.questionTypes.forEach(qConfig => {
          const count = Number(qConfig.count);
          const marks = Number(qConfig.marks);

          for (let i = 0; i < count; i++) {
            if (qConfig.type === 'Multiple Choice') {
              mockQuestions.push({
                id: `q-${qCount}`,
                number: qCount,
                type: 'Multiple Choice',
                text: getMockMCQText(qCount, payload.title),
                marks: marks,
                options: ['A) Option A example', 'B) Option B example', 'C) Option C example', 'D) Option D example'],
                correctOption: 0,
                rubric: `Correct option is A. Explanation: A chemistry basic principle dictates this answer.`
              });
            } else if (qConfig.type === 'Short Answer') {
              mockQuestions.push({
                id: `q-${qCount}`,
                number: qCount,
                type: 'Short Answer',
                text: getMockShortText(qCount, payload.title),
                marks: marks,
                rubric: `Award full ${marks} marks for stating the definition clearly with one supporting equation.`
              });
            } else {
              mockQuestions.push({
                id: `q-${qCount}`,
                number: qCount,
                type: qConfig.type || 'Long Answer',
                text: getMockLongText(qCount, payload.title),
                marks: marks,
                rubric: `Award up to 5 marks for diagram/mechanisms. Award up to 5 marks for experimental explanations.`
              });
            }
            qCount++;
          }
        });

        const totalMarks = payload.questionTypes.reduce((acc, curr) => acc + (Number(curr.count) * Number(curr.marks)), 0);

        const paper = {
          schoolName: 'Delhi Public School, Sector-4, Bokaro',
          title: payload.title,
          subject: 'Science',
          classLevel: '8th',
          timeAllowed: '3 Hours 00 Minutes',
          totalMarks: totalMarks,
          dueDate: payload.dueDate,
          instructions: payload.instructions,
          questions: mockQuestions
        };

        const newAssignment = {
          id: `a-${Date.now()}`,
          title: paper.title,
          assignedOn: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          due: new Date(get().dueDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
          paper: paper
        };

        set({
          isGenerating: false,
          generationStep: 'complete',
          generationProgress: 100,
          progressLogs: [...get().progressLogs, 'AI assessment compiled and signed successfully!'],
          assessmentPaper: paper,
          assignments: [newAssignment, ...get().assignments],
          screenStage: 'assignment_output'
        });
        get().addNotification('Assessment Created', `"${paper.title}" is ready for review.`, 'success');
      }
    };

    setTimeout(executeNextStep, 500);
  },

  // --- Interactive Canvas Editors ---
  updatePaperHeader: (fields) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    set({
      assessmentPaper: {
        ...assessmentPaper,
        ...fields
      }
    });
  },

  updateQuestion: (id, fields) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    const questions = assessmentPaper.questions.map(q => {
      if (q.id === id) {
        return { ...q, ...fields };
      }
      return q;
    });

    // Recompute total marks just in case
    const totalMarks = questions.reduce((acc, curr) => acc + Number(curr.marks || 0), 0);

    set({
      assessmentPaper: {
        ...assessmentPaper,
        questions,
        totalMarks
      }
    });
  },

  deleteQuestion: (id) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    const filtered = assessmentPaper.questions.filter(q => q.id !== id);
    
    // Re-index question numbers
    const questions = filtered.map((q, idx) => ({
      ...q,
      number: idx + 1
    }));

    const totalMarks = questions.reduce((acc, curr) => acc + Number(curr.marks || 0), 0);

    set({
      assessmentPaper: {
        ...assessmentPaper,
        questions,
        totalMarks
      }
    });
  },

  regenerateSingleQuestion: (id) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;

    // Put this question in an "isRegenerating" state
    const questions = assessmentPaper.questions.map(q => {
      if (q.id === id) {
        return { ...q, isRegenerating: true };
      }
      return q;
    });

    set({ assessmentPaper: { ...assessmentPaper, questions } });

    // Simulate WS re-roll
    setTimeout(() => {
      const currentPaper = get().assessmentPaper;
      if (!currentPaper) return;

      const finalQuestions = currentPaper.questions.map(q => {
        if (q.id === id) {
          const isMCQ = q.type === 'Multiple Choice';
          const randomIdx = Math.floor(Math.random() * 100);
          return {
            ...q,
            isRegenerating: false,
            text: isMCQ 
              ? `Alternative Chemistry MCQ Question #${randomIdx}: Which of the following elements has the highest electronegativity?`
              : `Alternative Open Chemistry Question #${randomIdx}: Design an experiment to demonstrate the law of conservation of mass in a closed system.`,
            options: isMCQ ? ['Fluorine', 'Oxygen', 'Chlorine', 'Nitrogen'] : undefined,
            correctOption: isMCQ ? 0 : undefined,
            rubric: isMCQ 
              ? 'Correct answer: Fluorine. Fluorine is the most electronegativity element with a value of 3.98.'
              : 'Award 2 marks for naming a correct chemical reaction, 2 marks for listing the apparatus, and 2 marks for safety protocols.'
          };
        }
        return q;
      });

      set({
        assessmentPaper: {
          ...currentPaper,
          questions: finalQuestions
        }
      });

      get().addNotification('Question Swapped', `Question ${questions.find(q => q.id === id)?.number} has been regenerated by AI.`, 'success');
    }, 1500);
  },

  addCustomQuestion: (type = 'Multiple Choice') => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    const questions = [...assessmentPaper.questions];
    const nextNumber = questions.length + 1;
    const newId = `custom-q-${Math.random().toString(36).substring(2, 9)}`;
    const marks = type === 'Multiple Choice' ? 2 : type === 'Short Answer' ? 5 : 10;
    
    const newQ = {
      id: newId,
      number: nextNumber,
      type: type,
      text: type === 'Multiple Choice' 
        ? 'New Multiple Choice Question: Which of the following is...' 
        : type === 'Short Answer'
        ? 'New Short Answer Question: Define the core principles of...'
        : 'New Long Answer Question: Elaborate on the experimental mechanism of...',
      marks: marks,
      options: type === 'Multiple Choice' ? [
        'A) Option 1 text',
        'B) Option 2 text',
        'C) Option 3 text',
        'D) Option 4 text'
      ] : undefined,
      correctOption: type === 'Multiple Choice' ? 0 : undefined,
      rubric: type === 'Multiple Choice' 
        ? 'Correct option is A. Explanation: Add grading details.'
        : 'Award marks based on clarity and accuracy.'
    };
    
    const newQuestions = [...questions, newQ];
    const totalMarks = newQuestions.reduce((acc, curr) => acc + Number(curr.marks || 0), 0);
    
    set({
      assessmentPaper: {
        ...assessmentPaper,
        questions: newQuestions,
        totalMarks
      }
    });
    
    get().addNotification('Question Added', `A new ${type} question has been added at Q${nextNumber}.`, 'success');
  },

  moveQuestion: (id, direction) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    const questions = [...assessmentPaper.questions];
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    
    const temp = questions[index];
    questions[index] = questions[targetIndex];
    questions[targetIndex] = temp;
    
    const newQuestions = questions.map((q, idx) => ({
      ...q,
      number: idx + 1
    }));
    
    set({
      assessmentPaper: {
        ...assessmentPaper,
        questions: newQuestions
      }
    });
  },

  addMCQOption: (qId) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    const questions = assessmentPaper.questions.map(q => {
      if (q.id === qId) {
        const currentOptions = q.options || [];
        const nextChar = String.fromCharCode(65 + currentOptions.length);
        return {
          ...q,
          options: [...currentOptions, `${nextChar}) New Option`]
        };
      }
      return q;
    });
    set({
      assessmentPaper: {
        ...assessmentPaper,
        questions
      }
    });
  },

  removeMCQOption: (qId, oIdx) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    const questions = assessmentPaper.questions.map(q => {
      if (q.id === qId) {
        const currentOptions = q.options || [];
        if (currentOptions.length <= 2) {
          get().addNotification('Cannot Delete', 'Multiple choice questions must have at least 2 options.', 'error');
          return q;
        }
        const filteredOptions = currentOptions.filter((_, idx) => idx !== oIdx);
        
        const remappedOptions = filteredOptions.map((opt, idx) => {
          const charPrefix = String.fromCharCode(65 + idx) + ')';
          const cleanText = opt.replace(/^[A-Z]\)\s*/, '');
          return `${charPrefix} ${cleanText}`;
        });
        
        let correctOption = q.correctOption;
        if (correctOption === oIdx) {
          correctOption = 0;
        } else if (correctOption > oIdx) {
          correctOption = correctOption - 1;
        }
        
        return {
          ...q,
          options: remappedOptions,
          correctOption
        };
      }
      return q;
    });
    set({
      assessmentPaper: {
        ...assessmentPaper,
        questions
      }
    });
  },

  updateMCQOption: (qId, oIdx, value) => {
    const { assessmentPaper } = get();
    if (!assessmentPaper) return;
    const questions = assessmentPaper.questions.map(q => {
      if (q.id === qId) {
        const currentOptions = [...(q.options || [])];
        const prefix = String.fromCharCode(65 + oIdx) + ')';
        const cleanValue = value.replace(/^[A-Z]\)\s*/, '');
        currentOptions[oIdx] = `${prefix} ${cleanValue}`;
        return {
          ...q,
          options: currentOptions
        };
      }
      return q;
    });
    set({
      assessmentPaper: {
        ...assessmentPaper,
        questions
      }
    });
  },

  // --- Notification System ---
  addNotification: (title, description, type = 'info') => {
    const notifications = get().notifications;
    const newNotif = {
      id: Math.random().toString(),
      title,
      description,
      read: false,
      time: 'Just now',
      type
    };
    set({ notifications: [newNotif, ...notifications] });
  },

  markNotificationsAsRead: () => {
    const readAll = get().notifications.map(n => ({ ...n, read: true }));
    set({ notifications: readAll });
  },

  clearNotifications: () => set({ notifications: [] }),

  // --- UI Helpers ---
  toggleDarkMode: () => {
    const isDark = !get().darkMode;
    localStorage.setItem('veda-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode: isDark });
  },

  setScreenStage: (stage) => set({ screenStage: stage }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  toggleMobileSidebar: () => set({ mobileSidebarOpen: !get().mobileSidebarOpen }),

  deleteAssignment: (id) => {
    set({ assignments: get().assignments.filter(a => a.id !== id) });
    get().addNotification('Assignment Deleted', 'The assignment has been removed.', 'info');
  },

  viewAssignment: (id) => {
    const item = get().assignments.find(a => a.id === id);
    if (item) {
      const paper = item.paper || getFigmaMockPaper(item.title);
      set({
        assessmentPaper: paper,
        screenStage: 'assignment_output'
      });
    }
  }
}));

// --- Figma Mock Paper Helper ---
function getFigmaMockPaper(title) {
  return {
    schoolName: 'Delhi Public School, Sector-4, Bokaro',
    title: title || 'Quiz on Electricity',
    subject: 'Science',
    classLevel: '8th',
    timeAllowed: '45 minutes',
    totalMarks: 20,
    dueDate: '21-06-2025',
    instructions: 'All questions are compulsory unless stated otherwise.',
    questions: [
      { id: 'fq-1', number: 1, type: 'Short Answer', text: '[Easy] Define electroplating. Explain its purpose.', marks: 2, rubric: 'Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.' },
      { id: 'fq-2', number: 2, type: 'Short Answer', text: '[Moderate] What is the role of a conductor in the process of electrolysis?', marks: 2, rubric: 'A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.' },
      { id: 'fq-3', number: 3, type: 'Short Answer', text: '[Easy] Why does a solution of copper sulfate conduct electricity?', marks: 2, rubric: 'Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.' },
      { id: 'fq-4', number: 4, type: 'Short Answer', text: '[Moderate] Describe one example of the chemical effect of electric current in daily life.', marks: 2, rubric: 'An example is the electroplating of silver on jewelry to prevent tarnishing.' },
      { id: 'fq-5', number: 5, type: 'Short Answer', text: '[Moderate] Explain why electric current is said to have chemical effects.', marks: 2, rubric: 'Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects.' },
      { id: 'fq-6', number: 6, type: 'Short Answer', text: '[Challenging] How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.', marks: 2, rubric: 'Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons: 2H2O + 2e- -> H2 + 2OH-. Na+ + OH- -> NaOH (in solution).' },
      { id: 'fq-7', number: 7, type: 'Short Answer', text: '[Challenging] What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.', marks: 2, rubric: 'At the cathode: water is reduced to hydrogen gas and hydroxide ions. At the anode: water is oxidized to oxygen gas and hydrogen ions.' },
      { id: 'fq-8', number: 8, type: 'Short Answer', text: '[Easy] Mention the type of current used in electroplating and justify why it is used.', marks: 2, rubric: 'Direct current (DC) is used in electroplating to ensure a continuous and unidirectional flow of ions for uniform coating.' },
      { id: 'fq-9', number: 9, type: 'Short Answer', text: '[Moderate] What is the importance of electric current in the field of metallurgy?', marks: 2, rubric: 'Electric current is vital in electrorefining and electrometallurgy to extract and purify reactive metals like aluminum and copper.' },
      { id: 'fq-10', number: 10, type: 'Short Answer', text: '[Challenging] Explain with a chemical equation how copper is deposited during the electroplating of an object.', marks: 2, rubric: 'At the cathode, copper ions are reduced to copper metal: Cu2+ + 2e- -> Cu (s), which deposits on the object.' }
    ]
  };
}

// --- Mock Question Generation Helpers ---
function getMockMCQText(idx, theme) {
  const chemMCQs = [
    'Which of the following compounds is responsible for the characteristic smell of rotten eggs?',
    'What is the oxidation state of sulfur in sulfuric acid (H2SO4)?',
    'Which type of chemical bonding involves the electrostatic attraction between oppositely charged ions?',
    'Which of the following elements has the lowest first ionization energy?',
    'Identify the catalyst typically used in the industrial Haber process for synthesizing ammonia.',
    'Under constant temperature and pressure, what will happen to the volume of an ideal gas if the moles of gas are doubled?',
    'What is the pH of a 0.01 M strong monobasic acid solution at 25°C?'
  ];
  return chemMCQs[idx % chemMCQs.length] + ` (Based on theme: "${theme}")`;
}

function getMockShortText(idx, theme) {
  const chemShorts = [
    'Define Le Chatelier\'s principle and explain how an increase in pressure affects gaseous reactions.',
    'Calculate the molarity of a solution prepared by dissolving 4.0 g of NaOH in enough water to make 250 mL of solution.',
    'Distinguish between an endothermic and an exothermic reaction, giving one chemical example of each.',
    'State the laws of electrolysis formulated by Michael Faraday.',
    'Explain why transition elements exhibit variable oxidation states in their compounds.'
  ];
  return chemShorts[idx % chemShorts.length] + ` (Assessment context: ${theme})`;
}

function getMockLongText(idx, theme) {
  const chemLongs = [
    'Describe the extraction of aluminum from bauxite ore using the Hall-Héroult electrochemical cell. Include all chemical equations at the anode and cathode, a labeled schematic diagram of the cell, and the role of cryolite.',
    'State the postulates of Valence Shell Electron Pair Repulsion (VSEPR) theory. Utilize this theory to predict and illustrate the structures and bonding geometries of SF6, XeF4, and PCl5, detailing any lone pair interactions.',
    'Elaborate on the kinetic theory of gases. Derive the ideal gas equation from gas laws, and detail the deviation of real gases under high pressure and low temperature conditions with reference to the van der Waals equation.'
  ];
  return chemLongs[idx % chemLongs.length];
}
