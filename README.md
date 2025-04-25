# WYSIWYG Markdown Editor

A minimalist WYSIWYG Markdown editor web application with real-time preview, floating formatting menu, and creative tools for writers including character creation and world building.

## Features

- **Markdown Editor**: Clean, distraction-free writing interface with real-time preview
- **Formatting Menu**: Appears when text is selected for easy formatting
- **Character Creation**: Create and manage detailed character profiles
- **World Building**: Upload maps and create detailed places with pinning functionality

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5000`

### Using Docker

This project includes Docker configuration for easy local deployment.

1. Make sure you have Docker and Docker Compose installed
2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```
3. Access the application at `http://localhost:5000`
4. To stop the containers:
   ```bash
   docker-compose down
   ```

### Database Setup

The application uses PostgreSQL for data storage.

For local development:
1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable
3. Run database migrations:
   ```bash
   npm run db:push
   ```

When using Docker, the database is automatically set up with the following credentials:
- **User**: postgres
- **Password**: postgres
- **Database**: markdown_editor
- **Host**: localhost (or db from within Docker network)
- **Port**: 5432

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/hooks/`: Custom React hooks
  - `src/pages/`: Application pages
- `server/`: Backend Express API
- `shared/`: Shared types and schemas
- `db/`: Database configuration and migrations

## Key Features

### Character Creation
- Detailed character profile creation with tabs for different aspects
- Fields for appearance, personality, behaviors, and character evolution
- Character management with edit/delete functionality

### World Building
- Map uploading and management
- Create and manage places with detailed information
- Pin places to specific locations on your maps
- Link characters to places for organization

## Technologies

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Containerization**: Docker, Docker Compose