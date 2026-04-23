# 🚀 Resume Analyzer

A full-stack MERN+NLP application that analyzes a candidate’s resume against a job description and delivers actionable insights like match score, skill gaps, interview questions, and an ATS-friendly resume.

---

## ✨ Features

* 🔐 Secure authentication (JWT + bcrypt)
* 📄 Resume upload & parsing (PDF)
* 📊 Match score (TF-IDF + cosine similarity)
* 🧠 Skill gap analysis (custom taxonomy)
* 🎯 Technical & behavioral interview questions
* 🛣️ Personalized learning roadmap
* 📥 ATS-friendly resume PDF generation

---

## 🛠️ Tech Stack

### 🎨 Frontend

* React (Vite)
* React Router
* SCSS (BEM)


### ⚙️ Backend

* Node.js, Express
* MongoDB (Mongoose)
* JWT Authentication
* Multer (file uploads)
* pdf-parse (resume extraction)
* Puppeteer (PDF generation)

### 🧠 NLP

* natural (TF-IDF, similarity)
* compromise
* stopword
* Rule-based parsing & skill extraction

---

## ⚡ How It Works

1. 👤 User logs in
2. 📤 Uploads resume + job description
3. ⚙️ System processes and analyzes data
4. 📈 Returns:
   
   * Match score
   * Skill gaps
   * Interview and Behavioral questions
   * Learning roadmap
     
5. 📄 Download ATS-friendly resume

---

## 🧩 Setup

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 🔙 Backend

```bash
cd backend
npm install
```

Create `.env`:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

```

Run:

```bash
npm run dev
```

### 🎯 Frontend

```bash
cd frontend
npm install
npm run dev
```




