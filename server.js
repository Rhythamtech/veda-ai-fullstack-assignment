import { WebSocketServer } from 'ws';

const port = 8080;
const wss = new WebSocketServer({ port });

console.log(`🚀 VedaAI Academic Assessment WebSocket Server running on ws://localhost:${port}`);

wss.on('connection', (ws) => {
  console.log('🔌 Teacher client connected to assessment generation stream.');

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      console.log('📥 Received command:', parsed.action);

      if (parsed.action === 'generate-assessment') {
        const payload = parsed.data;
        generateAssessment(ws, payload);
      }
    } catch (err) {
      console.error('❌ Failed parsing client message:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid payload encoding.' }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected.');
  });
});

function generateAssessment(ws, payload) {
  const steps = [
    { type: 'progress', step: 'upload', progress: 20, message: payload.file ? `[WS ENGINE] Parsing uploaded syllabus file: "${payload.file.name}"...` : '[WS ENGINE] Initializing standard general chemistry curriculum parameters...' },
    { type: 'progress', step: 'upload', progress: 35, message: '[WS ENGINE] Core topics successfully isolated: Kinetic theory, chemical equilibria, covalent weights.' },
    { type: 'progress', step: 'analysis', progress: 50, message: '[WS ENGINE] Synthesizing instructions: balancing recall items with computational logic...' },
    { type: 'progress', step: 'generation', progress: 70, message: `[WS ENGINE] Generating questions: Drafting ${payload.questionTypes.map(q => `${q.count}x ${q.type}`).join(', ')}...` },
    { type: 'progress', step: 'review', progress: 88, message: '[WS ENGINE] Validating options structure and creating CBSE standard answer rubrics...' },
    { type: 'progress', step: 'formatting', progress: 95, message: '[WS ENGINE] Rendering and compilation complete. Exporting A4 print coordinates...' }
  ];

  let stepIdx = 0;

  const streamNextStep = () => {
    if (ws.readyState !== 1) return; // Client closed socket

    if (stepIdx < steps.length) {
      ws.send(JSON.stringify(steps[stepIdx]));
      stepIdx++;
      setTimeout(streamNextStep, 1000);
    } else {
      // Completed, return final high quality assessment structure
      const mockQuestions = [];
      let qNumber = 1;

      payload.questionTypes.forEach((qConfig) => {
        const count = Number(qConfig.count || 1);
        const marks = Number(qConfig.marks || 1);

        for (let i = 0; i < count; i++) {
          if (qConfig.type === 'Multiple Choice') {
            mockQuestions.push({
              id: `ws-q-${qNumber}`,
              number: qNumber,
              type: 'Multiple Choice',
              text: getWSHighMCQ(qNumber, payload.title),
              marks: marks,
              options: [
                'A) Increase temperature only',
                'B) Increase concentration of reactants only',
                'C) Add an inert catalyst and increase volume',
                'D) All of the choices above'
              ],
              correctOption: 3,
              rubric: 'Correct Answer: D. Under Le Chatelier\'s rules, all factors influence reaction shifts.'
            });
          } else if (qConfig.type === 'Short Answer') {
            mockQuestions.push({
              id: `ws-q-${qNumber}`,
              number: qNumber,
              type: 'Short Answer',
              text: getWSHighShort(qNumber, payload.title),
              marks: marks,
              rubric: `Award full ${marks} marks for explaining the physical concept correctly and giving a chemical balanced example.`
            });
          } else {
            mockQuestions.push({
              id: `ws-q-${qNumber}`,
              number: qNumber,
              type: qConfig.type || 'Long Answer',
              text: getWSHighLong(qNumber, payload.title),
              marks: marks,
              rubric: `Up to 4 marks for mathematical proofs. Up to ${marks - 4} marks for qualitative graph balance description.`
            });
          }
          qNumber++;
        }
      });

      const totalMarks = payload.questionTypes.reduce((acc, curr) => acc + (Number(curr.count) * Number(curr.marks)), 0);

      const paper = {
        schoolName: 'VEDA HIGH ACADEMY',
        title: `${payload.title} (Live WS Output)`,
        subject: 'Advanced Science Curriculum',
        timeAllowed: '3 Hours 00 Minutes',
        totalMarks: totalMarks,
        dueDate: payload.dueDate,
        instructions: payload.instructions,
        questions: mockQuestions
      };

      ws.send(JSON.stringify({
        type: 'complete',
        paper: paper
      }));
      console.log('✅ Assessment successfully sent to client!');
    }
  };

  setTimeout(streamNextStep, 500);
}

// Generate helpers
function getWSHighMCQ(idx, theme) {
  const mcqs = [
    'Which of the following describes the behavior of a catalyst in a reversible reaction equilibrium?',
    'What happens to the pressure of an ideal gas when its volume is reduced to half at constant temperature?',
    'Which electronic quantum number determines the spatial orientation of an atomic orbital?'
  ];
  return `${mcqs[idx % mcqs.length]} (Live WebSocket Prompt: ${theme})`;
}

function getWSHighShort(idx, theme) {
  const shorts = [
    'Define Dalton\'s law of partial pressures and show its mathematical equation representation.',
    'Explain the concept of entropy in thermodynamics and describe a physical process where entropy decreases.',
    'Describe the molecular hybridization of Carbon in Ethene vs Ethyne.'
  ];
  return `${shorts[idx % shorts.length]} (${theme} syllabus)`;
}

function getWSHighLong(idx, theme) {
  const longs = [
    'State Faraday\'s Laws of Electrolysis. Derive the formula linking equivalent weights to current flow, and solve for gold deposition in a 2.5 Amp salt electrolyte cell for 4 hours.',
    'Explain the crystalline lattice deviations. Detail Schottky defects and Frenkel defects with neat labeled A4 sketches, and explain their impact on materials electrical conductivity.'
  ];
  return longs[idx % longs.length];
}
