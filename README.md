# User Management System (Task #4)

This is a training project built with React (TS + Bootstrap), Node.js (Express), and PostgreSQL (Prisma).
The main goal was to implement a secure authentication flow and a responsive admin panel.

**Deployed App:** [https://task4.miskaris.com](https://task4.miskaris.com)  
_(Feel free to register a new user to test the email verification flow)_

## Features

- **Authentication:** Registration with email verification (sending real emails).
- **User Management:** Admin panel to Block, Unblock, Delete and remove unverified users.
- **Security:**
    - Database-level `UNIQUE` constraints for emails (no race conditions).
    - Immediate logout/redirection if the current user is blocked or deleted.
- **Tech Stack:** React, Express, Prisma (PostgreSQL), Docker Compose.

## How to run locally

The project is fully containerized.

1. Clone the repository.
2. Rename `.env.example` to `.env`.
   (double check the values and enter those that apply to your situation)
3. Run with Docker Compose:
    ```bash
    docker-compose up --build
    ```
4. Open http://localhost:5173 in your browser.

**Consult [this file](DOCKER_DEPLOYMENT) for more info on infrastructure used.**
