
# School Biometrics Attendance System

A professional, high-fidelity biometric attendance solution built with **Flask** and **React**. This system leverages face recognition technology to provide secure and efficient attendance tracking for students and system users.

## 🚀 Key Features

- **Biometric Face Login**: Secure access for admins and staff using facial recognition.
- **Student Enrollment**: Seamless registration of students with biometric data capture.
- **Live Attendance Scanner**: Real-time face recognition for marking student attendance at gates or classrooms.
- **Professional Reports**: Dynamic charts and activity logs for monitoring attendance trends and punctuality.
- **User Directory**: Searchable directory of students and system users with role-based filtering.
- **Glassmorphism UI**: A stunning, modern dark-themed interface built for a premium user experience.

## 🛠️ Tech Stack

- **Backend**: Python (Flask, SQLAlchemy, Flask-JWT-Extended)
- **Biometrics**: Dlib, Face_Recognition, OpenCV
- **Frontend**: React, Tailwind CSS, Lucide Icons, Recharts
- **Database**: PostgreSQL / SQLite
- **Deployment**: Docker, Procfile-ready

## 📦 Setup & Installation

### Backend
1. Navigate to `/backend`
2. Create a virtual environment: `python -m venv venv`
3. Install dependencies: `pip install -r requirements.txt`
4. Configure `.env` with your `DATABASE_URL` and `SECRET_KEY`.
5. Run the server: `python run.py`

### Frontend
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Configure `.env` with your `VITE_API_BASE_URL`.
4. Start development server: `npm run dev`

## 🛡️ Security
The system uses JWT (JSON Web Tokens) for secure API authentication and standardizes communication over local network bindings (`127.0.0.1`).

# Connecting With github
- Creat the root folder e.g school-biometric-attendance
- Creat a readme.md file inside it
- Creat a .gitignore (Prevents secrets,virtualenvs,& node modules from uploaded.)
- in the product folder:

        git init
        git add .
        git commit -m "Initial commit: school biometric attendance system"
        
- Go to github and Click ➕ New repository
- Write the repository name : root folder
- 
