# BookBuilder Editor

BookBuilder Editor is a comprehensive, gamified writing environment designed to empower authors. It goes beyond a minimalist WYSIWYG Markdown editor by integrating creative tools directly into the writing process. The platform aims to help writers stay motivated and organized, offering real-time previews, a floating formatting menu, and dedicated modules for character creation, world-building, and storyboard planning. By incorporating gamification elements, BookBuilder Editor encourages consistent writing habits and helps users track their progress effectively.

## Features

- **Markdown Editor**: Clean, distraction-free writing interface with real-time preview
- **Formatting Menu**: Appears when text is selected for easy formatting
- **Character Creation**: Create and manage detailed character profiles
- **World Building**: Upload maps and create detailed places with pinning functionality

## Getting Started

### Local Development

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Database Setup (Local)**:
    - Ensure you have PostgreSQL installed and running.
    - Create a PostgreSQL database (e.g., `markdown_editor`).
    - Set the `DATABASE_URL` environment variable in a `.env` file in the project root or directly in your shell. The format is `postgres://USER:PASSWORD@HOST:PORT/DATABASE_NAME`. For example: `DATABASE_URL="postgres://youruser:yourpassword@localhost:5432/markdown_editor"`
    - Run database migrations to create the necessary tables:
      ```bash
      npm run db:push
      ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5000`.

### Using Docker

This project includes Docker configuration for easy local deployment. This is the recommended way to get started quickly as it handles the database setup automatically.

1. Make sure you have Docker and Docker Compose installed.
2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```
   This command will build the application image (if not already built) and start the application and PostgreSQL database containers. The database will be automatically configured with the following credentials:
    - **User**: `postgres`
    - **Password**: `postgres`
    - **Database**: `markdown_editor`
    - **Host**: `db` (accessible from the application container), `localhost` (accessible from your host machine)
    - **Port**: `5432`
   The application will be configured to use this database via the `DATABASE_URL` environment variable set in `docker-compose.yml`.
3. Access the application at `http://localhost:5000`.
4. To stop the containers:
   ```bash
   docker-compose down
   ```
   To remove the database volume (and all its data) when stopping, use `docker-compose down -v`.

## Project Structure

- `client/`: Frontend React application
  - `src/components/`: UI components
  - `src/hooks/`: Custom React hooks
  - `src/pages/`: Application pages
- `server/`: Backend Express API
- `shared/`: Shared types and schemas
- `db/`: Database configuration and migrations

## Core Features

### Advanced Markdown Editor
- **Minimalist WYSIWYG Interface**: Clean, distraction-free writing environment that allows you to focus on your content.
- **Real-Time Preview**: See how your Markdown formatting translates to HTML as you type.
- **Floating Formatting Menu**: Appears when text is selected, providing quick access to common formatting options like bold, italics, headings, lists, and links.

### Character Creation & Management
- **Comprehensive Profiles**: Create detailed character profiles covering aspects such as:
    - Basic Information: Name, pronunciation, aliases, age, race.
    - Physical Traits: Eye color (including heterochromia), hair color, skin color, height, body type.
    - Behavior: Attitude, body language, distinguishing marks or signs.
    - Personal Depth: Parental relationships, teachings, respect, hates, fears, contradictions, dreams, values, and anti-values.
    - Evolution: Track motivation, emotional, relationship, and dream evolution over time.
- **Image Upload**: Add a visual representation for your characters.
- **Completion Tracking**: A percentage indicates how much of a character's profile has been filled out, encouraging detailed development.
- **Management**: Easily edit or delete character profiles.

### World Building
- **Map Uploading**: Upload images for your world, continent, or regional maps.
- **Interactive Place Pinning**: Create detailed descriptions for places and pin them to specific locations on your uploaded maps.
- **Place Management**: Organize and manage all created places within your world.
- **Character-Location Linking**: Associate characters with specific places, helping to visualize their connections to the world.

### Gamification & Motivation
The application integrates gamification elements to motivate writers and make the writing process more engaging:
- **User Statistics**: Track various writing statistics, including:
    - Word Counts: Total, today, current week.
    - Creative Elements: Number of characters, places, events, and races created.
    - Writing Sessions: Number of completed sessions, total writing time.
    - Streaks: Daily writing goal streaks, overall writing streaks.
- **Achievements**: Unlock achievements based on writing progress (e.g., reaching word count milestones) and consistent use of creative tools (e.g., creating a certain number of characters).
- **Experience Points (XP) & Leveling**: Gain XP for writing and completing achievements, allowing you to level up.
- **Daily Goals**: Set daily word count goals and track your progress towards achieving them.

### Storyboard Planner / Event Management
- **Event Creation**: Plan and outline key story events with details such as:
    - Name and description.
    - Date or chronological order within the story.
    - Importance level (e.g., on a scale of 1-10).
- **Link Elements**: Connect events to relevant characters and locations, providing a clear overview of your plot points and their context.
- **Organized View**: Manage and sort events to better structure your narrative.

## Technologies

The BookBuilder Editor leverages a modern technology stack:

- **Frontend**:
    - React: A declarative, component-based JavaScript library for building user interfaces.
    - TypeScript: Adds static typing to JavaScript, improving code quality and maintainability.
    - TailwindCSS: A utility-first CSS framework for rapid UI development.
    - shadcn/ui: Re-usable UI components built with Radix UI and Tailwind CSS.
    - Vite: A fast frontend build tool and development server.
- **Backend**:
    - Node.js: A JavaScript runtime environment for server-side development.
    - Express.js: A minimalist and flexible Node.js web application framework.
    - TypeScript: Used for backend development as well, ensuring consistency.
- **Database**:
    - PostgreSQL: A powerful, open-source object-relational database system.
    - Drizzle ORM: A TypeScript ORM for SQL databases, providing a type-safe way to interact with the database.
- **Containerization**:
    - Docker: A platform for developing, shipping, and running applications in containers.
    - Docker Compose: A tool for defining and running multi-container Docker applications.
- **Other Key Libraries/Tools**:
    - Zod: For schema declaration and validation.
    - React Hook Form: For managing forms in React.
    - React Query (TanStack Query): For data fetching, caching, and state management.
    - Marked: For parsing Markdown to HTML.

## API Documentation

The BookBuilder Editor includes a comprehensive OpenAPI specification for its backend API. This specification details all available endpoints, their request and response schemas, and how to interact with them. Currently, authentication is simplified, with the API automatically using a default user for all operations.

The full OpenAPI 3.0 specification can be found in the `docs/openapi.yaml` file.

You can use tools like [Swagger Editor](https://editor.swagger.io/), [Swagger UI](https://swagger.io/tools/swagger-ui/), or other OpenAPI compatible tools to view, explore, and interact with the API documentation. These tools can provide a user-friendly interface to understand the API's capabilities.