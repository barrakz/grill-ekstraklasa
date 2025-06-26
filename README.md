# Grill Ekstraklasa

A modern web application for rating and discussing Polish Ekstraklasa football players. This platform allows users to rate players, view statistics, and engage in discussions about Polish league football.

## Technology Stack

### Backend

- **Framework**: Django 4.2 with Django REST Framework for RESTful API
- **Database**: PostgreSQL 15
- **Authentication**: Django's built-in authentication with REST tokens
- **API Documentation**: Swagger/OpenAPI via drf-yasg
- **Image Storage**: AWS S3 via django-storages and boto3
- **Testing**: pytest
- **Code Quality**: black, isort for code formatting
- **API Features**: Filtering, pagination, Markdown support

### Frontend

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: HeroIcons
- **Language**: TypeScript
- **Linting**: ESLint 9

### DevOps

- **Containerization**: Docker with multi-container setup via Docker Compose
- **Deployment**: AWS EC2
- **Domain Management**: Custom domain with DuckDNS alternative
- **Environment Management**: Python decouple for environment variables
- **Server**: Gunicorn as WSGI HTTP server
- **CI/CD**: Environment-based configuration with separate dev/prod settings
- **Database Management**: PostgreSQL container with persistent volume

## Core Features

- **Player Database**: Comprehensive database of Ekstraklasa football players
- **Club Management**: Team profiles with associated players
- **Player Rating System**: User-based rating system with average scores
- **Comments**: Discussion forum for each player
- **User Authentication**: Secure login and registration
- **Responsive Design**: Mobile-friendly interface
- **Real-time Chat**: Discussion functionality
- **Search & Filtering**: Advanced player search by club, position, and name
- **Performance Optimization**: Database indexes for efficient queries

## Project Structure

The project follows a microservice-like architecture with separate backend and frontend applications:

- **Backend**: Django REST API with multiple specialized apps
- **Frontend**: Next.js React application consuming the API

## Status

This project is actively maintained and developed, with regular updates to both functionality and the technology stack.
