# Design Guidelines for Personal Finance Management Application

## Design Approach
**System:** Custom dark-themed financial dashboard
**Rationale:** Utility-focused application prioritizing data clarity, extended screen time comfort, and professional financial management aesthetics. The existing design system is well-established and should be preserved while fixing bugs and optimizing performance.

## Core Design Principles
1. **Data First**: Information hierarchy prioritizes financial data visibility and comprehension
2. **Dark Mode Optimized**: Reduced eye strain for extended financial review sessions
3. **Professional Trust**: Clean, sophisticated interface that conveys financial competence
4. **Efficient Navigation**: Quick access to all financial tools through persistent tab navigation

## Color Palette

### Dark Mode Colors (Primary)
- **Background**: 19 8% 11% (space-bg: #131120)
- **Card Background**: 30 27% 18% (space-card: #1E1B2E)
- **Border**: 37 30% 36% (space-border: #37305A)
- **Primary Text**: 0 0% 88% (space-text: #E0E0E0)
- **Secondary Text**: 45 24% 71% (space-text-secondary: #8A81B4)

### Brand Accent Colors
- **Primary Accent**: 270 60% 77% (brand-accent: #A78BFA)
- **Accent Hover**: 270 67% 85% (brand-accent-hover: #C4B5FD)
- **Gradient**: Linear gradient from #A78BFA to #C4B5FD for emphasis elements

### Functional Colors
- **Success/Income**: Green tones (to be specified in implementation)
- **Warning/Budget Alert**: Amber tones
- **Error/Expense**: Red/pink tones
- **Neutral/Disabled**: Gray-400 to Gray-600 range

## Typography
**Font Family**: Inter (Google Fonts)
**Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

### Type Scale
- **Page Title**: 2rem (32px) / 2.25rem (36px) on mobile, ExtraBold, gradient text effect
- **Section Headers**: 1.5rem (24px), SemiBold
- **Card Titles**: 1.125rem (18px), SemiBold
- **Body Text**: 0.95rem (15.2px), Regular
- **Labels/Metadata**: 0.875rem (14px), Medium
- **Small Text**: 0.75rem (12px), Regular

## Layout System
**Spacing Units**: Tailwind standard units (4, 6, 8, 12, 16, 20, 24, 32)
- Primary padding: p-4 (mobile), p-6 (tablet), p-8 (desktop)
- Card padding: p-6
- Section gaps: gap-6 (standard), gap-8 (large sections)
- Container: max-width container with responsive padding

### Grid Patterns
- **Dashboard Cards**: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- **Transaction Lists**: Single column, full-width cards
- **Account Cards**: 1-2-3 column responsive grid
- **Budget/Goal Cards**: 1-2 column responsive grid

## Component Library

### Navigation
- **Tab Navigation**: Horizontal scroll on mobile, persistent border-bottom indicator
- **Space Switcher**: Compact pill buttons with active state glow effect
- **Active State**: Accent color border-bottom (2px), increased font-weight (600)

### Cards
- **Background**: space-card color
- **Border**: 1px solid space-border
- **Border Radius**: 0.75rem (12px)
- **Padding**: 1.5rem (24px)
- **Hover**: Subtle border color shift to accent (optional for interactive cards)

### Buttons
**Primary Button**:
- Background: brand-accent
- Text: White, weight 600
- Padding: 0.75rem 1.25rem
- Border-radius: 0.5rem
- Shadow: 0 4px 15px -5px rgba(167, 139, 250, 0.4)
- Hover: Lift transform (-2px), increased shadow, lighter background

**Secondary Button**:
- Background: Transparent
- Border: 1px solid space-border
- Text: space-text, weight 500
- Hover: space-card background, accent border

**Disabled State**: Gray background, reduced opacity, no interactions

### Form Inputs
- **Background**: space-bg
- **Border**: 1px solid space-border
- **Padding**: 0.75rem 1rem
- **Border-radius**: 0.5rem
- **Focus State**: Accent border, 2px accent shadow ring
- **Select Dropdowns**: Custom arrow icon, matching input styling

### Modals
- **Backdrop**: Semi-transparent dark overlay
- **Container**: space-card background, rounded corners
- **Max-height**: 90vh with scroll
- **Close Interactions**: Click outside backdrop, Escape key
- **Padding**: 1.5rem to 2rem

### Data Visualization
- **Charts**: Chart.js with dark theme configuration
- **Container Height**: 280px standard
- **Colors**: Use accent colors for primary data, complementary colors for categories
- **Grid Lines**: Subtle, low-opacity space-border color

### Progress Bars
- **Background**: space-border color
- **Fill**: brand-accent with glow shadow
- **Height**: 0.5rem to 0.75rem
- **Animation**: Smooth width transition (0.5s ease-in-out)
- **Border-radius**: Fully rounded

### Loading States
- **Skeleton Screens**: space-card background with pulse animation
- **Animation**: 2s cubic-bezier pulse, 50% opacity variation
- **Shapes**: Match final content layout

### Notifications
- **Position**: Fixed top, full-width
- **Colors**: Context-based (success, error, info)
- **Animation**: Slide down from top
- **Duration**: Auto-dismiss or manual close

## Responsive Behavior
- **Mobile First**: Base styles for mobile, progressive enhancement
- **Breakpoints**: sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- **Navigation**: Horizontal scroll on mobile, full visibility on tablet+
- **Grids**: Stack to single column on mobile, expand on larger screens
- **Typography**: Slightly reduced sizes on mobile for space efficiency

## Accessibility
- **Color Contrast**: Ensure WCAG AA compliance for all text on dark backgrounds
- **Focus Indicators**: Visible accent-colored focus rings
- **Keyboard Navigation**: Full tab navigation support
- **ARIA Labels**: Proper labeling for navigation and interactive elements
- **Screen Reader**: Semantic HTML structure

## Performance Optimizations
- **Lazy Loading**: Defer chart rendering until tab is active
- **Debounced Inputs**: Reduce re-renders on form input changes
- **Virtualization**: Consider for long transaction lists
- **CSS**: Minimize animation complexity, use transform/opacity
- **Caching**: LocalStorage for user preferences and data persistence

## Images
**No images required** for this application. The interface relies entirely on data visualization, typography, and UI components. Charts and graphs serve as the visual focal points.