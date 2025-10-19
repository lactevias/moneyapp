# Overview

This is a personal finance management application built for a user named Nina who manages finances across multiple currencies (RUB, GEL, USD, KZT, USDT). The application provides comprehensive financial tracking including transactions, accounts, budgets, goals, savings, and payment planning across two distinct spaces: Personal and Business.

The application uses a modern React frontend with shadcn/ui components, styled with a custom dark-themed design system optimized for extended financial review sessions. The backend is a minimal Express.js server currently using in-memory storage, designed to be connected to a PostgreSQL database via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript  
**Build Tool**: Vite  
**Styling**: Tailwind CSS with custom design tokens  
**UI Components**: shadcn/ui (Radix UI primitives)  
**State Management**: React hooks with @tanstack/react-query for server state  
**Routing**: Currently client-side only, no routing library detected

### Design System

The application uses a custom dark-themed design system defined in `design_guidelines.md`:

- **Color Palette**: Dark mode optimized with custom space-themed colors (space-bg, space-card, space-border) and purple brand accent (#A78BFA)
- **Typography**: Inter font family with weights from 300-800
- **Layout**: Responsive grid system using Tailwind's standard spacing units
- **Component Library**: Fully integrated shadcn/ui components with custom theming

### Navigation & Layout

**Sidebar Navigation**: Shadcn sidebar component with:
- Collapsible mobile-responsive design
- Separate menu items for Personal and Business spaces
- Tools section (AI Assistant, Currency Converter, Settings)
- Persistent sidebar state across sessions
- Full keyboard navigation support

### Key Frontend Features

1. **Multi-Space Support**: Separate views for Personal and Business finances
2. **Multi-Currency Support**: Handles RUB, GEL, USD, KZT, and USDT with live exchange rates
3. **AI Financial Assistant**: 
   - Powered by OpenAI GPT-4o-mini via Replit AI Integrations
   - Context-aware personalized financial advice
   - Understanding of Nina's esoteric/energy perspective on money
   - Supports both Personal and Business contexts
4. **Dashboard Views**: 
   - Enhanced personal dashboard with multi-currency aggregation
   - Comprehensive business dashboard with health metrics
5. **Financial Tracking Components**:
   - Transaction management with income/expense categorization
   - Account cards supporting regular, crypto, and savings accounts
   - Budget tracking with visual progress indicators
   - Goal management with savings targets
   - Payment calendar with recurring payment support
   - Money flow tracker showing transfers between accounts
   - Currency converter with live exchange rates (accessible via sidebar)

### Component Organization

Components are organized in `/client/src/components/`:
- **Navigation**: AppSidebar (main navigation), FinanceHeader (space switcher)
- **Core finance**: AccountCard, BudgetCard, TransactionList, MoneyFlow, etc.
- **Dashboards**: EnhancedDashboard (Personal), EnhancedBusinessDashboard (Business)
- **AI**: AIAssistant component with chat interface
- **Tools**: CurrencyConverter, PaymentCalendar, EnhancedSavings
- **UI components**: shadcn/ui library in `/ui/` subdirectory

## Backend Architecture

**Framework**: Express.js  
**Runtime**: Node.js with TypeScript  
**ORM**: Drizzle ORM configured for PostgreSQL  
**Session Management**: Prepared for connect-pg-simple (PostgreSQL session store)

### Current Implementation

The backend is minimal with in-memory storage (`MemStorage` class in `server/storage.ts`):

- **User Management**: Basic CRUD operations for users (create, get by ID, get by username)
- **Storage Interface**: Abstracted through `IStorage` interface for easy swapping to database implementation
- **API Routes**: 
  - `/api/ai-assistant` - POST endpoint for AI financial advice
  - Placeholder structure in `server/routes.ts` for future endpoints
- **AI Integration**: OpenAI client configured with Replit AI Integrations (server/ai.ts)
- **Development Server**: Vite integration for HMR in development mode

### Database Schema (Prepared)

Defined in `shared/schema.ts` using Drizzle ORM:

```typescript
users table:
  - id: UUID (primary key, auto-generated)
  - username: text (unique, not null)
  - password: text (not null)
```

Schema uses `drizzle-zod` for validation schemas and type inference.

### Migration Strategy

- Migrations configured to output to `/migrations` directory
- Database connection via `DATABASE_URL` environment variable
- Push command available: `npm run db:push`

## Project Structure

```
/client          - React frontend
  /src
    /components  - React components
      /ui        - shadcn/ui component library
    /hooks       - Custom React hooks
    /lib         - Utility functions and client libraries
    /pages       - Page components
/server          - Express backend
/shared          - Shared TypeScript types and schemas
/attached_assets - Legacy HTML files (Russian language, not used in current app)
```

## Build and Deployment

**Development**: `npm run dev` - Runs TypeScript Express server with Vite HMR  
**Build**: `npm run build` - Vite frontend build + esbuild backend bundle  
**Production**: `npm start` - Runs bundled Express server serving static frontend

The build process:
1. Vite builds React frontend to `/dist/public`
2. esbuild bundles Express server to `/dist/index.js`
3. Production server serves static files from `/dist/public`

## Key Architectural Decisions

### 1. In-Memory to Database Migration Path

**Current**: In-memory storage via Map-based implementation  
**Planned**: PostgreSQL with Drizzle ORM  
**Rationale**: Quick prototyping with clear migration path through storage interface abstraction

### 2. Multi-Currency Architecture

**Implementation**: Client-side currency conversion with live exchange rates from exchangerate.host API  
**Default Rates**: Fallback rates stored in `lib/currency.ts`  
**Base Currency**: RUB used for aggregations and comparisons  
**Rationale**: User operates across Russia, Georgia, Kazakhstan with crypto holdings

### 3. Component-First UI Architecture

**Approach**: Atomic design with shadcn/ui as foundation  
**Customization**: Heavy theming via CSS variables and Tailwind config  
**Rationale**: Rapid development with consistent design system, easy maintenance

### 4. Type-Safe Full-Stack

**Shared Types**: Schema definitions in `/shared` used by both frontend and backend  
**Validation**: Zod schemas derived from Drizzle schema definitions  
**Rationale**: Single source of truth for data structures, compile-time safety

# Recent Changes (October 2025)

## Major UI/UX Improvements
- **Sidebar Navigation**: Replaced horizontal tabs with collapsible sidebar for better organization and mobile support
- **Mobile Responsive**: Full mobile adaptation with hamburger menu and responsive layouts
- **Currency Converter**: Moved to sidebar tools menu to eliminate duplication

## AI Integration
- **AI Financial Assistant**: Integrated OpenAI GPT-4o-mini via Replit AI Integrations
  - No API key required (uses Replit credits)
  - Context-aware advice based on current financial state
  - Personalized for Nina's esoteric perspective on money as energy
  - Available in both Personal and Business spaces

## Enhanced Business Dashboard
- **Business Health Metrics**: Visual health score with progress indicator
- **Cash Flow Tracking**: Detailed breakdown of revenue, expenses, taxes, and salaries
- **Assistant Salary Calculator**: НДФЛ calculations and total cost estimation
- **6% Tax Calculator**: Quick tax calculations for self-employment income
- **Entrepreneur Tools**: 3 built-in calculators (tax, pricing, net profit)
- **Personal Withdrawal Tracker**: Shows available funds for personal use vs business reserves
- **300k RUB/month Goal**: Detailed goal tracker with service pricing breakdown
  - Progress visualization for each service type
  - Units needed to achieve monthly target
  - Actionable recommendations for goal achievement

## Multi-Currency Enhancements
- **Proper Aggregation**: All financial totals correctly convert to RUB using exchange rates
- **Currency Utilities**: Shared `lib/currency.ts` for consistent multi-currency calculations
- **Per-Currency Breakdown**: Total balance card shows badges for each currency

## Money Transfer Management (October 19, 2025)
- **Full CRUD Transfer System**: Complete money transfer management with add/edit/delete functionality
  - MoneyTransfer type added to types.ts with space field for proper separation
  - Transfer dialog with validation (prevents identical source/target accounts, requires positive amounts)
  - Space-based filtering ensures Personal and Business transfers stay separated
  - localStorage persistence with automatic space preservation during edits
- **MoneyFlow Component Updates**: Enhanced with interactive edit/delete buttons
  - "Add Transfer" button for quick transfer creation
  - Edit and delete buttons on each transfer item
  - Proper sorting by date with real-time updates
- **Date Serialization Fix**: Critical fix for localStorage persistence
  - Automatic date conversion from strings to Date objects on load
  - Applied to all entities with Date fields: transactions, goals, transfers, plannedPayments
  - Prevents runtime errors when sorting/formatting dates after page reload
  - Uses useMemo pattern to efficiently convert dates without performance impact

## Advanced Transaction & Payment Features (October 19, 2025)
- **Planned Payment Confirmation Workflow**: 
  - Added `status?: 'planned' | 'confirmed'` field to PlannedPayment type
  - PaymentCalendar displays visual status indicators (green badges for confirmed payments)
  - Confirmation button workflow with disabled state after confirmation
  - Status affects calculations and financial forecasts
- **Transaction Dialog UX Improvement**:
  - Added `max-h-[80vh] overflow-y-auto` to DialogContent for proper scrolling
  - Prevents content overflow on smaller viewports
  - Maintains accessibility of all form fields
- **Live Currency Auto-Conversion**:
  - Added `transactionCurrency?: string` field to Transaction type
  - Hourly exchange rate fetching from exchangerate-api.com API
  - `convertCurrency()` function in lib/currency.ts for real-time conversion
  - Automatic conversion when transaction currency differs from account currency
  - Toast notifications show conversion details to user
  - Proper handling in both saveTransaction and deleteTransaction flows
  - Live rates used for all balance calculations (not hardcoded defaults)
- **Payment Calendar Localization**:
  - Calendar weeks now start on Monday (ISO 8601 standard)
  - Calculation: `startingDayOfWeek = (firstDay.getDay() + 6) % 7`
  - Matches European/Russian calendar conventions
- **Fee/Commission Support**:
  - Added optional `fee?: number` field to Transaction and MoneyTransfer types
  - UI input fields in both transaction and transfer dialogs
  - Fee always applied in account currency
  - For expenses: fee adds to total deduction from balance
  - For income: fee does not affect income amount (separate deduction)
  - Proper fee rollback on transaction/transfer edit and delete
- **Required Expense Categories**:
  - Added `isRequired?: boolean` field to Category type
  - Checkbox UI in Category Dialog for marking categories as required/optional
  - Auto-created categories default to `isRequired: false`
  - Enables future budget planning features to identify essential vs discretionary expenses
  - Full backward compatibility: existing categories without isRequired flag work seamlessly

# External Dependencies

## Database

**PostgreSQL** (configured, not yet connected)
- Connection: `@neondatabase/serverless` driver for Neon/Postgres
- ORM: Drizzle ORM v0.39.1
- Session Store: connect-pg-simple (for Express sessions)

## Third-Party APIs

**Replit AI Integrations**: OpenAI GPT-4o-mini
- Purpose: AI-powered financial advice and chat assistant
- Integration: Managed by Replit (no API key required, uses Replit credits)
- Model: gpt-4o-mini via Replit AI gateway
- Usage: Chat completions for personalized financial guidance

**Exchange Rate Service**: exchangerate.host
- Purpose: Live currency conversion rates for RUB, GEL, USD, KZT
- Fallback: Hardcoded default rates in client code
- Update Frequency: Hourly (configured in CurrencyConverter component)

## Frontend Dependencies

- **React Query** (@tanstack/react-query): Server state management
- **Radix UI**: Accessible component primitives (via shadcn/ui)
- **Tailwind CSS**: Utility-first styling
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Component variant styling
- **Lucide React**: Icon library
- **React Icons**: Additional icons (used for Google Calendar integration)

## Development Tools

- **TypeScript**: Type safety across entire stack
- **Vite**: Frontend build tool and dev server
- **esbuild**: Backend bundling for production
- **Drizzle Kit**: Database migrations and schema management
- **Replit Plugins**: Runtime error modal, cartographer, dev banner (development only)

## Potential Integrations

Based on component code:
- **Google Calendar**: Payment calendar sync functionality prepared (`onSyncGoogleCalendar` prop)
- **Chart.js**: Referenced in legacy HTML files, not currently used but may be needed for visualizations