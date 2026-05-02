const natural = require("natural");
const { removeStopwords } = require("stopword");
const puppeteer = require("puppeteer");

// ─── NLP SETUP ───────────────────────────────────────────────────────────────
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// ─── SKILL TAXONOMY ──────────────────────────────────────────────────────────
const SKILL_TAXONOMY = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
  "ruby", "php", "swift", "kotlin", "scala", "dart",
  "react", "angular", "vue", "nextjs", "nuxt", "svelte", "redux", "graphql",
  "html", "css", "sass", "tailwind", "webpack", "vite",
  "nodejs", "express", "nestjs", "django", "flask", "fastapi", "spring",
  "laravel", "rails", "rest", "restful", "api", "microservices", "grpc", "websocket",
  "mongodb", "mysql", "postgresql", "sqlite", "redis", "cassandra",
  "dynamodb", "elasticsearch", "firebase", "sql", "nosql", "prisma", "mongoose",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
  "jenkins", "nginx", "linux", "cicd ","ci cd" ,"devops", "git", "github", "gitlab",
  "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
  "scikit-learn", "nlp", "computer vision", "llm", "langchain", "openai",
  "react native", "flutter", "android", "ios",
  "jest", "mocha", "cypress", "selenium", "pytest", "testing", "tdd",
  "agile", "scrum", "design patterns", "data structures", "algorithms",
  "system design", "oop", "functional programming", "mvc", "solid",
  "oauth", "jwt", "authentication", "authorization", "security",
  "caching", "kafka", "rabbitmq", "performance", "blockchain", "web3",
  "pandas", "numpy", "matplotlib", "seaborn", "plotly", "jupyter",
  "r", "xgboost", "lightgbm", "statsmodels", "tableau", "power bi", "looker", "dbt","llamaindex", "hugging face", "transformers", "rag", "prompt engineering",
  "vector databases", "pinecone", "weaviate", "chromadb", "fine-tuning", "anthropic", "ollama",
  "spark", "hadoop", "airflow", "snowflake", "databricks",
];
const JOB_TITLE_TAXONOMY = [

  // ── Software Engineering ──────────────────────────────────────────────────
  "Full Stack Developer","Full Stack Engineer","Backend Developer","Backend Engineer",
  "Frontend Developer","Frontend Engineer","Software Engineer","Software Developer",
  "Junior Software Engineer","Senior Software Engineer","Staff Software Engineer",
  "Principal Software Engineer","Associate Software Engineer",

  // ── Specialised Engineering ────────────────────────────────────────────────
  "MERN Stack Developer","MEAN Stack Developer","Node.js Developer","React Developer",
  "Angular Developer","Vue.js Developer","Python Developer","Java Developer",
  "Go Developer","Golang Developer","Rust Developer","iOS Developer","Android Developer",
  "Mobile Developer","Flutter Developer","React Native Developer","Embedded Systems Engineer",
  "Firmware Engineer","Game Developer","Blockchain Developer","Web3 Developer",
  "Smart Contract Developer","API Developer",

  // ── Data Science & Analytics ──────────────────────────────────────────────
  "Data Scientist","Junior Data Scientist","Senior Data Scientist","Lead Data Scientist",
  "Data Analyst","Junior Data Analyst","Senior Data Analyst","Business Analyst",
  "Business Intelligence Analyst","BI Developer","BI Engineer","Analytics Engineer",
  "Quantitative Analyst","Research Scientist","Applied Scientist","Decision Scientist",
  "Marketing Analyst","Product Analyst","Growth Analyst","Financial Analyst",

  // ── AI / ML Engineering ───────────────────────────────────────────────────
  "AI Engineer","ML Engineer","Machine Learning Engineer","Deep Learning Engineer",
  "NLP Engineer","Computer Vision Engineer","AI Research Engineer","Applied ML Engineer",
  "Generative AI Engineer","LLM Engineer","AI/ML Engineer","Conversational AI Engineer",

  // ── Data Engineering ──────────────────────────────────────────────────────
  "Data Engineer","Senior Data Engineer","Big Data Engineer","ETL Developer",
  "Analytics Engineer","Data Platform Engineer","Data Infrastructure Engineer","Data Architect",

  // ── DevOps / Cloud / Platform ─────────────────────────────────────────────
  "DevOps Engineer","Senior DevOps Engineer","Platform Engineer","Site Reliability Engineer",
  "SRE","Cloud Engineer","Cloud Architect","Infrastructure Engineer","AWS Engineer",
  "Azure Engineer","GCP Engineer","MLOps Engineer","DataOps Engineer","Build and Release Engineer",

  // ── Security ──────────────────────────────────────────────────────────────
  "Security Engineer","Application Security Engineer","Cybersecurity Engineer","Penetration Tester",
  "Security Analyst",

  // ── Architecture & Leadership ─────────────────────────────────────────────
  "Solutions Architect","Enterprise Architect","Technical Architect",
  "Engineering Manager","Engineering Lead","Tech Lead","Technical Lead",
  
  // ── QA & Testing ─────────────────────────────────────────────────────────
  "QA Engineer","SDET","Automation Engineer","Test Engineer","Quality Assurance Engineer",

  // ── Product & Design (common in JDs) ─────────────────────────────────────
  "Product Manager","Technical Product Manager","UX Engineer","UI Developer","UI/UX Developer",

  // ── Internships & Entry Level ─────────────────────────────────────────────
  "Software Engineering Intern","Data Science Intern","ML Intern","Frontend Intern","Backend Intern",
];

// ─── TECHNICAL QUESTION BANK ─────────────────────────────────────────────────
const TECHNICAL_QUESTION_BANK = {
  react: {
    question: "Can you explain the React component lifecycle and how hooks like useEffect and useState replace class lifecycle methods?",
    intention: "To assess understanding of React's core rendering model and modern hooks-based patterns.",
    answer: "React's class lifecycle methods (componentDidMount, componentDidUpdate, componentWillUnmount) are replaced by useEffect in functional components. useState manages local state while useEffect handles side effects. useEffect with an empty dependency array runs once on mount, with dependencies it runs on updates, and the cleanup function runs on unmount. This simplifies component logic and enables custom hooks for reusable stateful logic."
  },
  nodejs: {
    question: "Explain the Node.js event loop and how it handles asynchronous operations without blocking the main thread.",
    intention: "To evaluate understanding of Node.js's non-blocking I/O model, which is fundamental for backend performance.",
    answer: "Node.js uses a single-threaded event loop backed by libuv. Async operations (I/O, timers, network) are offloaded to the OS or a thread pool. When complete, their callbacks are queued in phases: timers → pending callbacks → poll → check → close callbacks. This allows Node.js to handle thousands of concurrent connections efficiently without spawning threads for each request."
  },
  mongodb: {
    question: "How do you design MongoDB schemas for a relational-like use case? When would you embed documents vs. use references?",
    intention: "To assess understanding of NoSQL data modeling, denormalization trade-offs, and query performance.",
    answer: "Embed documents when data is accessed together frequently and has a one-to-few relationship. Use references when data is large, shared across many documents, or updated independently. For example, embed user addresses in a user document, but reference orders to a separate collection. Always model around your access patterns, not around relations."
  },
  sql: {
    question: "Explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN with a practical example.",
    intention: "To test relational database fundamentals and ability to query complex data relationships.",
    answer: "INNER JOIN returns rows where there is a match in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right (NULL if no match). RIGHT JOIN is the reverse. Example: SELECT users.name, orders.total FROM users LEFT JOIN orders ON users.id = orders.user_id — this returns all users even those with no orders (their total will be NULL)."
  },
  postgresql: {
    question: "What are the advantages of PostgreSQL over MySQL, and when would you choose one over the other?",
    intention: "To assess depth of relational database knowledge and ability to make informed architectural decisions.",
    answer: "PostgreSQL is ACID-compliant with stronger standards conformance, better support for complex queries, JSONB for hybrid NoSQL use, window functions, CTEs, and full-text search. MySQL is faster for simple read-heavy workloads and has wider hosting support. Choose PostgreSQL for complex data relationships or when you need advanced query features; MySQL for simple, high-throughput read workloads."
  },
  python: {
    question: "What are Python decorators and how would you use them in a real-world backend application?",
    intention: "To evaluate understanding of Python's metaprogramming capabilities and common patterns like auth guards and logging.",
    answer: "Decorators are functions that wrap other functions to extend behavior without modifying them. In backend apps, they are used for authentication (@login_required), caching, rate limiting, and logging. They work by taking a function as input and returning a modified function. The @functools.wraps decorator preserves the original function's metadata."
  },
  docker: {
    question: "Walk me through how you would containerize a Node.js application using Docker and orchestrate it with Docker Compose.",
    intention: "To assess DevOps knowledge and understanding of containerization for consistent deployment environments.",
    answer: "Create a Dockerfile: use node:alpine as base, set WORKDIR, copy package.json, run npm install, copy source, expose port, set CMD. Use .dockerignore to exclude node_modules. Docker Compose defines services (app + MongoDB + Redis), networks, volumes, and environment variables. For production, use multi-stage builds to keep the image size minimal."
  },
  kubernetes: {
    question: "Explain the core concepts of Kubernetes: Pods, Deployments, and Services, and how they work together.",
    intention: "To assess understanding of container orchestration for production-grade deployments.",
    answer: "A Pod is the smallest deployable unit, wrapping one or more containers. A Deployment manages a set of identical Pods, handling rolling updates and rollbacks. A Service exposes Pods as a stable network endpoint, load-balancing traffic across them. Together: a Deployment ensures N replicas of your app are always running, and a Service routes external traffic to whichever Pod is healthy."
  },
  aws: {
    question: "Explain the difference between AWS EC2, ECS, and Lambda. When would you choose each?",
    intention: "To evaluate cloud architecture decision-making and understanding of compute service trade-offs.",
    answer: "EC2 gives full VM control — best for long-running stateful apps needing custom configs. ECS manages Docker containers on Fargate — best for microservices needing consistent environments. Lambda is serverless — best for event-driven, short-lived functions with unpredictable traffic. Choose Lambda for APIs with variable load, ECS for containerized services, EC2 when you need full OS control."
  },
  typescript: {
    question: "How does TypeScript's type system help prevent bugs at scale? Explain generics with a practical example.",
    intention: "To assess depth of TypeScript knowledge beyond basic type annotations.",
    answer: "TypeScript catches type mismatches at compile time, eliminating entire classes of runtime bugs. Generics allow writing reusable, type-safe code. Example: function getFirst<T>(arr: T[]): T { return arr[0]; } — this works for any array type while preserving type information. Combined with interfaces and union types, TypeScript makes large codebases significantly more maintainable."
  },
  graphql: {
    question: "What are the advantages of GraphQL over REST, and what problems can it introduce at scale?",
    intention: "To assess ability to evaluate architectural trade-offs between API design approaches.",
    answer: "GraphQL allows clients to request exactly the data they need, eliminating over-fetching and under-fetching. A single endpoint replaces many REST routes. However it introduces complexity: N+1 query problems (solved with DataLoader), caching is harder than REST, and schema design requires more upfront thinking. Best suited for complex clients with varied data needs."
  },
  redis: {
    question: "How would you use Redis as a caching layer in a Node.js application? What caching strategies would you apply?",
    intention: "To evaluate understanding of performance optimization using in-memory caching.",
    answer: "Use the ioredis client in Node.js. On each request, first check Redis for the key — if found return it, else query the database, store the result in Redis with a TTL, then return it. Common strategies: Cache-aside (lazy loading), Write-through (write to cache and DB together), and Cache-busting (invalidate on data change). Use TTL carefully to avoid stale data."
  },
  jwt: {
    question: "Explain how JWT authentication works end-to-end and what security considerations you would keep in mind.",
    intention: "To assess knowledge of stateless authentication patterns and common security vulnerabilities.",
    answer: "On login, the server signs a JWT with a secret key containing user claims (id, role). The client stores it (preferably in an HttpOnly cookie) and sends it with each request. The server verifies the signature without hitting the database. Security: use short expiry + refresh tokens, never store sensitive data in the payload (it is base64 decoded, not encrypted), use HTTPS, implement token blacklisting for logout, and validate the algorithm header to prevent alg:none attacks."
  },
  oauth: {
    question: "Explain the OAuth 2.0 Authorization Code flow and how it differs from the Client Credentials flow.",
    intention: "To assess understanding of modern authorization standards and when to apply each flow.",
    answer: "Authorization Code flow is for user-facing apps: the user logs in via the provider, receives an auth code, which the backend exchanges for an access token. This keeps tokens off the browser. Client Credentials flow is for machine-to-machine: the client sends its client_id and secret directly to get a token — no user involved. Use PKCE with Authorization Code for SPAs and mobile apps to prevent code interception attacks."
  },
  system_design: {
    question: "How would you design a scalable URL shortener like bit.ly? Walk me through the architecture.",
    intention: "To evaluate system design thinking, ability to handle scale, and understanding of distributed systems trade-offs.",
    answer: "Core components: API servers, a base62 encoder to generate short codes, a database (SQL for reliability or Cassandra for scale) storing short-to-long mappings, and Redis for caching hot URLs. For scale: add a load balancer, use a distributed ID generator (Snowflake), CDN for redirect speed, and rate limiting to prevent abuse. The redirect endpoint (301 vs 302) matters — 301 caches at browser level reducing load but losing analytics; 302 keeps every redirect hitting your server."
  },
  agile: {
    question: "How do you manage technical debt while delivering features consistently in an agile environment?",
    intention: "To assess maturity in balancing business velocity with long-term code quality.",
    answer: "Allocate 20% of each sprint to refactoring and tech debt. Make debt visible by logging it in the backlog with business impact estimates. Use the boy scout rule — always leave code cleaner than you found it. Introduce architectural improvements incrementally using the Strangler Fig pattern for legacy systems. Communicate trade-offs to stakeholders clearly: short-term speed vs long-term maintenance cost."
  },
  pandas: {
    question: "How would you use Pandas to clean a messy real-world dataset with missing values, duplicates, and inconsistent types before feeding it into a model?",
    intention: "To assess practical data wrangling ability, which is 80% of real data science work.",
    answer: "Use df.info() and df.describe() to understand the data first. Handle nulls with dropna() or fillna() based on context — median for numeric, mode for categoricals. Remove duplicates with drop_duplicates(). Fix types with astype() or pd.to_datetime(). Use str.strip() and str.lower() for string normalization. Chain transformations with method chaining for readability. Always validate the cleaned output shape and null count before proceeding."
  },

  rag: {
    question: "Explain how Retrieval-Augmented Generation (RAG) works and how you would implement a basic RAG pipeline.",
    intention: "To assess practical understanding of LLM application architecture and the ability to ground AI outputs in real data.",
    answer: "RAG combines a retrieval system with an LLM. Documents are chunked, embedded using a model like text-embedding-ada-002, and stored in a vector database (Pinecone, Weaviate, or ChromaDB). At query time, the user's question is embedded, semantically similar chunks are retrieved, and these are injected into the LLM prompt as context. This grounds the LLM's answer in actual data, reducing hallucinations. Key tuning points: chunk size, overlap, top-k retrieval count, and the prompt template that instructs the model to use only the provided context."
  },

  spark: {
    question: "When would you choose Apache Spark over Pandas, and how does Spark handle distributed data processing?",
    intention: "To assess big data engineering knowledge and understanding of when to scale beyond single-machine tools.",
    answer: "Use Spark when data exceeds available RAM (typically 10GB+) or when processing speed matters at scale. Spark distributes data into partitions across a cluster. Operations are lazy — they build a DAG of transformations and only execute on an action like collect() or write(). Use DataFrames over RDDs for performance (Catalyst optimizer). Key concepts: transformations (map, filter, groupBy) vs actions (count, show, write). PySpark lets you use a Pandas-like API. For ML at scale, use Spark MLlib."
  },

  power_bi: {
    question: "How would you design a Power BI dashboard for business stakeholders? Walk through your data modeling and visualization choices.",
    intention: "To assess data analytics communication skills and understanding of BI tool best practices.",
    answer: "Start with the star schema in Power BI's data model: fact tables (sales, transactions) connected to dimension tables (date, product, region). Use DAX measures for KPIs rather than calculated columns to preserve query performance. Design for the audience: executives want high-level KPIs with drill-through, analysts need filters and slicers. Use consistent colors, avoid pie charts for more than 3 segments, and always include a date slicer. Publish to Power BI Service with row-level security if data is sensitive."
  },
  default: {
    question: "Describe a technically challenging problem you solved recently. What was your approach and what did you learn?",
    intention: "To assess problem-solving ability, depth of technical thinking, and self-awareness.",
    answer: "Structure your answer using STAR: Situation (context of the problem), Task (what you needed to achieve), Action (specific technical steps you took — be detailed here), Result (measurable outcome). Focus on your decision-making process, trade-offs you considered, and what you would do differently with hindsight."
  }
};

// ─── BEHAVIORAL QUESTION BANK ─────────────────────────────────────────────────
const BEHAVIORAL_QUESTION_BANK = [
  {
    question: "Tell me about a time you had to learn a new technology quickly under a tight deadline. How did you approach it?",
    intention: "To assess adaptability, learning agility, and ability to perform under pressure.",
    answer: "Use the STAR method. Highlight: how you broke down the learning into manageable chunks, what resources you used (docs, tutorials, colleagues), how you built a minimal proof-of-concept first, and how you managed stakeholder expectations around the timeline. Emphasize what the outcome was and what you would do differently."
  },
  {
    question: "Describe a situation where you disagreed with a technical decision made by your team or manager. What did you do?",
    intention: "To evaluate communication skills, professional maturity, and ability to advocate for technical quality diplomatically.",
    answer: "Show that you raised the concern constructively — with data and alternatives, not just objections. Explain how you presented your perspective (written proposal, prototype, benchmarks), how you listened to the other side's rationale, and how you ultimately committed to the team's decision even if it was not yours. Disagreeing and committing is a valued engineering trait."
  },
  {
    question: "Tell me about a time you had to work with a difficult teammate or stakeholder. How did you handle it?",
    intention: "To assess emotional intelligence, conflict resolution skills, and ability to maintain productive working relationships.",
    answer: "Focus on the actions you took, not on criticizing the other person. Describe how you sought to understand their perspective, how you communicated your own needs clearly, and what specific steps you took to find common ground. Emphasize the professional outcome and what you learned about working with different personalities."
  },
  {
    question: "Give an example of a project where you took ownership beyond your assigned responsibilities. What drove you to do that?",
    intention: "To assess initiative, ownership mindset, and intrinsic motivation beyond just completing tasks.",
    answer: "Describe a specific instance where you noticed a gap — a missing test suite, a performance issue, an unclear process — and took it upon yourself to address it. Explain your motivation (quality, team efficiency, user impact), what you actually did, and the measurable outcome. Show that you think in terms of outcomes, not just outputs."
  },
  {
    question: "Describe how you prioritize tasks when you have multiple deadlines competing for your attention.",
    intention: "To evaluate time management, prioritization frameworks, and communication around capacity.",
    answer: "Explain your prioritization framework — impact vs effort matrix, MoSCoW method, or aligning with business priorities. Show that you communicate proactively when timelines are at risk rather than going silent. Describe how you break large tasks into smaller deliverables to show progress, and how you negotiate scope when needed."
  },
  {
    question: "Tell me about a time you received critical feedback on your work. How did you respond?",
    intention: "To assess self-awareness, receptiveness to feedback, and ability to grow from criticism.",
    answer: "Choose an example where the feedback was genuinely difficult but valid. Show that you listened without becoming defensive, asked clarifying questions to fully understand the concern, and took concrete action to address it. Highlight the growth that resulted — a changed habit, an improved skill, or a better outcome on the next project."
  }
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s+#]/g, " ").replace(/\s+/g, " ").trim();
}

function extractTokens(text) {
  const normalized = normalizeText(text);
  const tokens = tokenizer.tokenize(normalized);
  return removeStopwords(tokens);
}

function extractSkills(text) {
  const normalizedText = normalizeText(text);
  const foundSkills = new Set();
  // Special case: CI/CD appears in many formats
  if (/\bci[\s/\-]?cd\b/i.test(normalizedText)) foundSkills.add("cicd");
  if (/\bnext\.?js\b/i.test(normalizedText)) foundSkills.add("nextjs");
  for (const skill of SKILL_TAXONOMY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(normalizedText)) {
      foundSkills.add(skill);
    }
  }
  return foundSkills;
}

function computeMatchScore(resumeText, selfDescription, jobDescription) {
  const candidateText = `${resumeText} ${selfDescription}`;

  // TF-IDF cosine similarity
  const tfidf = new TfIdf();
  tfidf.addDocument(extractTokens(candidateText).join(" "));
  tfidf.addDocument(extractTokens(jobDescription).join(" "));

  const candidateVector = {};
  const jdVector = {};
  tfidf.listTerms(0).forEach(({ term, tfidf: score }) => { candidateVector[term] = score; });
  tfidf.listTerms(1).forEach(({ term, tfidf: score }) => { jdVector[term] = score; });

  const allTerms = new Set([...Object.keys(candidateVector), ...Object.keys(jdVector)]);
  let dotProduct = 0, magA = 0, magB = 0;
  for (const term of allTerms) {
    const a = candidateVector[term] || 0;
    const b = jdVector[term] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }
  const cosineSimilarity = (magA && magB) ? dotProduct / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;

  // Skill overlap ratio
  const candidateSkills = extractSkills(candidateText);
  const jdSkills = extractSkills(jobDescription);
  const matchedSkills = [...candidateSkills].filter(s => jdSkills.has(s));
  const skillOverlapRatio = jdSkills.size > 0 ? matchedSkills.length / jdSkills.size : 0;

  // Weighted score: 60% TF-IDF cosine + 40% skill overlap, scaled to 0–100
  const rawScore = (cosineSimilarity * 0.6) + (skillOverlapRatio * 0.4);
  const scaled = Math.round(Math.min(100, Math.max(10, rawScore * 120 + (skillOverlapRatio * 30))));
  return scaled;
}

function identifySkillGaps(resumeText, selfDescription, jobDescription) {
  const candidateText = `${resumeText} ${selfDescription}`;
  const candidateSkills = extractSkills(candidateText);
  const jdSkills = extractSkills(jobDescription);
  const gaps = [];

  for (const skill of jdSkills) {
    if (!candidateSkills.has(skill)) {
      const jdNormalized = normalizeText(jobDescription);
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      const occurrences = (jdNormalized.match(regex) || []).length;
      let severity = "low";
      if (occurrences >= 3) severity = "high";
      else if (occurrences === 2) severity = "medium";
      gaps.push({ skill: skill.charAt(0).toUpperCase() + skill.slice(1), severity });
    }
  }

  const severityOrder = { high: 0, medium: 1, low: 2 };
  gaps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return gaps.slice(0, 6);
}

function selectTechnicalQuestions(resumeText, selfDescription, jobDescription) {
  const candidateText = `${resumeText} ${selfDescription}`;
  const jdSkills = extractSkills(jobDescription);
  const candidateSkills = extractSkills(candidateText);
  const selected = [];
  const usedSkills = new Set();

  // Priority 1: Skills in JD that candidate also has (validate claimed skills)
  for (const skill of jdSkills) {
    if (candidateSkills.has(skill) && TECHNICAL_QUESTION_BANK[skill] && !usedSkills.has(skill)) {
      selected.push(TECHNICAL_QUESTION_BANK[skill]);
      usedSkills.add(skill);
      if (selected.length >= 5) break;
    }
  }

  // Priority 2: Skills in JD that candidate lacks (probe the gaps)
  if (selected.length < 5) {
    for (const skill of jdSkills) {
      if (!candidateSkills.has(skill) && TECHNICAL_QUESTION_BANK[skill] && !usedSkills.has(skill)) {
        selected.push(TECHNICAL_QUESTION_BANK[skill]);
        usedSkills.add(skill);
        if (selected.length >= 5) break;
      }
    }
  }

  // Priority 3: System design if JD mentions scale/architecture
  if (selected.length < 5) {
    const jdLower = jobDescription.toLowerCase();
    if (jdLower.includes("scale") || jdLower.includes("architect") || jdLower.includes("design")) {
      if (!usedSkills.has("system_design")) {
        selected.push(TECHNICAL_QUESTION_BANK["system_design"]);
        usedSkills.add("system_design");
      }
    }
  }

  // Priority 4: Fill remaining slots with other bank questions
  const fillerKeys = ["system_design", "agile", "default"];
  for (const key of fillerKeys) {
    if (selected.length >= 5) break;
    if (!usedSkills.has(key) && TECHNICAL_QUESTION_BANK[key]) {
      selected.push(TECHNICAL_QUESTION_BANK[key]);
      usedSkills.add(key);
    }
  }

  return selected.slice(0, 5);
}

function selectBehavioralQuestions() {
  const shuffled = [...BEHAVIORAL_QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

function buildPreparationPlan(skillGaps, resumeText, selfDescription, jobDescription) {
  const plan = [];
  const jdSkills = [...extractSkills(jobDescription)];
  const candidateSkills = extractSkills(`${resumeText} ${selfDescription}`);

  const focusSkills = [
    ...skillGaps.map(g => g.skill.toLowerCase()),
    ...jdSkills.filter(s => candidateSkills.has(s)).slice(0, 2)
  ].slice(0, 4);

  const fallbackTopics = ["System Design & Architecture", "DSA Practice", "Behavioral Interview Preparation", "Code Review & Best Practices"];
  while (focusSkills.length < 2) {
    focusSkills.push(fallbackTopics[focusSkills.length]);
  }

  const taskTemplates = {
    sql: [
      "Review core SQL commands: SELECT, JOIN, GROUP BY, subqueries, and window functions.",
      "Practice writing complex queries on a sample relational database.",
      "Study indexing strategies, query optimization, and EXPLAIN plans.",
      "Understand transactions, ACID properties, and isolation levels."
    ],
    postgresql: [
      "Set up a local PostgreSQL instance and practice schema design.",
      "Learn PostgreSQL-specific features: JSONB, CTEs, and window functions.",
      "Study connection pooling with pg-pool for Node.js backends.",
      "Practice optimizing slow queries using EXPLAIN ANALYZE."
    ],
    mysql: [
      "Review MySQL data types and storage engines (InnoDB vs MyISAM).",
      "Practice designing normalized schemas and writing complex joins.",
      "Study MySQL replication and basic high-availability setups.",
      "Learn query profiling and index optimization techniques."
    ],
    oauth: [
      "Study OAuth 2.0 flows: Authorization Code, Client Credentials, and PKCE.",
      "Understand the difference between OAuth (authorization) and OIDC (authentication).",
      "Implement a simple OAuth flow with a provider like GitHub or Google.",
      "Review common OAuth vulnerabilities and how to mitigate them."
    ],
    jwt: [
      "Review JWT structure: header, payload, and signature.",
      "Implement an access token and refresh token rotation pattern.",
      "Study common JWT vulnerabilities: alg:none attack, secret brute-force.",
      "Practice revoking JWTs using a token blacklist or short expiry strategy."
    ],
    redis: [
      "Set up Redis locally and explore core data structures (string, hash, list, set, sorted set).",
      "Implement a cache-aside pattern in a sample Node.js project.",
      "Study TTL strategies and cache invalidation approaches.",
      "Explore Redis pub/sub for real-time messaging use cases."
    ],
    docker: [
      "Write a multi-stage Dockerfile for a Node.js application.",
      "Use Docker Compose to orchestrate app, database, and cache containers.",
      "Study Docker networking: bridge, host, and overlay networks.",
      "Practice building minimal production images using alpine base images."
    ],
    kubernetes: [
      "Understand core Kubernetes objects: Pod, Deployment, Service, ConfigMap, Secret.",
      "Deploy a simple application locally using minikube.",
      "Study horizontal pod autoscaling and resource limits/requests.",
      "Practice rolling updates and rollback strategies."
    ],
    aws: [
      "Review core AWS services: EC2, S3, RDS, Lambda, API Gateway, and IAM.",
      "Study VPC architecture: subnets, security groups, and route tables.",
      "Practice deploying a Node.js app using Elastic Beanstalk or ECS.",
      "Review IAM roles, policies, and least-privilege principles."
    ],
    graphql: [
      "Build a simple GraphQL API using Apollo Server.",
      "Study the N+1 problem and how to solve it with DataLoader.",
      "Understand schema design: types, queries, mutations, and subscriptions.",
      "Compare GraphQL vs REST trade-offs for different use cases."
    ],
    typescript: [
      "Review advanced TypeScript types: generics, conditional types, and mapped types.",
      "Practice converting a JavaScript module to strict TypeScript.",
      "Study utility types: Partial, Required, Pick, Omit, and Record.",
      "Learn how to configure tsconfig.json for different project needs."
    ],
    react: [
      "Review React hooks in depth: useCallback, useMemo, useRef, and useContext.",
      "Study component rendering optimization and React.memo.",
      "Practice state management patterns: Context API vs Redux vs Zustand.",
      "Build a small project using React Query for server state management."
    ],
    nodejs: [
      "Deep-dive into the Node.js event loop and async patterns.",
      "Study streams and Buffer for handling large data efficiently.",
      "Practice error handling patterns in async/await code.",
      "Review clustering and worker threads for CPU-bound tasks."
    ],
    mongodb: [
      "Practice designing schemas with both embedding and referencing strategies.",
      "Study aggregation pipeline stages: $match, $group, $lookup, $project.",
      "Learn indexing strategies for query performance in MongoDB.",
      "Practice using Mongoose with validation and middleware hooks."
    ],
    python: [
      "Review Python's async/await with asyncio for concurrent code.",
      "Study decorators, context managers, and generators in depth.",
      "Practice building a REST API with FastAPI or Django REST Framework.",
      "Review Python testing patterns with pytest and mocking."
    ],
    security: [
      "Study OWASP Top 10 vulnerabilities and their mitigations.",
      "Review input validation and sanitization best practices.",
      "Practice implementing rate limiting and brute-force protection.",
      "Study HTTPS, HSTS, CORS, and secure cookie configuration."
    ],
    rag: [
      "Study the RAG architecture: chunking, embedding, vector retrieval, and prompt injection.",
      "Build a basic RAG pipeline using LangChain or LlamaIndex with a local PDF as the knowledge base.",
      "Experiment with chunk sizes (256, 512, 1024 tokens) and measure retrieval quality.",
      "Learn about advanced RAG patterns: HyDE, re-ranking, and hybrid search."
    ],
    pandas: [
      "Practice the full data cleaning workflow: nulls, duplicates, type casting, and string normalization.",
      "Study groupby, pivot_table, and merge/join operations with real datasets from Kaggle.",
      "Learn method chaining and vectorized operations to avoid slow Python loops.",
      "Practice reading from and writing to CSV, Excel, JSON, and SQL sources."
    ],
    spark: [
      "Set up PySpark locally and process a 1M+ row CSV using DataFrames.",
      "Understand lazy evaluation, the DAG, and when Spark actually executes.",
      "Study partitioning strategies and how to avoid data skew.",
      "Practice writing Spark jobs that read from S3 and write to Parquet format."
    ],
    power_bi: [
      "Build a star schema data model connecting fact and dimension tables.",
      "Write 5 core DAX measures: total sales, YoY growth, running total, rank, and moving average.",
      "Design a 3-page dashboard: executive summary, regional breakdown, and trend analysis.",
      "Publish to Power BI Service and configure row-level security."
    ],
    default_prep: [
      "Review fundamentals and core concepts listed in the job description.",
      "Practice 5-10 coding challenges on LeetCode or HackerRank (easy/medium level).",
      "Study system design concepts: load balancing, caching, and database scaling.",
      "Prepare 3-5 STAR stories covering impact, ownership, and technical depth."
    ]
  };

  for (let i = 0; i < focusSkills.length; i++) {
    const skillKey = focusSkills[i].toLowerCase().replace(/[\s/&]/g, "_").replace(/__+/g, "_");
    const tasks = taskTemplates[skillKey] || taskTemplates["default_prep"];
    const focusLabel = focusSkills[i].charAt(0).toUpperCase() + focusSkills[i].slice(1);
    plan.push({ day: i + 1, focus: focusLabel, tasks });
  }

  // Always end with a mock interview day
  plan.push({
    day: plan.length + 1,
    focus: "Mock Interview & Final Review",
    tasks: [
      "Do a timed mock technical interview covering all topics studied this week.",
      "Practice your STAR behavioral answers out loud with a timer.",
      "Do a final review pass on all skill gap areas at a high level.",
      "Prepare 2-3 thoughtful questions to ask your interviewer about the role and team."
    ]
  });

  return plan;
}

function extractJobTitle(jobDescription) {
  const lines = jobDescription.split("\n").map(l => l.trim()).filter(Boolean);

  // Build one regex per title, sorted longest-first so "Machine Learning Engineer"
  // wins over "Engineer" on the same line
  const sortedTitles = [...JOB_TITLE_TAXONOMY].sort((a, b) => b.length - a.length);

  const titleRegex = (title) => {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i");
  };

  // ── Priority 1: structured label lines (e.g. "Role: Senior Data Scientist") ─
  const labelPattern = /^(position|role|title|job title|designation|opening|vacancy)[:\s\-–]+(.+)/i;
  for (const line of lines.slice(0, 10)) {
    const labelMatch = line.match(labelPattern);
    if (labelMatch) {
      const candidate = labelMatch[2].trim();
      // Check if any known title lives inside this label value
      for (const title of sortedTitles) {
        if (titleRegex(title).test(candidate)) return title;
      }
      // No taxonomy match — return the raw label value if it's short enough
      if (candidate.length < 70) return candidate;
    }
  }

  // ── Priority 2: short standalone lines (likely a heading / job title line) ──
  for (const line of lines.slice(0, 8)) {
    if (line.length > 60) continue; // too long to be a clean title line
    for (const title of sortedTitles) {
      if (titleRegex(title).test(line)) return title;
    }
  }

  // ── Priority 3: full-text scan (unstructured JDs) ─────────────────────────
  for (const title of sortedTitles) {
    if (titleRegex(title).test(jobDescription)) return title;
  }

  // ── Priority 4: intent phrases ("We are looking for a…") ──────────────────
  const intentMatch = jobDescription.match(
    /(?:looking for|hiring|seeking|need|require)[sa]?\s+(?:a|an)?\s+([A-Z][a-zA-Z\s\/]{3,50}?)(?:\s+to\b|\s+who\b|\.|\n|,)/i
  );
  if (intentMatch) {
    const raw = intentMatch[1].trim();
    for (const title of sortedTitles) {
      if (titleRegex(title).test(raw)) return title;
    }
    if (raw.length < 60) return raw;
  }

  return "Software Engineer"; // safe fallback
}

// ─── MAIN EXPORTED FUNCTIONS ──────────────────────────────────────────────────

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const matchScore = computeMatchScore(resume, selfDescription, jobDescription);
  const skillGaps = identifySkillGaps(resume, selfDescription, jobDescription);
  const technicalQuestions = selectTechnicalQuestions(resume, selfDescription, jobDescription);
  const behavioralQuestions = selectBehavioralQuestions();
  const preparationPlan = buildPreparationPlan(skillGaps, resume, selfDescription, jobDescription);
  const title = extractJobTitle(jobDescription);

  return { matchScore, skillGaps, technicalQuestions, behavioralQuestions, preparationPlan, title };
}

// ─── RESUME PDF FUNCTIONS ─────────────────────────────────────────────────────

function parseResumeIntoSections(resumeText) {
  const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);

  const sections = {
    name: "", email: "", phone: "", linkedin: "", github: "",
    summary: [], experience: [], education: [], skills: [], projects: [], certifications: []
  };

  const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) sections.email = emailMatch[0];

  const phoneMatch = resumeText.match(/(\+?\d[\d\s\-().]{7,15}\d)/);
  if (phoneMatch) sections.phone = phoneMatch[0].trim();

  const linkedinMatch = resumeText.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) sections.linkedin = "https://" + linkedinMatch[0];

  const githubMatch = resumeText.match(/github\.com\/[\w-]+/i);
  if (githubMatch) sections.github = "https://" + githubMatch[0];

  for (const line of lines.slice(0, 5)) {
    if (!line.match(/@|http|\.com|linkedin|github|\d{5,}/i) && line.length > 2 && line.length < 60) {
      sections.name = line;
      break;
    }
  }

  const sectionHeaders = {
    summary: /^(summary|profile|about|objective|overview)/i,
    experience: /^(experience|work experience|employment|work history|professional experience)/i,
    education: /^(education|academic|qualifications|degrees)/i,
    skills: /^(skills|technical skills|technologies|competencies|tools)/i,
    projects: /^(projects|personal projects|key projects|portfolio)/i,
    certifications: /^(certifications|certificates|courses|training|achievements)/i,
  };

  let currentSection = null;
  let buffer = [];

  for (const line of lines) {
    let matched = false;
    for (const [section, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line) && line.length < 50) {
        if (currentSection && buffer.length > 0) {
          sections[currentSection] = [...sections[currentSection], ...buffer];
        }
        currentSection = section;
        buffer = [];
        matched = true;
        break;
      }
    }
    if (!matched && currentSection) buffer.push(line);
  }
  if (currentSection && buffer.length > 0) {
    sections[currentSection] = [...sections[currentSection], ...buffer];
  }

  return sections;
}

function buildResumeHtml(sections, selfDescription, jobDescription) {
  const jdSkills = [...extractSkills(jobDescription)];
  const displaySkills = sections.skills.length > 0
    ? sections.skills.slice(0, 20)
    : jdSkills.slice(0, 12).map(s => s.charAt(0).toUpperCase() + s.slice(1));

  const summaryText = sections.summary.length > 0
    ? sections.summary.slice(0, 3).join(" ")
    : selfDescription.slice(0, 300);

  const experienceHtml = sections.experience.length > 0
    ? sections.experience.slice(0, 14).map(line => {
        const isBullet = /^[-•*]/.test(line);
        return isBullet
          ? `<li>${line.replace(/^[-•*]\s*/, "")}</li>`
          : `</ul><div class="exp-title">${line}</div><ul>`;
      }).join("")
    : `<div class="exp-title">Professional Experience</div><ul><li>${selfDescription.slice(0, 250)}</li></ul>`;

  const educationHtml = sections.education.slice(0, 6).map(line => `<div class="edu-line">${line}</div>`).join("");

  const projectsHtml = sections.projects.length > 0
    ? sections.projects.slice(0, 10).map(line => {
        const isBullet = /^[-•*]/.test(line);
        return isBullet
          ? `<li>${line.replace(/^[-•*]\s*/, "")}</li>`
          : `</ul><div class="proj-title">${line}</div><ul>`;
      }).join("")
    : "";

  const certHtml = sections.certifications.slice(0, 5).map(line => `<li>${line}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; line-height: 1.55; }
  .page { max-width: 780px; margin: 0 auto; padding: 32px 40px; }
  .header { border-bottom: 3px solid #e63870; padding-bottom: 14px; margin-bottom: 18px; }
  .name { font-size: 26px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.5px; }
  .contact { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; font-size: 10px; color: #555; }
  .contact a { color: #e63870; text-decoration: none; }
  .section { margin-bottom: 16px; }
  .section-title {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.2px; color: #e63870;
    border-bottom: 1px solid #e6387025;
    padding-bottom: 4px; margin-bottom: 10px;
  }
  .summary p { color: #333; font-size: 11px; line-height: 1.65; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: #1a1a2e; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 500; }
  .exp-title { font-weight: 600; color: #1a1a2e; margin-top: 10px; margin-bottom: 4px; font-size: 11px; }
  ul { padding-left: 15px; }
  li { margin-bottom: 3px; color: #333; font-size: 11px; }
  .edu-line { margin-bottom: 5px; color: #333; }
  .proj-title { font-weight: 600; color: #1a1a2e; margin-top: 8px; margin-bottom: 3px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="name">${sections.name || "Candidate"}</div>
    <div class="contact">
      ${sections.email ? `<span>✉ ${sections.email}</span>` : ""}
      ${sections.phone ? `<span>📞 ${sections.phone}</span>` : ""}
      ${sections.linkedin ? `<span>🔗 <a href="${sections.linkedin}">LinkedIn</a></span>` : ""}
      ${sections.github ? `<span>💻 <a href="${sections.github}">GitHub</a></span>` : ""}
    </div>
  </div>

  ${summaryText ? `
  <div class="section summary">
    <div class="section-title">Professional Summary</div>
    <p>${summaryText}</p>
  </div>` : ""}

  ${displaySkills.length > 0 ? `
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">
      ${displaySkills.map(s => `<span class="skill-tag">${s}</span>`).join("")}
    </div>
  </div>` : ""}

  ${sections.experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Work Experience</div>
    <ul>${experienceHtml}</ul>
  </div>` : ""}

  ${sections.projects.length > 0 ? `
  <div class="section">
    <div class="section-title">Projects</div>
    <ul>${projectsHtml}</ul>
  </div>` : ""}

  <div class="two-col">
    ${sections.education.length > 0 ? `
    <div class="section">
      <div class="section-title">Education</div>
      ${educationHtml}
    </div>` : ""}

    ${certHtml ? `
    <div class="section">
      <div class="section-title">Certifications</div>
      <ul>${certHtml}</ul>
    </div>` : ""}
  </div>

</div>
</body>
</html>`;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
  });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const sections = parseResumeIntoSections(resume);
  const htmlContent = buildResumeHtml(sections, selfDescription, jobDescription);
  return await generatePdfFromHtml(htmlContent);
}

module.exports = { generateInterviewReport, generateResumePdf };