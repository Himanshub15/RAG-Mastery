/* ========================================
   RAG Mastery — Interactive Scripts
   ======================================== */

// ========================================
// Particle Background
// ========================================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '6, 182, 212' : '168, 85, 247';
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
animateParticles();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

// ========================================
// Navigation
// ========================================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.anim-reveal').forEach(el => observer.observe(el));

// ========================================
// Pipeline Interactive
// ========================================
const pipelineData = [
  {
    title: 'Document Ingestion',
    icon: '📄',
    desc: 'Load documents from various sources — PDFs, web pages, databases, APIs, or file systems. This is where your knowledge base begins. Tools like LangChain and LlamaIndex provide loaders for dozens of file formats.',
    tags: ['PDF Loader', 'Web Scraper', 'API Connector', 'Database Reader']
  },
  {
    title: 'Chunking',
    icon: '✂️',
    desc: 'Split documents into smaller, meaningful pieces. Chunk size and overlap dramatically affect retrieval quality. Too large = diluted context. Too small = lost meaning. Common sizes range from 256 to 1024 tokens with 10-20% overlap.',
    tags: ['Fixed Size', 'Recursive', 'Semantic', 'Sentence-level']
  },
  {
    title: 'Embedding',
    icon: '🔢',
    desc: 'Convert each chunk into a dense numerical vector using an embedding model. These vectors capture the semantic meaning of text — similar concepts produce similar vectors, enabling mathematical comparison of meaning.',
    tags: ['text-embedding-ada-002', 'BGE', 'Cohere Embed', 'E5']
  },
  {
    title: 'Indexing',
    icon: '🗄️',
    desc: 'Store the embedding vectors in a vector database with their metadata. The index structure (HNSW, IVF, PQ) enables approximate nearest neighbor search at scale, trading a tiny bit of accuracy for massive speed gains.',
    tags: ['HNSW', 'IVF-Flat', 'Product Quantization', 'Metadata']
  },
  {
    title: 'User Query',
    icon: '💬',
    desc: 'The user asks a question. The query is embedded using the same embedding model, producing a query vector in the same semantic space as the stored documents. This is the bridge between natural language and vector search.',
    tags: ['Natural Language', 'Query Embedding', 'Same Model']
  },
  {
    title: 'Retrieval',
    icon: '🔍',
    desc: 'Search the vector database for the top-K most similar chunks to the query. Similarity is measured via cosine similarity, dot product, or Euclidean distance. Advanced systems use hybrid search combining vector + keyword (BM25) matching.',
    tags: ['Cosine Similarity', 'Top-K', 'Hybrid Search', 'Filtering']
  },
  {
    title: 'Augmentation',
    icon: '🧩',
    desc: 'Combine the retrieved chunks with the original query into a structured prompt. This step formats the context for the LLM — arranging retrieved passages, adding instructions, and ensuring the model knows to ground its answer in the provided context.',
    tags: ['Prompt Template', 'Context Window', 'System Prompt']
  },
  {
    title: 'Generation',
    icon: '🤖',
    desc: 'The LLM processes the augmented prompt and generates a response grounded in the retrieved context. The model synthesizes information from multiple chunks, reasons about the query, and produces a coherent, fact-based answer.',
    tags: ['Claude', 'GPT-4', 'Llama', 'Mistral']
  }
];

const pipelineDetail = document.getElementById('pipelineDetail');
const pipelineProgress = document.getElementById('pipelineProgress');
const pipeSteps = document.querySelectorAll('.pipe-step');
let currentStep = 0;

function updatePipeline(step) {
  currentStep = step;
  const data = pipelineData[step];

  // Update active states
  pipeSteps.forEach((s, i) => {
    s.classList.remove('active', 'completed');
    if (i === step) s.classList.add('active');
    else if (i < step) s.classList.add('completed');
  });

  // Update progress bar
  const progress = (step / (pipelineData.length - 1)) * 100;
  pipelineProgress.style.width = progress + '%';

  // Update detail
  pipelineDetail.innerHTML = `
    <span class="detail-icon">${data.icon}</span>
    <h3>${data.title}</h3>
    <p>${data.desc}</p>
    <div class="detail-tags">${data.tags.map(t => `<span>${t}</span>`).join('')}</div>
  `;
}

pipeSteps.forEach(step => {
  step.addEventListener('click', () => {
    updatePipeline(parseInt(step.dataset.step));
  });
});

updatePipeline(0);

// ========================================
// Chunking Demo
// ========================================
const sourceText = document.getElementById('chunkSource').textContent.trim();
const chunkResults = document.getElementById('chunkResults');
const chunkCount = document.getElementById('chunkCount');
const chunkInfo = document.getElementById('chunkInfo');
const chunkBtns = document.querySelectorAll('.chunk-btn');

const chunkStrategies = {
  fixed: {
    fn: (text) => {
      const size = 120;
      const chunks = [];
      for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
      }
      return chunks;
    },
    info: '<strong>Fixed-Size Chunking:</strong> Splits text into equal-length segments (120 chars here). Simple but may break mid-sentence, losing context. Best when content is uniform.'
  },
  sentence: {
    fn: (text) => {
      return text.match(/[^.!?]+[.!?]+/g) || [text];
    },
    info: '<strong>Sentence Chunking:</strong> Splits at sentence boundaries. Preserves complete thoughts but chunks may be very small or very large. Good for Q&A style documents.'
  },
  semantic: {
    fn: (text) => {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const chunks = [];
      let current = '';
      const topics = ['RAG', 'Vector', 'Embedding'];
      sentences.forEach(s => {
        const switchesTopic = topics.some(t => s.includes(t) && !current.includes(t));
        if (current && (switchesTopic || current.length > 200)) {
          chunks.push(current.trim());
          current = s;
        } else {
          current += s;
        }
      });
      if (current.trim()) chunks.push(current.trim());
      return chunks;
    },
    info: '<strong>Semantic Chunking:</strong> Groups sentences by topic similarity. Uses semantic signals to detect topic shifts. Produces the most meaningful chunks but requires more computation.'
  },
  recursive: {
    fn: (text) => {
      const maxSize = 200;
      const separators = ['\n\n', '\n', '. ', ' '];
      function split(txt, sepIdx) {
        if (txt.length <= maxSize || sepIdx >= separators.length) return [txt];
        const sep = separators[sepIdx];
        const parts = txt.split(sep);
        const chunks = [];
        let current = '';
        parts.forEach(p => {
          const piece = current ? current + sep + p : p;
          if (piece.length > maxSize && current) {
            chunks.push(current.trim());
            current = p;
          } else {
            current = piece;
          }
        });
        if (current.trim()) chunks.push(current.trim());
        return chunks;
      }
      return split(text, 0);
    },
    info: '<strong>Recursive Chunking:</strong> Tries to split by paragraphs first, then sentences, then words. Preserves structure hierarchically. This is the default strategy in LangChain.'
  }
};

function applyChunking(strategy) {
  const data = chunkStrategies[strategy];
  const chunks = data.fn(sourceText);
  chunkCount.textContent = `(${chunks.length} chunks)`;
  chunkResults.innerHTML = chunks.map((c, i) =>
    `<div class="chunk-item"><span class="chunk-label">Chunk ${i + 1} · ${c.length} chars</span>${c}</div>`
  ).join('');
  chunkInfo.innerHTML = data.info;
}

chunkBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    chunkBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyChunking(btn.dataset.strategy);
  });
});

applyChunking('fixed');

// ========================================
// Vector Space Visualization
// ========================================
const vectorCanvas = document.getElementById('vectorCanvas');
const vctx = vectorCanvas.getContext('2d');

const wordGroups = [
  { label: 'Animals', color: '#06b6d4', words: [
    { word: 'cat', x: 0.15, y: 0.3 }, { word: 'dog', x: 0.2, y: 0.35 },
    { word: 'fish', x: 0.12, y: 0.45 }, { word: 'bird', x: 0.25, y: 0.25 },
    { word: 'horse', x: 0.22, y: 0.42 }
  ]},
  { label: 'Technology', color: '#a855f7', words: [
    { word: 'computer', x: 0.7, y: 0.2 }, { word: 'software', x: 0.75, y: 0.28 },
    { word: 'database', x: 0.65, y: 0.3 }, { word: 'algorithm', x: 0.72, y: 0.15 },
    { word: 'server', x: 0.8, y: 0.22 }
  ]},
  { label: 'Food', color: '#22c55e', words: [
    { word: 'pizza', x: 0.4, y: 0.7 }, { word: 'pasta', x: 0.45, y: 0.75 },
    { word: 'sushi', x: 0.35, y: 0.78 }, { word: 'bread', x: 0.5, y: 0.68 },
    { word: 'salad', x: 0.38, y: 0.65 }
  ]},
  { label: 'Science', color: '#f43f5e', words: [
    { word: 'physics', x: 0.8, y: 0.7 }, { word: 'chemistry', x: 0.75, y: 0.75 },
    { word: 'biology', x: 0.85, y: 0.65 }, { word: 'math', x: 0.78, y: 0.62 },
    { word: 'neuron', x: 0.72, y: 0.68 }
  ]}
];

let hoveredWord = null;

function drawVectorSpace() {
  const w = vectorCanvas.width;
  const h = vectorCanvas.height;
  vctx.clearRect(0, 0, w, h);

  // Grid
  vctx.strokeStyle = 'rgba(255,255,255,0.03)';
  vctx.lineWidth = 1;
  for (let i = 0; i < w; i += 40) {
    vctx.beginPath(); vctx.moveTo(i, 0); vctx.lineTo(i, h); vctx.stroke();
  }
  for (let i = 0; i < h; i += 40) {
    vctx.beginPath(); vctx.moveTo(0, i); vctx.lineTo(w, i); vctx.stroke();
  }

  // Axes
  vctx.strokeStyle = 'rgba(255,255,255,0.08)';
  vctx.lineWidth = 1;
  vctx.beginPath(); vctx.moveTo(0, h / 2); vctx.lineTo(w, h / 2); vctx.stroke();
  vctx.beginPath(); vctx.moveTo(w / 2, 0); vctx.lineTo(w / 2, h); vctx.stroke();

  // Draw cluster circles and words
  wordGroups.forEach(group => {
    // Cluster background
    let cx = 0, cy = 0;
    group.words.forEach(ww => { cx += ww.x * w; cy += ww.y * h; });
    cx /= group.words.length; cy /= group.words.length;
    vctx.beginPath();
    vctx.arc(cx, cy, 60, 0, Math.PI * 2);
    vctx.fillStyle = group.color + '08';
    vctx.fill();
    vctx.strokeStyle = group.color + '20';
    vctx.lineWidth = 1;
    vctx.stroke();

    // Label
    vctx.font = '600 11px Outfit, sans-serif';
    vctx.fillStyle = group.color + '90';
    vctx.textAlign = 'center';
    vctx.fillText(group.label, cx, cy - 50);

    // Words
    group.words.forEach(ww => {
      const px = ww.x * w;
      const py = ww.y * h;
      const isHovered = hoveredWord === ww;

      // Dot
      vctx.beginPath();
      vctx.arc(px, py, isHovered ? 6 : 4, 0, Math.PI * 2);
      vctx.fillStyle = group.color;
      vctx.fill();

      if (isHovered) {
        vctx.beginPath();
        vctx.arc(px, py, 12, 0, Math.PI * 2);
        vctx.strokeStyle = group.color + '60';
        vctx.lineWidth = 2;
        vctx.stroke();
      }

      // Label
      vctx.font = `${isHovered ? '600' : '400'} ${isHovered ? 13 : 11}px Outfit, sans-serif`;
      vctx.fillStyle = isHovered ? '#f1f5f9' : '#94a3b8';
      vctx.textAlign = 'center';
      vctx.fillText(ww.word, px, py - 10);
    });
  });
}

function handleVectorHover(e) {
  const rect = vectorCanvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (vectorCanvas.width / rect.width);
  const my = (e.clientY - rect.top) * (vectorCanvas.height / rect.height);
  const w = vectorCanvas.width, h = vectorCanvas.height;

  hoveredWord = null;
  for (const group of wordGroups) {
    for (const ww of group.words) {
      const dx = ww.x * w - mx;
      const dy = ww.y * h - my;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        hoveredWord = ww;
        break;
      }
    }
    if (hoveredWord) break;
  }
  vectorCanvas.style.cursor = hoveredWord ? 'pointer' : 'default';
  drawVectorSpace();
}

vectorCanvas.addEventListener('mousemove', handleVectorHover);
drawVectorSpace();

// ========================================
// RAG Patterns Tabs
// ========================================
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('active');
  });
});

// ========================================
// Roadmap Accordion
// ========================================
document.querySelectorAll('.rm-card').forEach(card => {
  card.addEventListener('click', () => {
    const item = card.closest('.rm-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.rm-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// Open first roadmap item by default
document.querySelector('.rm-item')?.classList.add('open');

// ========================================
// Quiz
// ========================================
const quizData = [
  {
    q: 'What does RAG stand for?',
    options: ['Random Access Generation', 'Retrieval-Augmented Generation', 'Recursive Algorithm Generation', 'Real-time AI Gateway'],
    correct: 1,
    explanation: 'RAG = Retrieval-Augmented Generation. It retrieves relevant documents before the LLM generates its response.'
  },
  {
    q: 'What is the primary purpose of a vector database in a RAG system?',
    options: ['Store SQL queries', 'Cache LLM responses', 'Enable fast similarity search over embeddings', 'Train the language model'],
    correct: 2,
    explanation: 'Vector databases store embedding vectors and enable fast approximate nearest neighbor (ANN) search to find relevant documents.'
  },
  {
    q: 'What is an embedding in the context of RAG?',
    options: ['A compressed file format', 'A dense numerical vector representing semantic meaning', 'A type of database index', 'A model fine-tuning technique'],
    correct: 1,
    explanation: 'Embeddings are dense vectors (e.g., 1536 dimensions) that capture the semantic meaning of text, enabling mathematical similarity comparison.'
  },
  {
    q: 'Which similarity metric is most commonly used to compare embeddings?',
    options: ['Hamming distance', 'Manhattan distance', 'Cosine similarity', 'Jaccard index'],
    correct: 2,
    explanation: 'Cosine similarity measures the angle between two vectors, making it the most popular metric for comparing text embeddings.'
  },
  {
    q: 'What is "chunking" in the RAG pipeline?',
    options: ['Compressing the LLM weights', 'Splitting documents into smaller pieces', 'Encrypting vector data', 'Batching API requests'],
    correct: 1,
    explanation: 'Chunking splits documents into smaller, manageable pieces before embedding. Chunk size and strategy significantly impact retrieval quality.'
  },
  {
    q: 'What problem does RAG primarily solve for LLMs?',
    options: ['Making models smaller', 'Reducing training time', 'Hallucination and knowledge cutoff', 'Improving tokenization'],
    correct: 2,
    explanation: 'RAG addresses hallucination (generating false info) and knowledge cutoff (outdated training data) by grounding responses in retrieved documents.'
  },
  {
    q: 'What is HNSW in the context of vector databases?',
    options: ['A language model architecture', 'An approximate nearest neighbor indexing algorithm', 'A data serialization format', 'A query optimization technique'],
    correct: 1,
    explanation: 'HNSW (Hierarchical Navigable Small World) is an efficient graph-based algorithm for approximate nearest neighbor search in high-dimensional spaces.'
  },
  {
    q: 'In Advanced RAG, what is the purpose of a re-ranker?',
    options: ['Sort documents by date', 'Re-order retrieved results by relevance using a cross-encoder', 'Randomize search results', 'Compress the context window'],
    correct: 1,
    explanation: 'Re-rankers use cross-encoder models to score query-document pairs more accurately than initial retrieval, improving the quality of top results.'
  },
  {
    q: 'Which RAG pattern uses an AI agent that can decide when and how to retrieve?',
    options: ['Naive RAG', 'Modular RAG', 'Agentic RAG', 'Graph RAG'],
    correct: 2,
    explanation: 'Agentic RAG uses an autonomous AI agent that reasons about when to retrieve, which tools to use, and iteratively refines its approach.'
  },
  {
    q: 'What is HyDE (Hypothetical Document Embeddings)?',
    options: ['A vector database', 'A technique that generates a hypothetical answer to improve retrieval', 'A type of embedding model', 'A chunking strategy'],
    correct: 1,
    explanation: 'HyDE generates a hypothetical document/answer for the query, embeds it, and uses that embedding for retrieval — often finding better matches than the raw query.'
  }
];

let currentQ = 0;
let answers = new Array(quizData.length).fill(null);
let submitted = new Array(quizData.length).fill(false);

const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');
const quizProgressBar = document.getElementById('quizProgressBar');
const quizCounter = document.getElementById('quizCounter');
const quizPrev = document.getElementById('quizPrev');
const quizNext = document.getElementById('quizNext');
const quizResult = document.getElementById('quizResult');
const quizContainer = document.getElementById('quizContainer');

function renderQuiz() {
  const q = quizData[currentQ];
  quizQuestion.textContent = q.q;
  quizCounter.textContent = `${currentQ + 1} / ${quizData.length}`;
  quizProgressBar.style.width = ((currentQ + 1) / quizData.length * 100) + '%';
  quizPrev.disabled = currentQ === 0;
  quizNext.textContent = currentQ === quizData.length - 1 ? 'Finish' : 'Next';

  quizOptions.innerHTML = q.options.map((opt, i) => {
    let cls = 'quiz-option';
    if (submitted[currentQ]) {
      if (i === q.correct) cls += ' correct';
      else if (answers[currentQ] === i) cls += ' wrong';
    } else if (answers[currentQ] === i) {
      cls += ' selected';
    }
    return `<button class="${cls}" data-idx="${i}" ${submitted[currentQ] ? 'disabled' : ''}>${opt}</button>`;
  }).join('');

  quizOptions.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.idx)));
  });

  if (submitted[currentQ]) {
    const correct = answers[currentQ] === q.correct;
    quizFeedback.textContent = correct ? '✓ Correct! ' + q.explanation : '✗ Incorrect. ' + q.explanation;
    quizFeedback.className = `quiz-feedback show ${correct ? 'correct-fb' : 'wrong-fb'}`;
  } else {
    quizFeedback.className = 'quiz-feedback';
  }
}

function selectAnswer(idx) {
  if (submitted[currentQ]) return;
  answers[currentQ] = idx;
  submitted[currentQ] = true;
  renderQuiz();
}

quizPrev.addEventListener('click', () => {
  if (currentQ > 0) { currentQ--; renderQuiz(); }
});

quizNext.addEventListener('click', () => {
  if (currentQ < quizData.length - 1) {
    currentQ++;
    renderQuiz();
  } else {
    showResults();
  }
});

function showResults() {
  const score = answers.reduce((acc, a, i) => acc + (a === quizData[i].correct ? 1 : 0), 0);
  const pct = Math.round((score / quizData.length) * 100);
  document.getElementById('resultScore').textContent = `${score}/${quizData.length}`;

  let msg = '';
  if (pct === 100) msg = 'Perfect score! You\'re a RAG expert! 🎉';
  else if (pct >= 70) msg = 'Great job! You have solid RAG knowledge. Keep learning!';
  else if (pct >= 50) msg = 'Good start! Review the sections above to strengthen your understanding.';
  else msg = 'Keep learning! Go through each section and try again.';

  document.getElementById('resultMessage').textContent = msg;
  quizQuestion.style.display = 'none';
  quizOptions.style.display = 'none';
  quizFeedback.style.display = 'none';
  document.querySelector('.quiz-nav').style.display = 'none';
  document.querySelector('.quiz-progress').style.display = 'none';
  quizResult.style.display = 'block';
}

document.getElementById('quizRestart').addEventListener('click', () => {
  currentQ = 0;
  answers = new Array(quizData.length).fill(null);
  submitted = new Array(quizData.length).fill(false);
  quizQuestion.style.display = '';
  quizOptions.style.display = '';
  quizFeedback.style.display = '';
  document.querySelector('.quiz-nav').style.display = '';
  document.querySelector('.quiz-progress').style.display = '';
  quizResult.style.display = 'none';
  renderQuiz();
});

renderQuiz();
