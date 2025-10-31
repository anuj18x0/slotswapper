# SlotSwapper

A full-stack web application for managing and swapping time slots between users. Built with React + Vite frontend and Fastify + MySQL backend.

## Project Overview

SlotSwapper allows users to:
- Create and manage their own time slots
- Browse available time slots from other users
- Request to swap time slots with other users
- Approve or reject incoming swap requests
- View dashboard with activity overview

## Technology Stack

### Backend
- **Fastify** - Fast and efficient Node.js web framework
- **MySQL** - Relational database for data storage
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation

### Frontend
- **React** - UI library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **Lucide React** - Icons

## Project Structure

```
SlotSwapper/
├── backend/
│   ├── src/
│   │   ├── app.js              # Main server file
│   │   ├── config/
│   │   │   └── index.js        # Configuration
│   │   ├── plugins/
│   │   │   └── index.js        # Fastify plugins
│   │   └── routes/
│   │       ├── auth.js         # Authentication routes
│   │       ├── calendar.js     # Calendar/time slot routes
│   │       ├── swaps.js        # Swap request routes
│   │       ├── users.js        # User management routes
│   │       └── index.js        # Route registration
│   ├── database/
│   │   ├── schema.sql          # Database schema
│   │   └── sample_data.sql     # Sample data
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/             # Login/Register components
    │   │   ├── calendar/         # Calendar management
    │   │   ├── dashboard/        # Dashboard overview
    │   │   ├── layout/           # Navigation components
    │   │   ├── profile/          # User profile
    │   │   └── swaps/            # Swap-related components
    │   ├── contexts/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── index.html
```

## Setup Instructions

You can run SlotSwapper in two ways: **using Docker (recommended)** or **local development**.

---

## 🐳 **Option 1: Docker Setup (Recommended)**

### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd SlotSwapper
   ```

2. **Start all services with Docker Compose:**
   ```bash
   docker compose up --build
   ```

   This single command will:
   - ✅ Create and configure MySQL database
   - ✅ Run database migrations (schema + sample data)
   - ✅ Build and start the backend API
   - ✅ Build and start the frontend
   - ✅ Connect everything together

3. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001/api
   - **MySQL**: localhost:3307

4. **Login with sample credentials:**
   - Email: `rajesh.kumar@example.com`
   - Password: `user123`

   Or:
   - Email: `priya.sharma@example.com`
   - Password: `user123`

### Docker Commands

```bash
# Start services in detached mode (background)
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove all data (including database)
docker compose down -v

# Rebuild after code changes
docker compose up --build

# Check running containers
docker compose ps
```

### Docker Architecture

- **MySQL Container**: Database with auto-initialization
- **Backend Container**: Fastify API server (Node.js)
- **Frontend Container**: Nginx serving built React app
- **Network**: All containers communicate via `slotswapper-network`
- **Volume**: `mysql_data` persists database between restarts

---

## 💻 **Option 2: Local Development Setup**

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your database credentials and JWT secret.

4. **Set up MySQL database:**
   - Create a new database named `slotswapper`
   - Run the schema file: `mysql -u root -p slotswapper < database/schema.sql`
   - Optionally run sample data: `mysql -u root -p slotswapper < database/sample_data.sql`

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   Backend will run on http://localhost:3001

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout

### Calendar Management
- `GET /api/calendar/slots` - Get user's time slots
- `POST /api/calendar/slots` - Create new time slot
- `PUT /api/calendar/slots/:id` - Update time slot
- `DELETE /api/calendar/slots/:id` - Delete time slot
- `GET /api/calendar/available-slots` - Get all available slots for swapping

### Swap Requests
- `POST /api/swaps/requests` - Create swap request
- `GET /api/swaps/requests` - Get swap requests (incoming/outgoing)
- `PUT /api/swaps/requests/:id` - Update swap request status
- `GET /api/swaps/notifications` - Get user notifications

### User Management
- `GET /api/users/profile` - Get user profile
- `GET /api/users` - Get all users

## Features

### Core Features
- ✅ User Authentication (Register/Login)
- ✅ Time Slot Management (CRUD operations)
- ✅ Browse Available Slots
- ✅ Swap Request System
- ✅ Dashboard Overview
- ✅ Responsive Design

### Database Schema
- **Users**: Store user information and credentials
- **Time Slots**: Store user's scheduled time slots
- **Swap Requests**: Manage swap requests between users
- **Notifications**: Track user notifications

---

## 🐛 **Troubleshooting**

### Docker Issues

**Problem: "docker-compose: command not found"**
- Solution: Use `docker compose` (without hyphen) on newer Docker versions

**Problem: Containers won't start**
- Solution: Make sure Docker Desktop is running
- Check if ports 3000, 3001, 3307 are not already in use
- Try: `docker compose down -v` then `docker compose up --build`

**Problem: MySQL initialization failed**
- Solution: Remove volume and restart: `docker compose down -v && docker compose up --build`

**Problem: Frontend shows "Cannot connect to backend"**
- Solution: Wait 30 seconds for all services to be healthy
- Check backend logs: `docker compose logs backend`

**Problem: Changes not reflecting in Docker**
- Solution: Rebuild containers: `docker compose up --build`

### Local Development Issues

**Problem: MySQL connection error**
- Check if MySQL is running: `mysql -u root -p`
- Verify credentials in `.env` file
- Ensure database `slotswapper` exists

**Problem: Port already in use**
- Change ports in `.env` files
- Or kill the process using the port

---

## Development Notes

### Security Features
- Password hashing with bcryptjs (12 rounds)
- JWT token authentication with secure secret
- Input validation with Joi
- CORS protection
- SQL injection prevention

### Frontend Architecture
- Context-based state management
- Protected routes with authentication
- Fully responsive design (mobile, tablet, desktop)
- Toast notifications for user feedback
- Loading states and error handling
- WebSocket real-time notifications

### Backend Architecture
- Modular route organization
- Middleware for authentication
- Error handling and logging
- Database connection pooling
- Environment-based configuration
- WebSocket support for real-time updates

## Features Implemented

### Core Features ✅
- User authentication (Register/Login with JWT)
- Time slot management (CRUD operations)
- Browse available slots
- Swap request system (create, approve, reject, cancel)
- Dashboard with statistics
- Responsive design for all devices

### Bonus Features ✅
- **Real-time WebSocket Notifications** - Instant updates for swap requests
- **Mark all notifications as read** - Bulk notification management
- **Transaction-based swaps** - Data integrity with rollback support
- **Conflict checking** - Prevent overlapping time slots
- **Past slot filtering** - Only show future available slots
- **Mobile-first design** - Hamburger menu, touch-friendly UI

## Future Enhancements

- Email notifications for swap requests
- Calendar integration (Google Calendar, Outlook)
- Advanced filtering and search
- Recurring time slots
- Team/group management
- Mobile app with React Native
- Automated testing suite
- Rate limiting and API throttling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request