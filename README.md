# Highway Delite - Modern Note-Taking Application

A full-stack, feature-rich note-taking application built with Next.js 15, TypeScript, and modern web technologies. This application provides a seamless experience for creating, organizing, and managing personal notes with rich text editing capabilities.

##  Features

### Core Functionality
- **Rich Text Editor**: Advanced text editing with formatting options (bold, italic, underline, headings, lists, alignment, highlighting)
- **Note Management**: Create, read, update, and delete notes
- **Search & Filter**: Real-time search through note titles and content
- **Pin Notes**: Pin important notes to the top for quick access
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

### Authentication & Security
- **Multi-Provider Authentication**: 
  - Google OAuth integration
  - Email-based OTP authentication with secure verification
- **Session Management**: Secure JWT-based sessions with NextAuth.js
- **Route Protection**: Middleware-based authentication guards
- **Email Verification**: DNS validation and secure OTP delivery

### User Experience
- **Dark/Light Theme**: Toggle between themes with persistent preferences
- **Real-time Updates**: Instant feedback with toast notifications
- **Modern UI**: Clean, intuitive interface built with Radix UI components
- **Keyboard Shortcuts**: Efficient note management with keyboard navigation

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icon library
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Type-safe database ORM
- **MongoDB**: NoSQL database
- **NextAuth.js**: Authentication framework

### Authentication & Email
- **Google OAuth**: Social login integration
- **Nodemailer**: Email delivery service
- **OTPLib**: One-time password generation and validation
- **DNS Resolution**: Email domain validation

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Class Variance Authority**: Component variant management

## 📁 Project Structure

project-highway-delite/
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── api/ # API routes
│ │ │ ├── auth/ # Authentication endpoints
│ │ │ └── notes/ # Note CRUD operations
│ │ ├── signin/ # Sign-in page
│ │ ├── signup/ # Sign-up page
│ │ ├── globals.css # Global styles
│ │ ├── layout.tsx # Root layout
│ │ └── page.tsx # Main notes dashboard
│ ├── components/ # React components
│ │ ├── ui/ # Reusable UI components
│ │ ├── Note-Card.tsx # Note display component
│ │ ├── rich-text-editor.tsx # Rich text editor
│ │ ├── theme-customizer.tsx # Theme toggle
│ │ └── SessionProvider.tsx # Auth session provider
│ ├── lib/ # Utility libraries
│ │ ├── auth.ts # NextAuth configuration
│ │ ├── email-config.ts # Email service setup
│ │ ├── email-verification.ts # OTP verification logic
│ │ ├── prisma.ts # Database client
│ │ └── utils.ts # Utility functions
│ └── middleware.ts # Route protection middleware
├── prisma/
│ └── schema.prisma # Database schema
├── public/ # Static assets
└── generated/ # Generated Prisma client

## ��️ Database Schema

The application uses MongoDB with the following data models:

### User Model
```prisma
model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String
  email         String   @unique
  emailVerified DateTime?
  image         String?
  notes         Note[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Note Model
```prisma
model Note {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  content   String
  isPinned  Boolean @default(false)
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google OAuth credentials (for social login)
- SMTP email service (for OTP delivery)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-highway-delite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/highway-delite"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Authentication Flow

### Email OTP Authentication
1. User enters email address
2. System validates email domain using DNS resolution
3. OTP is generated and sent via email
4. User enters OTP for verification
5. Upon successful verification, user is authenticated

### Google OAuth
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After authorization, user is redirected back
4. Account is created/linked and user is authenticated

## �� API Endpoints

### Notes API
- `GET /api/notes` - Fetch user's notes
- `POST /api/notes` - Create new note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Authentication API
- `POST /api/auth/signin` - Sign in with credentials
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-email` - Send verification email

## �� Customization

### Themes
The application supports dark and light themes. Theme preferences are persisted across sessions.

### Rich Text Editor
The rich text editor supports:
- Text formatting (bold, italic, underline)
- Headings (H1, H2)
- Lists (ordered and unordered)
- Text alignment
- Text highlighting
- Blockquotes

## 🔒 Security Features

- **JWT-based Sessions**: Secure session management
- **Route Protection**: Middleware guards protected routes
- **Email Validation**: DNS-based email domain verification
- **OTP Security**: Time-limited, attempt-limited OTP verification
- **CSRF Protection**: Built-in NextAuth.js CSRF protection
- **Input Validation**: Zod schema validation for all inputs

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## �� Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Prisma](https://prisma.io/) for the excellent ORM
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework