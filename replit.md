# SONOFEST 2025 - Annual Festival Website

## Overview

SONOFEST 2025 is a festival website built with Flask that serves as a promotional landing page for an annual festival event. The application features a poster-style design with festival information, countdown timer, and navigation to various festival activities including ticket sales, chili cook-off entry, volunteer registration, and merchandise. Currently implemented as a minimal viable product with placeholder pages, the site is designed to be expanded with full functionality for each festival component.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Flask's built-in templating
- **Static Assets**: Organized into CSS and JavaScript files in the static directory
- **Responsive Design**: CSS-based responsive layout using viewport meta tags
- **Typography**: Google Fonts integration (Anton and Oswald font families)
- **Icons**: Font Awesome 6.0 for iconography
- **Interactive Elements**: Vanilla JavaScript for countdown functionality and button animations

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Application Structure**: Single-file Flask application (app.py) with modular entry point (main.py)
- **Routing**: Simple route handlers for festival sections (tickets, chili-entry, volunteer, merch, faq, contact)
- **Session Management**: Flask sessions with configurable secret key
- **Development Mode**: Debug mode enabled for development environment

### Design Patterns
- **MVC Pattern**: Separation of concerns with routes (controllers), templates (views), and minimal data handling
- **Template Inheritance**: Single base template (index.html) reused across all routes
- **Message System**: Dynamic message banner system for user notifications
- **Progressive Enhancement**: Basic HTML structure enhanced with CSS styling and JavaScript interactions

### Development Environment
- **Hot Reload**: Flask debug mode for automatic reloading during development
- **Environment Configuration**: Environment variable support for session secrets
- **Static File Serving**: Flask's built-in static file serving for CSS, JS, and assets

## External Dependencies

### Frontend Libraries
- **Google Fonts API**: Typography (Anton and Oswald font families)
- **Font Awesome CDN**: Icon library (version 6.0.0)

### Python Framework
- **Flask**: Core web framework for routing and templating

### Development Tools
- **Environment Variables**: SESSION_SECRET for production security

### Planned Integrations
- **Payment Processing**: Ticket sales system (not yet implemented)
- **Registration System**: Volunteer and chili cook-off entry forms (not yet implemented)
- **E-commerce**: Merchandise store functionality (not yet implemented)
- **Content Management**: FAQ and contact information systems (not yet implemented)