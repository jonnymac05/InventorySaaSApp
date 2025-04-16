# Inventory Management SaaS Platform

A multi-tenant inventory management SaaS platform designed for efficient asset tracking and organizational management across departments and companies.

## Features

- **Multi-tenant Architecture**: Complete data isolation between different companies
- **User Management**: Admin and employee roles with permission-based access control
- **Department Management**: Organize inventory by departments with capacity tracking
- **Inventory Tracking**: Full inventory lifecycle management with status tracking
- **Activity Logging**: Track all inventory-related actions for audit purposes
- **Responsive Design**: Mobile-friendly interface using modern web technologies
- **Cross-Platform Compatibility**: Works on both Windows and Linux environments

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: shadcn/ui (based on Radix UI)
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state, React Context for app state
- **Routing**: wouter for lightweight client-side routing
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM with Zod validation
- **Authentication**: Session-based auth with Passport.js

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database (or use the Neon serverless option)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd inventory-management-saas
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Cross-Platform Compatibility

This application is designed to work seamlessly on both Windows and Linux environments:

- **Path Handling**: All file paths use cross-platform compatible patterns
- **Database Connection**: PostgreSQL drivers work on all major operating systems
- **Development Environment**: All development scripts are OS-agnostic
- **Deployment**: Can be deployed to any platform that supports Node.js and PostgreSQL

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/                
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and shared logic
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
├── server/                 # Backend Express application
│   ├── auth.ts             # Authentication logic
│   ├── db.ts               # Database connection setup
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite integration for server
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and validation
└── drizzle.config.ts       # Drizzle ORM configuration
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Log in a user
- `POST /api/logout` - Log out a user
- `GET /api/user` - Get current user information

### Inventory Management
- `GET /api/inventory` - Get all inventory items for the company
- `GET /api/inventory/:id` - Get a specific inventory item
- `POST /api/inventory` - Create a new inventory item
- `PUT /api/inventory/:id` - Update an inventory item
- `DELETE /api/inventory/:id` - Delete an inventory item

### Department Management
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create a new department

### Activity Logs
- `GET /api/activity` - Get activity logs

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Future Enhancements

- Barcode/QR code scanning for inventory items
- Advanced reporting and analytics
- Export functionality (CSV, PDF)
- Photo uploads for inventory items
- Mobile application
- Integration with third-party services (Stripe, shipping providers)
- Automated inventory alerts and notifications

## Contribution

We welcome contributions! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.