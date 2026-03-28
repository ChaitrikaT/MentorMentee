### Mentor-Mentee Management System
## 🚀 What is MentorBridge?

MentorBridge is a full-stack web application designed to streamline mentor-mentee management . It digitizes the entire mentorship workflow — from allocation to interaction tracking to intelligent insights.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Role-based Login | Separate Admin and Mentor views |
| 👨‍🏫 Mentor Management | Admin can dynamically add new faculty mentors to the system |
| 👥 Mentor-Mentee Allocation | Manual + AI-suggested smart allocation |
| 📝 Interaction Logging | Mentors log sessions with notes, action items, next meeting dates |
| 📋 Consolidated List | View all mentor-mentee pairs with interaction status |
| 📊 Reports | Individual, Year-wise, and Mentor-wise reports |
| 📄 PDF Export | Download reports as professionally formatted PDFs |
| 🤖 AI Insights | Automatic risk classification (At Risk / Needs Attention / On Track) with suggestions |
| 🎯 AI Allocation Suggestion | Suggests best mentor-mentee matches based on department and workload balancing |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| Backend | Flask (Python) |
| Database | SQLite |
| PDF Generation | ReportLab |
| AI Insights | Groq API (llama-3.3-70b) with smart fallback |
| UI Generation | v0 by Vercel |

---

## 📁 Project Structure

```
MentorMentee/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Login page
│   │   └── dashboard/
│   │       ├── page.tsx                    # Allocation
│   │       ├── consolidated-list/
│   │       ├── interactions/
│   │       ├── reports/
│   │       └── ai-insights/
│   └── components/
│       └── dashboard/
│           ├── sidebar.tsx
│           ├── allocations-table.tsx
            ├── add-mentor-modal.tsx
│           ├── add-allocation-modal.tsx
│           ├── interaction-form.tsx
│           ├── consolidated-list-table.tsx
│           ├── reports-tabs.tsx
│           ├── individual-report.tsx
│           ├── year-wise-report.tsx
│           ├── mentor-wise-report.tsx
│           └── ai-insights-grid.tsx
└── backend/
    ├── app.py                 # Flask API + all routes
    ├── database.py            # SQLite setup + seed data
    ├── .env                   # API keys (not committed)
    └── requirements.txt       # Python dependencies
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/ChaitraT/MentorMentee.git
cd MentorMentee
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv m-env

# Windows
m-env\Scripts\activate

# Mac/Linux
source m-env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in backend/ folder
echo "GROQ_API_KEY=your_groq_api_key_here" > backend/.env

# Run Flask server
cd backend
python app.py
```
Flask runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs on: `http://localhost:3000`

---

## 🔑 Environment Variables

Create `backend/.env` with:
```
GROQ_API_KEY=your_groq_api_key_here
```
Get a free Groq API key at: https://console.groq.com

---

## 👤 Login Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@sahyadri.edu.in | any |
| Mentor | mentorname@sahyadri.edu.in | any |

> Note: Authentication is role-based for demo. Any password works.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mentors` | Get all mentors |
| POST | `/api/mentors` | Add a new mentor to the database |
| GET | `/api/mentees` | Get all mentees |
| GET | `/api/allocations` | Get all allocations (filter by email for mentor view) |
| POST | `/api/allocations` | Add new allocation |
| GET | `/api/allocations/suggest` | AI-suggested allocation |
| POST | `/api/interactions` | Log a new interaction |
| GET | `/api/interactions/:id` | Get interactions for an allocation |
| GET | `/api/reports/mentorwise` | Mentor-wise report |
| GET | `/api/reports/yearwise` | Year-wise report |
| GET | `/api/ai/insights` | AI-powered risk insights |
| GET | `/api/reports/pdf/individual/:id` | Download individual PDF |
| GET | `/api/reports/pdf/mentorwise` | Download mentor-wise PDF |
| GET | `/api/reports/pdf/yearwise` | Download year-wise PDF |
| GET | `/api/reports/pdf/consolidated` | Download consolidated list PDF |
| GET | `/api/reports/pdf/mentor-mentees` | Download mentor's personal mentee list PDF |

---

## 🗄️ Database

SQLite database (`mentorbridge.db`) is auto-created on first run with:
- **14 Mentors** from the 2024-25 AIML batch
- **84 Mentees** from the 2024-25 AIML batch  
- **74 Allocations** (10 left unallocated for AI suggest demo)
- **10 Sample interactions** across different mentor-mentee pairs

*MentorBridge — Bridging the gap between mentors and mentees, one interaction at a time.* 🌉
