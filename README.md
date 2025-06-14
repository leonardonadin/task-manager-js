# Task List Application

A modern task management application built with Vue.js and Node.js.

## Features

- Create, read, update, and delete tasks
- Task status tracking (pending, in progress, completed)
- Task priority levels (low, medium, high)
- Due date management
- Dark mode support
- Responsive design
- Error handling and feedback
- Loading states

## Tech Stack

### Frontend
- Vue.js 3
- Vuex
- TailwindCSS
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Jest

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/task-list.git
cd task-list
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm run serve
```

## Docker Setup

1. Build and start the containers:
```bash
docker-compose up --build
```

2. Access the application:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

## Project Structure

```
task-list/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   ├── assets/
│   │   └── utils/
│   └── package.json
└── docker-compose.yml
```

## API Documentation

### Tasks

#### GET /api/tasks
Get all tasks.

#### POST /api/tasks
Create a new task.

Request body:
```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "dueDate": "2024-12-31"
}
```

#### PUT /api/tasks/:id
Update a task.

Request body:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

#### DELETE /api/tasks/:id
Delete a task.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 