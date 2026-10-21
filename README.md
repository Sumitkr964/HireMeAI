HireMeAI 🤖
An AI-Powered Interactive Portfolio

HireMeAI is an AI-powered interactive portfolio that answers questions based on my personal information, skills, experience, and projects, helping visitors get to know me better and explore my professional profile.

Instead of browsing a traditional portfolio, visitors can interact with an AI assistant to learn more about my background, technical expertise, and work.

✨ Features
Interactive AI Assistant — Ask questions and get personalized answers.
Personalized Responses — Answers are based on my personal information, skills, experience, and projects.
Professional Portfolio — Explore my background and technical expertise through a conversational interface.
Modern UI — A clean and interactive frontend experience.
API-Powered Backend — A Python backend that handles AI-powered interactions.
🛠️ Tech Stack

Frontend

React
Vite
JavaScript
CSS

Backend

Python
FastAPI
Uvicorn

Development Tools

uv for Python dependency management
Git and GitHub for version control


🚀 Getting Started

Follow these steps to run HireMeAI locally.

Prerequisites

Make sure you have the following installed:

Python 3.11
uv
Node.js and npm
Git
1. Clone the Repository
git clone https://github.com/Sumitkr964/HireMeAI.git
cd HireMeAI

2. Set Up the Python Environment

Install the project dependencies from the repository root:

uv sync

3. Configure Environment Variables

Create a .env file in the project root or in the location expected by the backend configuration.

Add the API key required by your application:

YOUR_API_KEY_NAME=your_api_key_here


Replace YOUR_API_KEY_NAME with the exact environment variable expected by backend/main.py.

Important: Never commit your .env file or expose API keys publicly.

4. Start the Backend

Open a terminal at the project root and run:

uv run --active python -m uvicorn main:app --app-dir backend --reload


The backend should be available at:

API: http://127.0.0.1:8000
Interactive API documentation: http://127.0.0.1:8000/docs

If your backend requires a different working directory or configuration, use the command appropriate for your setup.

5. Start the Frontend

Open a second terminal:

cd frontend
npm install
npm run dev


Open the local URL printed by Vite, usually:

http://localhost:5173


💬 Example Questions

Visitors can ask questions such as:

What skills does the developer have?
Tell me about their projects.
What technologies have they worked with?
What is their professional background?
Why would they be a good fit for a role?

The AI assistant should answer using the personal information and project data configured for HireMeAI.

🔐 Security
Keep API keys in environment variables.
Never commit .env files or other secrets.
Avoid exposing private personal information in public repositories.
Validate user inputs and handle API errors appropriately.
🗺️ Roadmap
Improve AI response quality and personalization.
Add more portfolio information and project details.
Improve the chat interface and user experience.
Deploy the frontend and backend.
Add better error handling and loading states.
👨‍💻 Author

Sumit Kumar

GitHub: @Sumitkr964
📄 License

No license has been specified yet. Add a LICENSE file if you want to make the project's usage and distribution terms explicit.