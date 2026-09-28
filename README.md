# NGO Management System

This project is a DBMS demonstration application for an NGO management system built with PostgreSQL, Express.js, and React. It uses a simple 5-table relational design and shows core DBMS concepts such as primary keys, foreign keys, relationships, CRUD operations, SQL queries, JOINs, aggregate functions, and real API-based integration.

## Objective

The purpose of the project is to demonstrate how a small non-profit organization can manage donors, volunteers, projects, beneficiaries, and donations using a relational database and an application layer.

## Database design

The project uses exactly these 5 tables:

- donor
- volunteer
- project
- beneficiary
- donation

### Relationships

- One donor can make many donations.
- One project can receive many donations.
- Each donation references exactly one donor and optionally one project.
- volunteer and beneficiary are independent records, not linked by a separate table.

### Main schema

```sql
CREATE TABLE donor (
    donor_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    donor_type VARCHAR(50),
    city VARCHAR(50),
    organization VARCHAR(100)
);

CREATE TABLE volunteer (
    volunteer_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    skill VARCHAR(100),
    availability VARCHAR(30)
);

CREATE TABLE project (
    project_id INT PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    location VARCHAR(100),
    budget DECIMAL(12,2)
);

CREATE TABLE beneficiary (
    beneficiary_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    location VARCHAR(100),
    category VARCHAR(50)
);

CREATE TABLE donation (
    donation_id INT PRIMARY KEY,
    donor_id INT NOT NULL,
    project_id INT,
    donation_date DATE,
    amount DECIMAL(12,2),
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id),
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);
```

## Tech stack

- PostgreSQL
- Node.js + Express.js
- React + Vite
- Axios
- CORS and dotenv

## Project structure

```text
proj_dbms/
├── backend/
│   ├── db.js
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── tables.sql
│   ├── data.sql
│   ├── queries.sql
│   ├── QUERY_EXPLANATION.md
│   └── sample_data.sql
├── README.md
└── package-lock.json
```

## Features

- Dashboard summary for donors, volunteers, projects, beneficiaries, donations, and total donation amount
- CRUD pages for all 5 tables
- Search and filter support on data tables
- Donation report and recent activity card
- REST API endpoints for dashboard and records management
- PostgreSQL-backed storage with real relational queries

## Run instructions

### 1. Start PostgreSQL

Make sure PostgreSQL is running locally and the database is created as `ngo_management`.

### 2. Configure environment

Update the backend `.env` file with the correct credentials.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ngo_management
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5000
```

### 3. Start backend

```bash
cd backend
npm install
npm start
```

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app

Visit `http://localhost:5173` in the browser.

## API endpoints

The backend exposes endpoints such as:

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/reports`
- `GET /api/reports/donations`
- `GET /api/donors`
- `POST /api/donors`
- `PUT /api/donors/:id`
- `DELETE /api/donors/:id`
- `GET /api/volunteers`
- `POST /api/volunteers`
- `PUT /api/volunteers/:id`
- `DELETE /api/volunteers/:id`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/beneficiaries`
- `POST /api/beneficiaries`
- `PUT /api/beneficiaries/:id`
- `DELETE /api/beneficiaries/:id`
- `GET /api/donations`
- `POST /api/donations`
- `PUT /api/donations/:id`
- `DELETE /api/donations/:id`

## Notes for viva/demo

- Use the dashboard to show totals and donation activity.
- Show how donations connect donors to projects.
- Explain that volunteer and beneficiary records are independent but useful for NGO operations.
- Demonstrate sample SQL queries from `database/queries.sql` for join and aggregate logic.

## Database query collection

The query set in `database/queries.sql` includes 30 SQL statements covering:

- donor and donation analysis
- project and budget reporting
- volunteer skill analysis
- beneficiary segmentation
- combined reporting and aggregate queries

The explanations are available in `database/QUERY_EXPLANATION.md`.
