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
  "react native", "flutter", "android", "ios","data science","power bi",
  "jest", "mocha", "cypress", "selenium", "pytest", "testing", "tdd","transformers",
  "agile", "scrum", "design patterns", "data structures", "algorithms",
  "system design", "oop", "functional programming", "mvc", "solid","rag",
  "oauth", "jwt", "authentication", "authorization", "security", "prompt engineering",
  "caching", "kafka", "rabbitmq", "performance", "blockchain", "web3","ollama",
  "pandas", "numpy", "matplotlib", "seaborn", "plotly", "jupyter","dbt","llamaindex", 
  "r", "xgboost", "lightgbm", "statsmodels", "tableau", "power bi", "looker",  
  "vector databases", "pinecone", "weaviate", "chromadb", "fine-tuning", "anthropic",
  "spark", "hadoop", "airflow", "snowflake", "databricks","statistics",
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
  "system design": {
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

  "power bi": {
    question: "How would you design a Power BI dashboard for business stakeholders? Walk through your data modeling and visualization choices.",
    intention: "To assess data analytics communication skills and understanding of BI tool best practices.",
    answer: "Start with the star schema in Power BI's data model: fact tables (sales, transactions) connected to dimension tables (date, product, region). Use DAX measures for KPIs rather than calculated columns to preserve query performance. Design for the audience: executives want high-level KPIs with drill-through, analysts need filters and slicers. Use consistent colors, avoid pie charts for more than 3 segments, and always include a date slicer. Publish to Power BI Service with row-level security if data is sensitive."
  },
  // ── Data Science & Analytics ──────────────────────────────────────────────────

  "data science": {
    question: "Walk me through a complete machine learning project lifecycle — from problem definition to model deployment.",
    intention: "To assess whether the candidate understands the full DS workflow beyond just model training.",
    answer: "Start with problem framing: is it classification, regression, or clustering? Then EDA to understand distributions, correlations, and outliers. Feature engineering — encoding categoricals, scaling numerics, handling nulls. Split data into train/val/test sets (never touch test until final evaluation). Train multiple models, tune hyperparameters using cross-validation, and select based on the right metric (F1 for imbalanced classes, RMSE for regression). Evaluate on the holdout test set. Deploy via REST API (FastAPI or Flask), monitor for data drift, and retrain on a schedule."
  },

  "machine learning": {
    question: "Explain the bias-variance tradeoff and how you diagnose and fix underfitting vs overfitting in a model.",
    intention: "To assess core ML theory understanding and practical debugging ability.",
    answer: "Bias is error from wrong assumptions (underfitting — model too simple). Variance is error from sensitivity to training data (overfitting — model too complex). Diagnose using learning curves: high train error + high val error = underfitting (add complexity, better features); low train error + high val error = overfitting (regularization, dropout, more data, simpler model). Tools: L1/L2 regularization, early stopping, cross-validation, and ensemble methods like bagging reduce variance while boosting reduces bias."
  },

  "deep learning": {
    question: "Explain how backpropagation works and what problems like vanishing gradients affect deep networks.",
    intention: "To assess depth of neural network understanding beyond just using libraries.",
    answer: "Backpropagation computes gradients of the loss with respect to each weight using the chain rule, propagating error backwards from the output layer. In deep networks, repeated multiplication of small gradients causes the vanishing gradient problem — early layers learn nothing. Solutions: ReLU activations (no saturation for positive values), batch normalization (stabilizes activations), residual connections (skip connections in ResNets), and careful weight initialization (He or Xavier). Exploding gradients are handled with gradient clipping."
  },

  xgboost: {
    question: "Why does XGBoost outperform a standard Random Forest in most tabular data competitions, and what hyperparameters matter most?",
    intention: "To assess practical ML knowledge and ability to tune tree-based models effectively.",
    answer: "XGBoost uses gradient boosting — trees are built sequentially, each correcting the previous one's errors. Random Forest builds trees in parallel independently. Sequential correction makes XGBoost more accurate on structured/tabular data. Key hyperparameters: n_estimators (number of trees), learning_rate (shrinkage — lower is better with more trees), max_depth (controls overfitting — typically 3-6), subsample and colsample_bytree (row/column sampling — add regularization), and min_child_weight (prevents splits on small samples). Always use early stopping with a validation set to find the optimal n_estimators."
  },

  "feature engineering": {
    question: "What feature engineering techniques would you apply to a dataset with high-cardinality categorical variables and skewed numeric distributions?",
    intention: "To assess practical data preprocessing depth, which directly impacts model performance.",
    answer: "For high-cardinality categoricals: target encoding (replace category with mean of target — watch for leakage, use cross-val encoding), frequency encoding, or embedding layers in neural nets. Avoid one-hot encoding for 100+ categories. For skewed numerics: log transform or Box-Cox for right skew, winsorize extreme outliers instead of dropping them. For tree-based models, skew matters less — prioritize for linear models and neural nets. Always fit encoders and scalers on training data only, then transform validation/test to prevent leakage."
  },

  tableau: {
    question: "How would you design a Tableau dashboard to communicate sales performance to a non-technical executive audience?",
    intention: "To assess data storytelling ability and understanding of effective data visualization principles.",
    answer: "Start with a single KPI summary row: total revenue, MoM growth, target vs actual. Use a line chart for trend over time — it's the most intuitive for executives. Add a map for geographic breakdown and a bar chart for top 10 products/regions. Avoid tables with raw numbers — use conditional formatting if needed. Apply a consistent color palette: one accent color for highlights, gray for context. Use tooltips for detail, not labels on every point. Publish to Tableau Server with filters for region/date so executives can self-serve without asking for new reports."
  },

  // ── AI / LLM Engineering ─────────────────────────────────────────────────────

  llm: {
    question: "Explain the transformer architecture. What is the role of self-attention and why did it replace RNNs for NLP tasks?",
    intention: "To assess foundational AI knowledge required for working with modern LLMs and building on top of them.",
    answer: "Transformers process entire sequences in parallel using self-attention, which computes relationships between every token pair simultaneously. Each token attends to all others with learned weights (Query × Key / √d, softmax, then weighted sum of Values). This captures long-range dependencies that RNNs struggle with due to vanishing gradients over long sequences. Multi-head attention runs several attention mechanisms in parallel, each learning different relationship types. Positional encodings inject sequence order since the architecture has no inherent order. Transformers scale far better than RNNs — the foundation of GPT, BERT, and all modern LLMs."
  },

  "prompt engineering": {
    question: "What advanced prompting techniques do you know, and when would you use each in a production LLM application?",
    intention: "To assess practical LLM application engineering beyond basic API calls.",
    answer: "Chain-of-thought (CoT): add 'think step by step' for reasoning-heavy tasks — improves accuracy significantly on math and logic. Few-shot: include 2-5 input-output examples in the prompt to steer format and tone. Self-consistency: sample multiple CoT completions and majority-vote the answer — reduces hallucination for factual tasks. ReAct: interleave reasoning and tool-use steps for agent workflows. System prompt engineering: define persona, constraints, and output format explicitly. For production: always version your prompts, evaluate against a test set before deploying, and use structured output (JSON mode or tool calling) to make parsing reliable."
  },

  "hugging face": {
    question: "How would you use Hugging Face Transformers to fine-tune a pre-trained BERT model for a custom text classification task?",
    intention: "To assess ability to apply transfer learning practically using the most widely used ML library in industry.",
    answer: "Load the pre-trained model and tokenizer: AutoModelForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=N). Tokenize your dataset using the tokenizer with padding and truncation. Create a Trainer with TrainingArguments: set learning_rate (2e-5 to 5e-5), num_train_epochs (3-5), batch size, and evaluation strategy. Use compute_metrics to track F1/accuracy during training. Fine-tune only the classification head first if data is small, then unfreeze all layers. Push to Hub with model.push_to_hub() for versioning. For large models, use PEFT/LoRA to fine-tune efficiently without updating all parameters."
  },

  "fine-tuning": {
    question: "What is LoRA fine-tuning and when would you use it over full fine-tuning or prompt engineering alone?",
    intention: "To assess understanding of efficient LLM adaptation — a critical skill in modern AI engineering.",
    answer: "LoRA (Low-Rank Adaptation) freezes the original model weights and injects small trainable rank-decomposition matrices into attention layers. Instead of updating billions of parameters, you train only millions — reducing GPU memory by 10x+. Use LoRA when: you need task-specific behavior that prompting cannot achieve (custom tone, domain knowledge, output format), you have a labeled dataset of 500+ examples, and you cannot afford full fine-tuning compute. Prefer prompt engineering first — it requires no training. Use LoRA when prompting plateaus. Full fine-tuning only when you have abundant data and compute, or need to update the model's factual knowledge."
  },

  "vector databases": {
    question: "Explain how vector databases work and compare Pinecone, Weaviate, and ChromaDB for a production RAG system.",
    intention: "To assess practical knowledge of the retrieval layer in LLM application architecture.",
    answer: "Vector databases store high-dimensional embeddings and enable approximate nearest-neighbor (ANN) search using algorithms like HNSW or IVF. They are the retrieval backbone of RAG. Pinecone: fully managed, production-grade, easiest to scale — best for teams that want zero infra overhead, but costly at scale. Weaviate: open-source, supports hybrid search (vector + BM25 keyword), strong for multi-tenant apps. ChromaDB: open-source, zero setup, ideal for prototyping and local development — not production-grade for high concurrency. For production RAG: use Pinecone or Weaviate. Always benchmark retrieval quality (recall@k) and latency separately from the LLM layer."
  },

  airflow: {
    question: "How would you design and schedule a data pipeline using Apache Airflow for a daily ML feature engineering job?",
    intention: "To assess data engineering and MLOps ability to build reliable, observable production pipelines.",
    answer: "Define a DAG with a daily schedule_interval. Break the pipeline into tasks: extract (pull raw data from S3 or DB), transform (run Pandas or Spark feature engineering), validate (Great Expectations data quality checks), and load (write features to the feature store or data warehouse). Use the TaskFlow API (@task decorator) for clean Python tasks. Set retries=3 and retry_delay on each task. Use XComs only for small metadata, not large dataframes — store data in S3 between tasks. Monitor via Airflow UI and set email_on_failure alerts. Use Airflow connections/variables for credentials — never hardcode them."
  },

  snowflake: {
    question: "What makes Snowflake different from traditional data warehouses, and how would you optimize a slow Snowflake query?",
    intention: "To assess cloud data warehouse knowledge critical for data engineering and analytics roles.",
    answer: "Snowflake separates storage (S3) from compute (virtual warehouses), so you scale them independently and pay only for what you use. It auto-suspends idle warehouses. Unlike Redshift or BigQuery, Snowflake uses micro-partitioning — data is automatically clustered, eliminating manual index management. To optimize slow queries: check the Query Profile in the UI for bottlenecks (full table scans, data spills). Add clustering keys on frequently filtered columns. Use result caching (identical queries return instantly). Avoid SELECT * — project only needed columns. Use materialized views for expensive repeated aggregations. Right-size the warehouse — bigger isn't always faster for I/O-bound queries."
  },

  statistics: {
    question: "Explain p-values, confidence intervals, and Type I vs Type II errors in the context of an A/B test you ran.",
    intention: "To assess statistical literacy, which separates strong data scientists from those who just run models.",
    answer: "P-value: probability of seeing results this extreme if the null hypothesis (no difference) is true. p < 0.05 means we reject the null — not that the effect is large or practically significant. Confidence interval: the range within which the true effect likely falls 95% of the time across repeated experiments — more informative than p-values alone. Type I error (false positive): declaring a winner when there is none — controlled by significance threshold α. Type II error (false negative): missing a real effect — controlled by statistical power (typically 80%). Common A/B pitfalls: peeking at results early (inflates Type I errors), not running the test long enough, and ignoring novelty effects."
  },
  javascript: {
    question: "Explain closures, the event loop, and the difference between var, let, and const in JavaScript.",
    intention: "To assess core JavaScript fundamentals that underpin all frontend and Node.js work.",
    answer: "A closure is a function that retains access to its outer scope even after the outer function has returned — used for data encapsulation and factory functions. The event loop processes the call stack first, then microtasks (Promises), then macrotasks (setTimeout). var is function-scoped and hoisted with undefined; let and const are block-scoped and not initialized until declaration (temporal dead zone). const prevents reassignment but not mutation of objects/arrays."
  },

  mysql: {
    question: "How does MySQL handle indexing, and what is the difference between a clustered and non-clustered index?",
    intention: "To assess relational database internals knowledge beyond just writing queries.",
    answer: "A clustered index determines the physical order of rows on disk — InnoDB uses the primary key as the clustered index, so there can only be one per table. A non-clustered index is a separate structure with pointers back to the row. Lookups on non-clustered indexes require a second read (key lookup) unless it is a covering index containing all queried columns. Use EXPLAIN to check if queries are using indexes. Avoid indexing low-cardinality columns like boolean flags — the optimizer will skip them."
  },

  security: {
    question: "Walk me through the OWASP Top 10 vulnerabilities. How would you protect a Node.js REST API from SQL injection, XSS, and CSRF?",
    intention: "To assess security awareness and ability to build defensively — critical for any backend role.",
    answer: "SQL injection: use parameterized queries or an ORM — never concatenate user input into queries. XSS: sanitize and escape all output, set Content-Security-Policy headers, use HttpOnly cookies. CSRF: use CSRF tokens for state-changing requests, SameSite cookie attribute, and verify Origin headers. Additional hardening: rate limiting (express-rate-limit), helmet.js for secure HTTP headers, input validation with Joi or Zod, and never expose stack traces in production error responses."
  },

  kafka: {
    question: "Explain Apache Kafka's core concepts — topics, partitions, and consumer groups — and when you would use it over a simple message queue like RabbitMQ.",
    intention: "To assess event-driven architecture knowledge for high-throughput distributed systems.",
    answer: "Kafka is a distributed log. Producers write to topics, which are split into partitions for parallelism and scalability. Each partition is an ordered, immutable sequence of messages. Consumer groups allow multiple consumers to read from a topic in parallel — each partition is assigned to one consumer in the group. Messages are retained by time or size (not deleted on consume), enabling replay. Use Kafka for high-throughput event streaming, audit logs, and event sourcing. Use RabbitMQ for simpler task queues where delivery guarantees and routing flexibility matter more than scale."
  },

  tensorflow: {
    question: "How would you build and train a neural network using TensorFlow/Keras for a multi-class classification problem?",
    intention: "To assess practical deep learning implementation ability using the most widely used DL framework.",
    answer: "Define a Sequential model: Input layer → Dense layers with ReLU → Dropout for regularization → final Dense layer with softmax activation (num_classes units). Compile with optimizer (Adam), loss (categorical_crossentropy for one-hot labels or sparse_categorical_crossentropy for integer labels), and metrics (['accuracy']). Use model.fit() with validation_data, EarlyStopping callback (monitor val_loss, patience=3), and ModelCheckpoint to save the best weights. For large datasets use tf.data pipelines for efficient batching and prefetching. Evaluate on the test set only after final model selection."
  },

  pytorch: {
    question: "What is the difference between PyTorch's dynamic computation graph and TensorFlow's static graph, and why does it matter for debugging?",
    intention: "To assess understanding of deep learning framework internals and their practical implications.",
    answer: "PyTorch builds the computation graph dynamically at runtime — each forward pass creates a new graph. This means you can use regular Python control flow (if/for), print intermediate tensors, and debug with standard Python tools like pdb. TensorFlow 1.x used static graphs (define-then-run) which were faster to optimize but difficult to debug. TF2 adopted eager execution by default, closing the gap. PyTorch's dynamic graph is preferred for research and complex architectures (RNNs with variable-length inputs, meta-learning). TF2 with tf.function gives the best of both: eager by default, compiled when needed."
  },

  "scikit-learn": {
    question: "How do you build a robust ML pipeline in scikit-learn that prevents data leakage and works correctly at inference time?",
    intention: "To assess practical ML engineering discipline — leakage is one of the most common and costly mistakes in production ML.",
    answer: "Use sklearn Pipeline to chain preprocessors and the model: Pipeline([('scaler', StandardScaler()), ('classifier', LogisticRegression())]). The pipeline ensures fit() is called only on training data and transform() is applied consistently to validation and test sets. For cross-validation, wrap everything in cross_val_score — it fits and transforms each fold independently, preventing leakage. For categorical encoding, use ColumnTransformer to apply different transformations to different feature types. Save the entire pipeline with joblib.dump() for inference — this ensures the same preprocessing is always applied."
  },

  nlp: {
    question: "Explain the difference between stemming, lemmatization, TF-IDF, and word embeddings — when would you use each?",
    intention: "To assess foundational NLP knowledge and understanding of text representation trade-offs.",
    answer: "Stemming crudely chops word endings (running → run) — fast but produces non-words. Lemmatization uses vocabulary and morphology to return the base form (better → good) — slower but accurate. TF-IDF represents text as sparse vectors weighted by term frequency and inverse document frequency — good for keyword-based search and classical ML models. Word embeddings (Word2Vec, GloVe, FastText) represent words as dense vectors that capture semantic meaning — similar words are close in vector space. For modern NLP tasks, use transformer-based contextual embeddings (BERT, sentence-transformers) which produce different vectors for the same word depending on context."
  },

  "computer vision": {
    question: "How does a Convolutional Neural Network (CNN) process images, and what techniques do you use to prevent overfitting on small image datasets?",
    intention: "To assess deep learning knowledge applied to vision tasks — a core requirement for computer vision roles.",
    answer: "CNNs apply learned filters (kernels) across the image to detect local patterns — edges in early layers, complex shapes in deeper layers. Convolution → ReLU → Pooling blocks progressively reduce spatial dimensions while increasing feature depth. For small datasets: data augmentation (random flip, rotation, color jitter) artificially increases training diversity. Transfer learning is the most powerful technique — take a pretrained model (ResNet, EfficientNet), freeze early layers, and fine-tune the final layers on your dataset. Dropout and batch normalization also reduce overfitting. Always use ImageDataGenerator or torchvision.transforms in your data pipeline."
  },

  langchain: {
    question: "How would you use LangChain to build a multi-step AI agent that can use tools like web search and a calculator?",
    intention: "To assess practical LLM orchestration ability — building agents is a core skill in modern AI engineering.",
    answer: "Define tools as functions decorated with @tool or wrapped with Tool(). Create an agent using initialize_agent() or the newer AgentExecutor with a prompt template that includes tool descriptions. The agent follows a ReAct loop: Thought → Action (pick a tool) → Observation (tool result) → repeat until it has enough information to give a Final Answer. Use ConversationBufferMemory to maintain context across turns. For production: add output parsers to handle malformed responses, set max_iterations to prevent infinite loops, and use streaming callbacks to show the agent's reasoning steps to the user in real time."
  },
  lightgbm: {
    question: "How does LightGBM differ from XGBoost in its tree-building strategy, and when would you prefer one over the other?",
    intention: "To assess depth of gradient boosting knowledge and ability to make informed model selection decisions.",
    answer: "XGBoost grows trees level-by-level (depth-wise), splitting all nodes at a given depth before going deeper. LightGBM grows trees leaf-wise — it always splits the leaf with the highest loss reduction, producing asymmetric trees that converge faster. LightGBM is significantly faster and uses less memory on large datasets due to histogram-based splitting and feature bundling. Prefer LightGBM for large datasets (100k+ rows) where training speed matters. Prefer XGBoost when interpretability and stability on smaller datasets is priority, or when LightGBM overfits due to aggressive leaf-wise growth — control this with min_data_in_leaf and num_leaves."
  },
  default: {
    question: "Describe a technically challenging problem you solved recently. What was your approach and what did you learn?",
    intention: "To assess problem-solving ability, depth of technical thinking, and self-awareness.",
    answer: "Structure your answer using STAR: Situation (context of the problem), Task (what you needed to achieve), Action (specific technical steps you took — be detailed here), Result (measurable outcome). Focus on your decision-making process, trade-offs you considered, and what you would do differently with hindsight."
  },

};

// ─── BEHAVIORAL QUESTION BANK ───────────────────────────────────────────────
const BEHAVIORAL_QUESTION_BANK = [
  {
    question: "Tell me about a time you had to learn a new technology quickly under a tight deadline. How did you approach it?",
    intention: "To assess adaptability, learning agility, and ability to perform under pressure.",
    answer: "Use the STAR method. Highlight: how you broke down the learning into manageable chunks, what resources you used (docs, tutorials, colleagues), how you built a minimal proof-of-concept first, and how you managed stakeholder expectations around the timeline. Emphasize what the outcome was and what you would do differently."
  },
  {
    question: "Tell me about a challenging project you worked on during college or an internship. What was your role and what did you learn?",
    intention: "To assess initiative, learning ability, and how they handle real work outside the classroom.",
    answer: "Use STAR. Describe the project context, your specific contribution (not just the team's), a challenge you personally faced, and what you did to overcome it. Focus on what you learned — technical skills, teamwork, communication. Avoid vague answers like 'it was a group project and we all contributed equally' — interviewers want to know what YOU did specifically."
  },
  {
    question: "Describe a time you had to learn something completely new in a short amount of time. How did you go about it?",
    intention: "To assess learning agility — the most critical trait for freshers since most will need to learn on the job from day one.",
    answer: "Pick a specific example: a new language, framework, or tool you picked up for a project or hackathon. Explain your learning strategy — official docs, tutorials, building a small project, asking for help. Show that you are systematic, not random. Emphasize what you built or achieved with the new skill, even if small. This reassures interviewers that you can ramp up quickly."
  },
  {
    question: "Have you ever worked in a team where there was a disagreement? How did you handle it?",
    intention: "To assess conflict resolution and communication skills in a team setting — relevant even from college projects.",
    answer: "This can be from a college group project, hackathon team, or internship. Show that you listened to others' perspectives before asserting your own. Describe how you found common ground — a compromise, a vote, or deferring to someone with more context. The key is to show maturity: you did not go silent, did not dominate, and the team moved forward constructively."
  },
  {
    question: "Tell me about a personal project or side project you built. Why did you build it and what did you learn from it?",
    intention: "To assess genuine passion for the craft and ability to self-direct learning beyond coursework.",
    answer: "Describe a specific project — what problem it solved, why you chose the tech stack, what was the hardest part, and what you would do differently now. Even small or incomplete projects are fine — the interviewer wants to see curiosity and initiative, not a production-ready product. If you deployed it or got any users, mention that. If it is on GitHub, mention that too."
  },
  {
    question: "Why did you choose this field, and where do you see yourself in the next 2-3 years?",
    intention: "To assess motivation, self-awareness, and whether their growth goals align with the role.",
    answer: "Be honest and specific — not 'I like computers' but 'I got into backend development because I was fascinated by how APIs work after building X project.' For the future, show ambition without arrogance: you want to become a solid contributor, build real production systems, and grow into a senior engineer over time. Align your answer to the company's domain if possible."
  },
  {
    question: "Tell me about a time you received feedback on your work — from a professor, mentor, or internship supervisor. How did you respond?",
    intention: "To assess receptiveness to feedback — a key indicator of how quickly a fresher will grow on the job.",
    answer: "Choose an example where the feedback stung a little but was valid. Show that you did not get defensive — you asked clarifying questions, thanked them, and took concrete action. Describe the change you made and whether the outcome improved. Interviewers are not looking for someone who never makes mistakes — they want someone who improves when corrected."
  },
  {
    question: "Describe a situation where you had to meet a deadline with incomplete knowledge or resources. What did you do?",
    intention: "To assess resourcefulness and ability to deliver under constraints — a realistic preview of professional life.",
    answer: "This could be a college submission, hackathon, or internship task. Show that you triaged — identified what was essential vs nice-to-have, asked for help early rather than at the last minute, and communicated proactively if the timeline was at risk. Emphasize what you delivered and what you would do differently with more time."
  },
  {
    question: "Have you ever taken initiative to do something beyond what was asked of you in a project or internship? What drove you to do it?",
    intention: "To identify candidates who go beyond minimum requirements — a strong predictor of high performance.",
    answer: "Even small examples count: adding tests that were not required, writing documentation, suggesting a better approach, or fixing a bug you noticed while working on something else. Explain what motivated you — quality, user impact, team efficiency — not just 'I had free time.' Show that thinking beyond your immediate task is a habit, not a one-time event."
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
  }, 
  {
    question: "Describe a project or decision that failed. What went wrong and what did you learn from it?",
    intention: "To assess self-awareness, honesty, and ability to extract lessons from failure rather than deflect blame.",
    answer: "Choose a real failure — interviewers can tell when candidates dodge this. Be specific about what went wrong and own your part in it without over-explaining or blaming others. Then clearly articulate what you changed as a result: a process you adopted, an assumption you now always validate, or a communication habit you built. The best answers show that the failure made you meaningfully better — not just that you felt bad about it."
  },
  {
    question: "Describe a situation where you identified a process or workflow inefficiency in your team. What did you do about it?",
    intention: "To assess proactiveness, systems thinking, and ability to drive improvement beyond your immediate scope.",
    answer: "Pick a specific inefficiency — a manual deployment step, a slow code review process, a recurring bug type with no prevention mechanism. Describe how you noticed it (metrics, repeated friction, colleague complaints) and what you did: proposed a solution, built a proof of concept, documented it, or got buy-in from the team. Quantify the improvement where possible — time saved, error rate reduced, deployment frequency increased. This shows you treat your team's productivity as part of your job, not just your own output."
  },
  {
    question: "Tell me about a time you had to work with a difficult teammate or stakeholder. How did you handle it?",
    intention: "To assess emotional intelligence, conflict resolution skills, and ability to maintain productive working relationships.",
    answer: "Focus on the actions you took, not on criticizing the other person. Describe how you sought to understand their perspective, how you communicated your own needs clearly, and what specific steps you took to find common ground. Emphasize the professional outcome and what you learned about working with different personalities."
  },
  {
    question: "Describe how you prioritize tasks when you have multiple deadlines competing for your attention.",
    intention: "To evaluate time management, prioritization frameworks, and communication around capacity.",
    answer: "Explain your prioritization framework — impact vs effort matrix, MoSCoW method, or aligning with business priorities. Show that you communicate proactively when timelines are at risk rather than going silent. Describe how you break large tasks into smaller deliverables to show progress, and how you negotiate scope when needed."
  },

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
      if (!usedSkills.has("system design")) {
        selected.push(TECHNICAL_QUESTION_BANK["system design"]);
        usedSkills.add("system design");
      }
    }
  }

  // Priority 4: Fill remaining slots with other bank questions
  const fillerKeys = ["system design", "agile", "default"];
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
    machine_learning: [
      "Study the end-to-end ML workflow: EDA, feature engineering, model selection, evaluation.",
      "Practice the bias-variance tradeoff — plot learning curves for an overfit and underfit model.",
      "Implement cross-validation and hyperparameter tuning using GridSearchCV or Optuna.",
      "Build a complete classification pipeline with scikit-learn including preprocessing and evaluation."
    ],
    deep_learning: [
      "Review neural network fundamentals: forward pass, backpropagation, and activation functions.",
      "Build a simple image classifier using PyTorch or TensorFlow on the MNIST dataset.",
      "Study common architectures: CNNs for vision, LSTMs for sequences, Transformers for NLP.",
      "Practice using pretrained models from Hugging Face for a text classification task."
    ],
    data_science: [
      "Pick a Kaggle dataset and complete a full EDA: distributions, correlations, and outliers.",
      "Practice feature engineering: encoding, scaling, handling nulls, and creating new features.",
      "Train and compare at least 3 models on the same dataset and justify your final choice.",
      "Write up your findings as if presenting to a non-technical stakeholder."
    ],
    xgboost: [
      "Train an XGBoost model on a tabular dataset and tune it using early stopping.",
      "Study the key hyperparameters: learning_rate, max_depth, subsample, and colsample_bytree.",
      "Compare XGBoost vs LightGBM vs Random Forest on the same dataset and benchmark performance.",
      "Use SHAP values to explain your XGBoost model's predictions."
    ],
    feature_engineering: [
      "Practice target encoding and frequency encoding for high-cardinality categorical columns.",
      "Apply log transform and Box-Cox to skewed numeric features and measure the impact.",
      "Build a scikit-learn Pipeline that chains preprocessing and model training together.",
      "Study feature selection methods: correlation filter, mutual information, and RFE."
    ],
    hugging_face: [
      "Load a pre-trained BERT model and tokenizer using the Transformers library.",
      "Fine-tune a sequence classification model on a small custom dataset using the Trainer API.",
      "Explore the Hugging Face Hub — find and run inference on 3 different model types.",
      "Study PEFT and LoRA using the peft library for efficient fine-tuning."
    ],
    fine_tuning: [
      "Understand LoRA: what rank decomposition means and which layers to target.",
      "Fine-tune a small open-source LLM (Mistral or LLaMA) using QLoRA on a free GPU.",
      "Prepare a training dataset in the instruction-following format (prompt + completion pairs).",
      "Evaluate your fine-tuned model against the base model using a held-out test set."
    ],
    vector_databases: [
      "Set up ChromaDB locally and store embeddings from a sample document collection.",
      "Compare cosine similarity vs dot product vs Euclidean distance for retrieval quality.",
      "Index 10,000+ documents in Pinecone and benchmark query latency at different top-k values.",
      "Implement a hybrid search combining vector similarity and BM25 keyword scoring."
    ],
    prompt_engineering: [
      "Practice chain-of-thought prompting on 5 reasoning problems and measure accuracy improvement.",
      "Build a few-shot prompt for a classification task with 3 input-output examples.",
      "Implement a ReAct-style agent prompt that interleaves reasoning and tool-use steps.",
      "Version and evaluate 3 prompt variants on a fixed test set using a scoring rubric."
    ],
    llm: [
      "Study the transformer architecture: self-attention, multi-head attention, and positional encoding.",
      "Run inference locally using Ollama with a quantized LLaMA or Mistral model.",
      "Build a simple LLM-powered chatbot with conversation history using the OpenAI API.",
      "Study LLM evaluation metrics: BLEU, ROUGE, BERTScore, and human preference scoring."
    ],
    airflow: [
      "Install Airflow locally and build a DAG with at least 4 dependent tasks.",
      "Implement retries, SLA alerts, and email_on_failure on each task.",
      "Pass data between tasks using XComs for small metadata and S3 for large payloads.",
      "Study Airflow's TaskFlow API and rewrite a classic operator-based DAG using @task decorators."
    ],
    snowflake: [
      "Set up a free Snowflake trial and load a CSV dataset into a table.",
      "Write 5 queries using Snowflake-specific features: CTEs, window functions, and FLATTEN for JSON.",
      "Study virtual warehouse sizing and when to scale up vs scale out.",
      "Use the Query Profile to identify a bottleneck in a slow query and fix it."
    ],
    statistics: [
      "Review hypothesis testing: t-test, chi-square, and ANOVA with Python examples.",
      "Design a proper A/B test: calculate required sample size, set α and power before running it.",
      "Study common statistical pitfalls: p-hacking, survivorship bias, and Simpson's paradox.",
      "Practice interpreting confidence intervals and explain them to a non-technical audience."
    ],
    tableau: [
      "Build a 3-view Tableau dashboard: KPI summary, trend line, and geographic map.",
      "Connect Tableau to a live database and create a calculated field using a custom formula.",
      "Study Tableau LOD expressions: FIXED, INCLUDE, and EXCLUDE with practical examples.",
      "Publish a dashboard to Tableau Public and configure filters and parameter controls."
    ],
    javascript: [
      "Review closures, prototypal inheritance, and the event loop with practical examples.",
      "Practice async patterns: callbacks vs Promises vs async/await and error handling in each.",
      "Study ES6+ features: destructuring, spread, optional chaining, and nullish coalescing.",
      "Build a small vanilla JS project without any framework to solidify DOM manipulation skills."
    ],
    typescript: [
      "Review advanced TypeScript types: generics, conditional types, and mapped types.",
      "Practice converting a JavaScript module to strict TypeScript.",
      "Study utility types: Partial, Required, Pick, Omit, and Record.",
      "Learn how to configure tsconfig.json for different project needs."
    ],
    kafka: [
      "Set up a local Kafka instance using Docker and produce/consume messages with a Node.js client.",
      "Study partitioning strategy: how to choose partition keys to avoid hot partitions.",
      "Implement a consumer group with two consumers and observe partition assignment.",
      "Compare Kafka vs RabbitMQ trade-offs and document when you would choose each."
    ],
    agile: [
      "Review core Scrum ceremonies: sprint planning, daily standup, review, and retrospective.",
      "Practice explaining technical debt to a non-technical stakeholder using a business impact framing.",
      "Study the Strangler Fig pattern for incrementally replacing legacy systems.",
      "Write a short document on how you would balance tech debt and feature delivery in a 2-week sprint."
    ],
    security: [
      "Study OWASP Top 10 and implement fixes for injection and XSS in a sample Express app.",
      "Add helmet.js, rate limiting, and input validation (Joi/Zod) to a Node.js API.",
      "Practice setting secure cookie attributes: HttpOnly, Secure, and SameSite.",
      "Review CORS configuration and understand when and why to restrict origins."
    ],
    tensorflow: [
      "Build a multi-class classifier using Keras Sequential API on a standard dataset (MNIST or CIFAR-10).",
      "Add EarlyStopping and ModelCheckpoint callbacks to your training loop.",
      "Build a tf.data pipeline with batching, shuffling, and prefetching.",
      "Convert your trained Keras model to TensorFlow Lite for mobile deployment."
    ],
    pytorch: [
      "Build a custom Dataset and DataLoader for a tabular or image dataset.",
      "Implement a training loop from scratch: forward pass, loss, backward, optimizer step.",
      "Study autograd: how PyTorch tracks gradients and when to use torch.no_grad().",
      "Fine-tune a pretrained torchvision model (ResNet18) on a custom image dataset."
    ],
    "scikit-learn": [
      "Build a full sklearn Pipeline with ColumnTransformer for mixed feature types.",
      "Run cross_val_score and compare 3 models: Logistic Regression, Random Forest, and XGBoost.",
      "Use GridSearchCV or RandomizedSearchCV for hyperparameter tuning.",
      "Save your trained pipeline with joblib and load it for inference in a separate script."
    ],
    nlp: [
      "Preprocess a text dataset: tokenize, remove stopwords, lemmatize using spaCy.",
      "Build a TF-IDF vectorizer and train a Logistic Regression text classifier.",
      "Use sentence-transformers to embed documents and find semantic similarity.",
      "Fine-tune a DistilBERT model for sentiment analysis using the Hugging Face Trainer."
    ],
    "computer vision": [
      "Load and augment an image dataset using torchvision.transforms or Albumentations.",
      "Fine-tune a pretrained ResNet or EfficientNet model on a custom image classification task.",
      "Implement object detection inference using a pretrained YOLO model.",
      "Study evaluation metrics for vision tasks: accuracy, mAP, IoU, and confusion matrix."
    ],
    langchain: [
      "Build a simple LangChain chain: prompt template → LLM → output parser.",
      "Add memory to a chatbot using ConversationBufferMemory and test multi-turn dialogue.",
      "Create a tool-using agent with at least 2 tools (search + calculator) using AgentExecutor.",
      "Build a RAG chain using LangChain's document loaders, text splitter, and retriever."
    ],
    lightgbm: [
      "Train a LightGBM model and compare speed and accuracy against XGBoost on the same dataset.",
      "Tune num_leaves, min_data_in_leaf, and learning_rate to control overfitting.",
      "Use LightGBM's built-in feature importance and compare with SHAP values.",
      "Implement early stopping with a validation set to find the optimal number of estimators."
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