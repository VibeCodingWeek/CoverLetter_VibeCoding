# Project Structure

This project follows a well-organized component-based architecture for better maintainability and scalability.

## Directory Structure

```
src/
├── components/                 # All React components
│   ├── Homepage/              # Homepage component module
│   │   ├── index.js          # Export file for cleaner imports
│   │   ├── Homepage.js       # Homepage component logic
│   │   └── Homepage.css      # Homepage-specific styles
│   ├── CoverLetterGenerator/  # Cover Letter Generator module
│   │   ├── index.js          # Export file for cleaner imports
│   │   ├── CoverLetterGenerator.js  # Component logic
│   │   └── CoverLetterGenerator.css # Component-specific styles
│   ├── InterviewPrep/         # Interview Preparation module
│   │   ├── index.js          # Export file for cleaner imports
│   │   ├── InterviewPrep.js  # Component logic
│   │   └── InterviewPrep.css # Component-specific styles
│   ├── ResumeBuilder/         # Resume Builder module
│   │   ├── index.js          # Export file for cleaner imports
│   │   ├── ResumeBuilder.js  # Component logic
│   │   └── ResumeBuilder.css # Component-specific styles
│   ├── JobTracker/            # Job Application Tracker module
│   │   ├── index.js          # Export file for cleaner imports
│   │   ├── JobTracker.js     # Component logic
│   │   └── JobTracker.css    # Component-specific styles
│   ├── SalaryInsights/        # Salary Research module
│   │   ├── index.js          # Export file for cleaner imports
│   │   ├── SalaryInsights.js # Component logic
│   │   └── SalaryInsights.css # Component-specific styles
│   └── NetworkingTips/        # Networking Tips module
│       ├── index.js          # Export file for cleaner imports
│       ├── NetworkingTips.js # Component logic
│       └── NetworkingTips.css # Component-specific styles
├── styles/                    # Shared styling
│   └── globals.css           # Global styles and shared utilities
├── App.js                    # Main application component
├── App.css                   # App-level styles
└── index.js                  # Application entry point
```

## Component Organization

### Homepage Component (`/components/Homepage/`)
- **Purpose**: Main landing page with navigation menu
- **Features**: Hero section, tool cards, feature highlights
- **Styling**: Self-contained CSS with animations and responsive design
- **Dependencies**: None (standalone component)

### CoverLetterGenerator Component (`/components/CoverLetterGenerator/`)
- **Purpose**: Form-based cover letter creation and preview
- **Features**: Multi-section form, live preview, PDF export
- **Styling**: Component-specific styles for forms and preview
- **Dependencies**: jsPDF for PDF generation

### InterviewPrep Component (`/components/InterviewPrep/`)
- **Purpose**: Interview question practice and preparation tool
- **Features**: Question categories, practice sessions, timer, tips, progress tracking
- **Styling**: Component-specific styles for practice interface
- **Dependencies**: None (localStorage for data persistence)

### ResumeBuilder Component (`/components/ResumeBuilder/`)
- **Purpose**: Comprehensive resume building with multiple sections
- **Features**: Step-by-step builder, templates, live preview, PDF export
- **Styling**: Professional design with step navigation
- **Dependencies**: jsPDF for PDF generation

### JobTracker Component (`/components/JobTracker/`)
- **Purpose**: Job application management and tracking system
- **Features**: Application CRUD, status tracking, analytics, filtering, export
- **Styling**: Dashboard-style interface with data visualization
- **Dependencies**: None (localStorage for data persistence)

### SalaryInsights Component (`/components/SalaryInsights/`)
- **Purpose**: Salary research and comparison tool
- **Features**: Salary lookup, comparison, market insights, search history
- **Styling**: Data-focused design with charts and cards
- **Dependencies**: None (mock data for demonstration)

### NetworkingTips Component (`/components/NetworkingTips/`)
- **Purpose**: Professional networking guidance and contact management
- **Features**: Tips, message templates, contact tracking, networking goals
- **Styling**: Content-rich design with forms and cards
- **Dependencies**: None (localStorage for data persistence)

## Styling Architecture

### Global Styles (`/styles/globals.css`)
- CSS reset and base styling
- Shared button components (`.btn-primary`, `.btn-secondary`)
- Global animations (`@keyframes`)
- Responsive utilities

### Component Styles
- Each component has its own CSS file
- Scoped to component-specific classes
- No style conflicts between components

### App Styles (`App.css`)
- Minimal app-level styling
- Container and layout styles only

## Features by Component

### Homepage
- **Hero Section**: Animated welcome with floating elements
- **Tool Cards**: Interactive cards with hover effects
- **Features Grid**: Platform benefits showcase
- **Navigation**: Routes to different tools

### Cover Letter Generator
- **Form Management**: Multi-section form with validation
- **Live Preview**: Real-time cover letter generation
- **PDF Export**: Download formatted PDF documents
- **Data Persistence**: LocalStorage for form data

### Interview Prep
- **Question Categories**: Behavioral, Technical, General, Company-specific
- **Practice Sessions**: Timed practice with answer recording
- **Progress Tracking**: Practice history with timestamps
- **Tips & Guidelines**: Interview success strategies
- **Timer Function**: Practice timing for realistic preparation

### Resume Builder
- **Step Navigation**: 6-step building process (Personal, Experience, Education, Skills, Projects, Certifications)
- **Template System**: Multiple design templates
- **Live Preview**: Real-time resume rendering
- **PDF Export**: Professional PDF generation
- **Data Persistence**: Auto-save functionality

### Job Tracker
- **Application Management**: Full CRUD operations for job applications
- **Status Tracking**: 6 different application statuses with visual indicators
- **Analytics Dashboard**: Statistics and progress visualization
- **Filtering & Sorting**: Dynamic data filtering and organization
- **Data Export**: JSON export functionality

### Salary Insights
- **Salary Research**: Job title, location, and experience-based lookups
- **Comparison Tool**: Side-by-side salary comparisons
- **Market Insights**: Industry trends and negotiation tips
- **Search History**: Saved searches with comparison features

### Networking Tips
- **Expert Guidance**: Categorized networking strategies
- **Message Templates**: Professional communication templates
- **Contact Management**: Professional network tracking
- **Goal Setting**: Networking objectives with progress tracking

## Data Management

All components use **localStorage** for client-side data persistence:
- **Cover Letters**: Form data auto-saved
- **Interview Practice**: Question history and answers
- **Resume Data**: All resume sections and progress
- **Job Applications**: Complete application database
- **Salary Searches**: Search history and comparisons
- **Network Contacts**: Professional contacts and goals

## Benefits of This Structure

1. **Maintainability**: Each component is self-contained with its own styles
2. **Scalability**: Easy to add new components without affecting existing ones
3. **Reusability**: Components can be easily moved or reused
4. **Clear Separation**: Styles are logically separated by component responsibility
5. **Clean Imports**: Index files provide cleaner import statements
6. **Feature Isolation**: Each tool operates independently
7. **Data Persistence**: Client-side storage without backend dependency

## Adding New Components

1. Create a new folder in `/components/`
2. Add component file, CSS file, and index.js
3. Follow the existing naming conventions
4. Update App.js routing
5. Update Homepage navigation if needed
6. Import and use in parent components

## Best Practices

- Keep component styles scoped to the component
- Use shared styles from `globals.css` for common elements
- Maintain consistent naming conventions
- Document component purpose and dependencies
- Use localStorage for client-side data persistence
- Follow React hooks best practices for state management
- Implement responsive design for all screen sizes
- Use semantic HTML and accessibility best practices 