# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Online Library Management System - Full stack application with:
- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose ODM)
- **Frontend**: React 19 + TypeScript + Vite + React Router + Bootstrap

### Architecture

**Backend** (`/backend`)
- Entry point: `src/index.ts` - Express server with CORS, cookie-parser, error handling middleware
- Route structure (prefix-based):
  - `/user-api/*` - User routes (UserRoutes.ts)
  - `/book-api/*` - Book routes (BookRoutes.ts)
  - `/admin-api/*` - Admin routes (AdminRoutes.ts)
  - `/transaction-api/*` - Transaction routes (TransactionRoutes.ts)
- Authentication: JWT tokens stored in HTTP-only cookies, verified via `verifyToken` middleware
- Database: MongoDB with Mongoose models (`UserModel`, `BookModel`, `TransactionModal`)
- Configuration: TypeScript strict mode, CommonJS modules, ts-node for dev

**Frontend** (`/frontend`)
- Entry point: `src/main.tsx` → `src/App.tsx` (React Router v7)
- Routing: `createBrowserRouter` with nested routes under `/`, `/user`, `/admin`
- State management: React Context providers in `src/store/` (Auth, Books, User)
- Services: API clients in `src/services/*` (user, admin, book, transaction)
- Styling: Bootstrap 5 + React Bootstrap + custom CSS in `src/css/`
- Testing: Jest + React Testing Library with jsdom

## Common Development Tasks

### Backend Commands
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with nodemon (ts-node)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled JavaScript from dist/
```

**Note**: Backend runs on port 8008 by default (`backend/.env` sets `PORT=8008`)

### Frontend Commands
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm test             # Run Jest tests
```

**Note**: Frontend runs on port 5173 by default.

## Environment Configuration

### Backend (`backend/.env`)
```
PORT=8008
DB_URI=mongodb+srv://libraryAdmin:xp6mxMj9xsPS3EVb@online-library-manageme.b69jozv.mongodb.net/OLMS?retryWrites=true&w=majority  # or MongoDB Atlas connection
SECRET=skkmdksmsssm
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8008
```

## Key File Locations

- **Backend Models**: `backend/src/models/*` (User, Book, Transaction)
- **Backend Controllers**: `backend/src/controllers/*` (UserControllers, BookControllers, AdminController, TransactionController)
- **Backend Routes**: `backend/src/routes/*` - define endpoint paths
- **Backend Types**: `backend/src/types/*.ts` - TypeScript interfaces
- **Backend Middleware**: `backend/src/middlewares/verifyToken.ts` - JWT verification

- **Frontend Pages**: `frontend/src/pages/*` (landingPage, userPage, adminPage)
- **Frontend Components**: `frontend/src/components/*` (common, admin, user)
- **Frontend Services**: `frontend/src/services/*` - API call functions
- **Frontend Store**: `frontend/src/store/*` - React Context providers
- **Frontend Types**: `frontend/src/types/*.ts` - TypeScript interfaces

- **API Testing**: `backend/userReq.http` - sample HTTP requests (can be used with REST Client extensions)

## Database Schema

### User (`UserModel`)
- Fields: `username`, `mobile`, `email`, `password` (hashed with bcrypt), `cart` (array of book ObjectIds), `borrowed_books` (embedded), `return_books` (embedded), `role` ("user"/"admin"), `status` (boolean), `fine` (number)
- Embedded: `BorrowedBookSchema` (bookId, borrowDate, dueDate, fine), `ReturnBookSchema` (bookId, borrowDate, returnDate, fine, method, transactionId)

### Book (`BookModel`)
- Fields: `title`, `genre`, `author`, `description`, `copies`, `availability`, `isbn`, `image`, `pages`, `published`, `rating`, `status` (boolean), `isDelete` (boolean)

### Transaction (`TransactionModal`)
- Refer to file for structure; used for payment and borrow/return history

## API Endpoints Reference

**User APIs** (`/user-api`)
- `POST /user` - Register new user
- `POST /userLogin` - Login (sets JWT in cookie)
- `GET /users` - Get all users (admin only)
- `PUT /update-user` - Update user profile (auth required)
- `PUT /cartAdd` - Add book to cart (auth required)
- `PUT /cartRemove` - Remove book from cart (auth required)
- `PUT /borrow-book` - Borrow a book (auth required)
- `PUT /return-book` - Return a book (auth required)
- `GET /user-logout` - Logout (clears cookie)
- `PUT /borrow-cart-books` - Borrow all cart books (auth required)

**Book APIs** (`/book-api`)
- `GET /books` - Get all books
- `POST /book` - Add new book (admin only)
- `PUT /book` - Update book (admin only)
- `DELETE /book/:id` - Delete book (admin only)

**Admin APIs** (`/admin-api`)
- `PUT /user-update` - Update user data (admin)
- `PUT /hold-user` - Hold/block user (admin)
- `PUT /delete-user` - Delete user (admin)

**Transaction APIs** (`/transaction-api`)
- `POST /transaction` - Create payment transaction
- `GET /read-transaction` - Read all transactions

**Utility**
- `GET /refresh` - Refresh token endpoint (auth required)

## Frontend API Consumption

Frontend services should consume APIs using the configured base URL and proper credentials handling:

### Configuration
- Base URL: `import.meta.env.VITE_API_URL` (defaults to `http://localhost:8008`)
- All API calls must include `{ credentials: 'include' }` to handle HTTP-only JWT cookies
- Response format: `{ success: boolean, message?: string, payload?: any, error?: string }`

### Service Organization
Organize API calls in `frontend/src/services/` by domain:
- `userService.ts` - Handles `/user-api/*` endpoints
- `bookService.ts` - Handles `/book-api/*` endpoints
- `adminService.ts` - Handles `/admin-api/*` endpoints
- `transactionService.ts` - Handles `/transaction-api/*` endpoints

### Example API Call Pattern
```typescript
// In any service file
const apiUrl = import.meta.env.VITE_API_URL;

export const fetchBooks = async () => {
  const response = await fetch(`${apiUrl}/book-api/books`, {
    credentials: 'include'
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch books');
  return data.payload;
};
```

## Testing

### Frontend Tests
- Tests located in: `frontend/src/testing/` and alongside components with `*.test.tsx` or `*.spec.tsx`
- Run all tests: `cd frontend && npm test`
- Jest config: `frontend/jest.config.cjs` uses ts-jest with jsdom environment

### Backend Tests
- Currently no test script configured (`npm run test` is placeholder). Consider adding Jest or Mocha/Chai tests.

## Authentication Flow

1. User registers/login via `/user-api/user` or `/user-api/userLogin`
2. Backend sets JWT in HTTP-only cookie named `token` (encrypted with `SECRET` env)
3. Frontend sends credentials: `fetch(..., { credentials: 'include' })`
4. Protected routes use `verifyToken` middleware to validate cookie and fetch fresh user data from DB
5. User data attached to `req.user`; role-based access handled in controllers

## Development Tips

- Frontend uses `import.meta.env.VITE_API_URL` for API base URL; defaults to `http://localhost:8008`
- Backend CORS configured for `http://localhost:5173` only; adjust if changing ports
- Both projects use TypeScript with strict checks; fix type errors before committing
- For database seeding or debugging, use `backend/userReq.http` with REST Client extension in VS Code
- Keep API services in `frontend/src/services` organized by domain (user, admin, book, transaction)
- Context providers wrap the app in `main.tsx` - check `AuthContextProvider` for auth state

## Important Conventions

- API responses follow `{ success: boolean, message?: string, payload?: any, error?: string }` pattern
- Use `express-async-handler` to avoid try-catch in route handlers
- Mongoose models use `strict: "throw"` - extra fields will throw errors
- All timestamps handled by Mongoose `timestamps: true` on User model
- Soft delete patterns: `isDelete` flag on books, `status` flag on users/books

## Deployment Notes

- Build backend: `cd backend && npm run build` → runs `tsc`, outputs to `backend/dist/`
- Build frontend: `cd frontend && npm run build` → outputs to `frontend/dist/`
- Frontend built files are static; serve via any static host (Vercel, Netlify, nginx)
- Backend must be deployed separately (Node.js server). Ensure `PORT`, `DB_URI`, `SECRET` env vars set.
- Set frontend `VITE_API_URL` to deployed backend URL
- CORS `origin` in backend should include deployed frontend domain
