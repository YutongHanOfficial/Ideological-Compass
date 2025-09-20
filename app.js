// app.js - main quiz app
import { QUESTIONS } from './questions.js';
import { scoreResponses, serializeResult } from './scoring.js';

const startBtn = document.getElementById('startBtn');
const quiz = document.getElementById('quiz');
const intro = document.getElementById('intro');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const questionBox = document.getElementById('questionBox');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const results = document.getElementById('results');
const restartBtn = document.getElementById('restartBtn');
const downloadBtn = document.getElementById('downloadBtn');
const compassScores = document.getElementById('compassScores');
const valuesScores = document.getElementById('valuesScores');

let questionOrder = [];
let responses = {}; // id -> [-3..3]
let curIndex = 0;
let qTotal = 50; // default

function getAnswerScale() {
  return [
    { label: "Strongly disagree", value: -3 },
    { label: "Disagree", value: -2 },
    { label: "Slightly disagree", value: -1 },
    { label: "Neutral", value: 0 },
    { label: "Slightly agree", value: 1 },
    { label: "Agree", value: 2 },
    { label: "Strongly agree", value: 3 }
  ];
}

function createOrder(n) {
  const pool = [...QUESTIONS];
  // Shuffle and pick n (or all)
  for (let i=pool.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0,n).map(q => q.id);
}

function findQuestion(id) {
  return QUESTIONS.find(q=>q.id===id);
}

function renderQuestion(index) {
  const qId = questionOrder[index];
  const q = findQuestion(qId);
  qIndexEl.textContent = index+1;
  questionBox.textContent = q.text;
  answersEl.innerHTML = '';
  const scale = getAnswerScale();
  for (const a of scale) {
    const btn = document.createElement('button');
    btn.className = 'answerBtn';
    btn.textContent = a.label;
    btn.dataset.value = a.value;
    btn.addEventListener('click', () => {
      // select visual
      [...answersEl.children].forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      responses[qId] = Number(btn.dataset.value);
    });
    // if previously answered, mark selected
    if (responses[qId] === a.value) btn.classList.add('selected');
    answersEl.appendChild(btn);
  }
}

startBtn.addEventListener('click', () => {
  qTotal = Number(document.getElementById('numQuestions').value);
  questionOrder = createOrder(qTotal);
  intro.classList.add('hidden');
  quiz.classList.remove('hidden');
  qTotalEl.textContent = qTotal;
  curIndex = 0;
  responses = {};
  renderQuestion(curIndex);
});

nextBtn.addEventListener('click', () => {
  // allow moving forward even if unanswered to avoid bias — but you may enforce required answers
  if (curIndex < questionOrder.length - 1) {
    curIndex++;
    renderQuestion(curIndex);
  } else {
    // finish
    finishAndShowResults();
  }
});

prevBtn.addEventListener('click', () => {
  if (curIndex > 0) {
    curIndex--;
    renderQuestion(curIndex);
  }
});

restartBtn.addEventListener('click', () => {
  results.classList.add('hidden');
  intro.classList.remove('hidden');
});

downloadBtn.addEventListener('click', () => {
  const scored = scoreResponses(responses, QUESTIONS);
  const blob = new Blob([JSON.stringify(serializeResult({}, scored, responses), null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'compass_result.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Render charts & scores
function finishAndShowResults() {
  const scored = scoreResponses(responses, QUESTIONS);
  // Show raw numbers and visualizations
  quiz.classList.add('hidden');
  results.classList.remove('hidden');

  compassScores.innerHTML = `Economic (left → right): ${scored.compass.x.toFixed(2)}. Social (auth → lib): ${scored.compass.y.toFixed(2)}.`;
  valuesScores.innerHTML = Object.entries(scored.values).map(([k,v])=>`${k}: ${v}%`).join(' • ');

  // Compass scatter plot
  const ctx = document.getElementById('compassChart').getContext('2d');
  if (window._compassChart) window._compassChart.destroy();
  window._compassChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'You',
        data: [{x: scored.compass.x, y: scored.compass.y}],
        pointRadius: 8
      }]
    },
    options: {
      scales: {
        x: {min:-10, max:10, title:{display:true,text:'Economic (Left - ←   → - Right)'}},
        y: {min:-10, max:10, title:{display:true,text:'Social (Authoritarian ↑  ↓ Libertarian)'}}
      },
      plugins:{legend:{display:false}}
    }
  });

  // Values bar chart
  const vctx = document.getElementById('valuesChart').getContext('2d');
  if (window._valuesChart) window._valuesChart.destroy();
  const labels = Object.keys(scored.values);
  const data = labels.map(l=>scored.values[l]);
  window._valuesChart = new Chart(vctx, {
    type: 'bar',
    data: { labels, datasets: [{ label:'Score (%)', data }] },
    options: { indexAxis:'y', plugins:{legend:{display:false}} }
  });
}
