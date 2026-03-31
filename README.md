# 🎓 ScholarAI

A full-stack, AI-powered academic toolkit built to enhance learning, research, and writing for students and professionals. Powered by advanced Generative AI and a versatile document processing architecture, ScholarAI brings dozens of unique tools directly into one clean, seamless interface.

---

## ✨ Features

- **Comprehensive Toolkit**: Over a dozen built-in academic tools including:
  - 📝 **Abstract Summarizer** - Quickly condense lengthy research articles.
  - 🤖 **AI Detector & Humanizer** - Detect AI-generated text and naturalize its flow.
  - 🎓 **Citation Generator** - Automatically scaffold citations for research.
  - 💻 **Code Debugger & Plagiarism Checker** - Identify coding errors and verify originality.
  - 🔄 **Paraphraser** - Rephrase sentences while retaining original context.
  - 📄 **PDF Tools** - Easily compress, merge, and convert PDFs.
  - 📚 **And More!** - Flashcards, Quizzes, Study Planners, and ATS Checkers.
- **Premium User Experience**: Designed with modern glassmorphism, fully responsive layouts, smooth animations (Framer Motion), and a dynamic **Light / Dark Mode**.
- **Secure Authentication**: Built-in support for Github & Google OAuth via Passport.js, complete with secure JWT/Session handling.
- **Robust Generative AI Integration**: Tightly integrated with the official `@google/genai` API SDK for structured and creative AI task completion.

---

## 🛠 Tech Stack

### Frontend Architecture
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS & raw CSS Custom Properties (Theming)
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Routing**: React Router v6
- **Charts/Visuals**: Recharts

### Backend Architecture
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: Passport.js (Google/Github OAuth 2.0) + bcryptjs + JWT
- **AI Integration**: Google GenAI Node SDK
- **Document Processing**: `pdf-parse`, `pdf-lib`, `mammoth`, `docx`
- **Uploads**: Multer

---

## 🚀 Getting Started

Ensure you have Node.js and MongoDB installed on your local machine before starting.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ScholarAI.git
cd ScholarAI
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your environment variables:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
SESSION_SECRET=your_session_secret

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```
Run the development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
```
Run the Vite development server:
```bash
npm run dev
```

### 4. Open Application
Navigate to `http://localhost:5173` in your browser.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/your-username/ScholarAI/issues) for any open tickets.

## 📝 License

This project is open-source and available under the MIT License.
