# TaskTracker
A full stack application for managing tasks. A Node.js backend and React (Vite) frontend. The application is containerized using Docker for easy deployment and development.

Prerequisites
Node.js 
npm
Docker (optional, for containerized deployment)
Docker Compose (optional, for containerized deployment)

Option 1: Running with Docker

git clone "git@github.com:rahul24sharma/TaskTracker.git"
docker-compose up --build

Access the application
Frontend: http://localhost:5173
Backend API: http://localhost:3001

Option 2: Running without Docker

#For Backend
cd task-backend
npm install
npm start

#For Frontend
cd task-frontend
npm install
npm run dev

Set up environment variables
Create a .env file in the task-backend directory based on the(if needed)

Development Scripts
For Backend
npm start: Start the production server
For Frontend
npm run dev: Start the development server with nodemon
For Frontend tasks
npm test: Run tests

Docker Commands
Build images: docker-compose build

Start containers: docker-compose up

Start containers in detached mode: docker-compose up -d

Stop containers: docker-compose down

View running containers: docker ps

View logs: docker-compose logs or docker-compose logs -f for following

Remove all unused containers and networks: docker system prune


