# Live Polling System

A real-time polling system for teachers and students built with React, Node.js, and Socket.IO.

Front-end hosted link(Vercel) : - https://live-poll-system.vercel.app/

backend hosted link(Render) :- https://assign-cc11.onrender.com



## Features

- Real-time polling with instant updates
- Teacher dashboard for creating and managing polls
- Student dashboard for answering questions
- Live results with progress bars
- Multiple choice questions
- Timer for each poll
- Correct/Incorrect answer indicators

## Tech Stack

- **Frontend:**
  - React
  - Redux Toolkit
  - Socket.IO Client
  - Styled Components

- **Backend:**
  - Node.js
  - Express
  - Socket.IO
  - CORS

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <repo-name>
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Start the server:
```bash
# In the server directory
npm start
```

4. Start the client:
```bash
# In the client directory
npm start
```

5. Open your browser and visit:
- Teacher Dashboard: http://localhost:3000/teacher
- Student Dashboard: http://localhost:3000/student

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # Socket service
│   │   └── store/        # Redux store
│   └── package.json
│
└── server/                # Node.js backend
    ├── index.js          # Server entry point
    └── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 
