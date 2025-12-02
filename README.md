# SYMTRADE - Stock Trading Platform

A full-stack stock trading platform built with React, TypeScript, Express, and MySQL. This application allows investors to manage portfolios, track holdings, place orders, and update their profiles.

## 🏗️ Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS
- **Port**: 5173 (Vite default)

### Backend

- **Framework**: Express.js with TypeScript
- **Database**: MySQL 2 (with promise-based API)
- **CORS**: Enabled for cross-origin requests
- **Port**: 4000

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- MySQL Workbench (recommended)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Database Setup

First, set up your MySQL database:

1. Open MySQL Workbench
2. Create a new database named `stock_trading`
3. Run the `CREATE_TABLES.sql` script to set up the database schema
4. Update the database credentials in `phasethree-backend/src/index.ts` if needed:

```typescript
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password", // Change this to your MySQL password
  database: "stock_trading",
});
```

### 2. Backend Setup

Navigate to the backend directory and start the server:

```bash
cd phasethree-backend
npm install
npm run start
```

The backend API will run on `http://localhost:4000`

### 3. Frontend Setup

In a new terminal, navigate to the main project folder and start the frontend:

```bash
npm install
npm run start
```

The frontend will run on `http://localhost:5173`

---

## 🛠️ SQL Requirements Implementation

### Required SQL Operations

#### 1. **INSERTION** ✓

**Location:** Profile Page - Create New Portfolio Form

**Backend Code:** `POST /api/portfolios` (index.ts, lines 124-151)

```typescript
INSERT INTO Portfolio (ID, Name, Account_Balance, Creation_Date)
VALUES (?, ?, ?, CURDATE());
```

**Frontend:** Components.tsx - Profile component `handleCreatePortfolio()` function

**User Steps:**

1. Navigate to Profile tab
2. Scroll to "Create New Portfolio" section
3. Enter portfolio name (e.g., "Retirement Fund")
4. Enter initial deposit amount (e.g., 10000)
5. Click "Create Portfolio" button
6. New portfolio appears in "Your Portfolios" list

---

#### 2. **DELETION** ✓

**Location:** Profile Page - Portfolio List

**Backend Code:** `DELETE /api/portfolios/:id` (index.ts, lines 177-188)

```typescript
DELETE FROM Portfolio WHERE P_ID = ?
```

**Frontend:** Components.tsx - Profile component `deletePortfolio()` function

**User Steps:**

1. Navigate to Profile tab
2. Scroll to "Your Portfolios" section
3. Find the portfolio you want to delete
4. Click the red "Delete" button next to the portfolio name
5. Portfolio is removed from the list

---

#### 3. **MODIFICATION (UPDATE)** ✓

**Location:** Profile Page - Investor Profile Form

**Backend Code:** `PUT /api/investor/:id` (index.ts, lines 154-174)

```typescript
UPDATE Investor
SET First_Name = ?, Email = ?, Risk_Profile = ?
WHERE ID = ?;
```

**Frontend:** Components.tsx - Profile component `handleInvestorUpdate()` function

**User Steps:**

1. Navigate to Profile tab
2. Edit fields: Full Name, Email Address, or Risk Profile
3. Click "Update Profile" button
4. See success message "Profile updated on database"

---

#### 4. **SINGLE TABLE QUERY (SELECT)** ✓

**Location:** Dashboard Page & Holdings Page

**Backend Code:** `GET /api/portfolios` (index.ts, lines 22-43)

```typescript
SELECT * FROM Portfolio
WHERE ID = ?
```

**Frontend:** App.tsx - `fetchPortfolios()` function

**User Steps:**

1. Open application (Dashboard loads automatically)
2. View portfolio cards showing account balances and creation dates
3. Or navigate to Holdings/Orders tabs to see portfolio dropdown

---

#### 5. **MULTI-TABLE JOIN QUERY** ✓

**Location:** Holdings Page

**Backend Code:** `GET /api/holdings/:portfolioId` (index.ts, lines 46-79)

```typescript
SELECT
  h.P_ID AS portfolioId,
  h.S_ID AS stockId,
  ml.Symbol_Code AS symbol,
  s.Company_Name AS company,
  s.Sector AS sector,
  h.Quantity AS quantity,
  h.Purchase_Price AS purchasePrice,
  100.00 AS currentPrice,
  ml.Exchange_Code AS exchange
FROM Holding h
JOIN Stock s ON h.S_ID = s.S_ID
JOIN Market_Listings ml ON h.S_ID = ml.S_ID
WHERE h.P_ID = ?;
```

**Tables Joined:**

- `Holding` - Links portfolios to stocks with quantity and purchase price
- `Stock` - Provides company name and sector information
- `Market_Listings` - Provides stock symbol and exchange code

**Frontend:** Components.tsx - Holdings component

**User Steps:**

1. Navigate to Holdings tab
2. Select a portfolio from the dropdown menu
3. View table showing stock details from all three joined tables

---

#### 6. **AGGREGATE OPERATION (SUM)** ✓

**Location:** Backend - Portfolio Value Calculation

**Backend Code:** `GET /api/portfolio-value/:portfolioId` (index.ts, lines 82-103)

```typescript
SELECT
  SUM(h.Quantity * 100.00) AS totalValue
FROM Holding h
WHERE h.P_ID = ?;
```

**Purpose:** Calculates total portfolio value by summing all holdings

**Usage:** Can be called to get total portfolio valuation

---

## 🎯 Application Program Design - Main Steps

### Function 1: Create New Portfolio (INSERTION)

**SQL Query Type:** INSERT

**Main Steps:**

1. User navigates to Profile section
2. User fills in portfolio name and initial deposit fields
3. Frontend validates input (non-empty fields)
4. Frontend sends POST request to `/api/portfolios` with investorId, name, and deposit
5. Backend receives request with portfolio data
6. Backend executes INSERT query to Portfolio table with CURDATE() for creation date
7. MySQL database creates new record with auto-generated P_ID
8. Backend returns success response with new portfolio data including generated ID
9. Frontend updates local state by adding new portfolio to investor's portfolio array
10. UI re-renders to show new portfolio in the list
11. User sees confirmation message "Portfolio created on database"

---

### Function 2: Delete Portfolio (DELETION)

**SQL Query Type:** DELETE

**Main Steps:**

1. User navigates to Profile section
2. User views list of portfolios in "Your Portfolios" section
3. User clicks red "Delete" button next to desired portfolio
4. Frontend sends DELETE request to `/api/portfolios/:id` with portfolio ID
5. Backend receives portfolio ID to delete
6. Backend executes DELETE query on Portfolio table with WHERE P_ID = ?
7. MySQL database removes portfolio record permanently
8. Backend returns success confirmation response
9. Frontend filters out deleted portfolio from local state
10. UI updates to remove portfolio from visible list
11. User sees confirmation message "Portfolio deleted"

---

### Function 3: Update Investor Profile (MODIFICATION)

**SQL Query Type:** UPDATE

**Main Steps:**

1. User navigates to Profile section
2. User views current profile information in form fields
3. User modifies one or more editable fields (Name, Email, or Risk Profile)
4. User clicks "Update Profile" button
5. Frontend sends PUT request to `/api/investor/:id` with updated investor object
6. Backend receives investor ID from URL params and updated data
7. Backend executes UPDATE query on Investor table setting First_Name, Email, and Risk_Profile
8. MySQL database updates investor record in place
9. Backend returns success status response
10. Frontend displays success message "Profile updated on database"
11. Changes persist in database for future sessions

---

### Function 4: View Portfolios (SINGLE TABLE SELECT)

**SQL Query Type:** SELECT on single table

**Main Steps:**

1. User opens application or dashboard loads automatically
2. Frontend sends GET request to `/api/portfolios?investorId=1`
3. Backend receives request with investor ID as query parameter
4. Backend builds SELECT query: `SELECT * FROM Portfolio`
5. Backend adds WHERE clause: `WHERE ID = ?` with investor ID
6. MySQL executes query and returns all matching portfolio records
7. Backend maps database column names to camelCase response format
8. Frontend receives portfolio data
9. State is updated with mapped portfolios array
10. Dashboard component renders PortfolioCard for each portfolio
11. User views portfolio cards showing name, balance, holdings count, and creation date

---

### Function 5: View Holdings (MULTI-TABLE JOIN)

**SQL Query Type:** JOIN query combining multiple tables

**Main Steps:**

1. User navigates to Holdings section
2. User selects a portfolio from dropdown menu
3. Frontend sends GET request to `/api/holdings/:portfolioId`
4. Backend receives portfolio ID from URL parameter
5. Backend executes complex JOIN query combining three tables:
   - FROM Holding h (quantity and purchase price)
   - JOIN Stock s (company name and sector)
   - JOIN Market_Listings ml (symbol and exchange)
6. MySQL performs joins to combine data from all three tables
7. Backend sends JSON response with holdings array containing combined data
8. Frontend receives enriched holdings data
9. UI renders table with columns populated from different source tables
10. User sees comprehensive holding information from multiple tables

**Tables Joined:**

- `Holding` - Core holding data
- `Stock` - Company information
- `Market_Listings` - Exchange and symbol data

---

### Function 6: Calculate Portfolio Value (AGGREGATE)

**SQL Query Type:** SELECT with SUM() aggregate function

**Main Steps:**

1. API endpoint available at `/api/portfolio-value/:portfolioId`
2. Client sends GET request with portfolio ID
3. Backend constructs aggregate query with SUM() function
4. Query multiplies Quantity \* currentPrice for each holding
5. SUM() aggregates all individual holding values into single total
6. MySQL executes aggregate operation
7. Backend returns JSON response with totalValue
8. Demonstrates SQL aggregate functionality for financial calculations

---

## 📱 User Manual & Interface Guide

### Dashboard Interface

**Purpose:** View investor profile and all portfolios

**Components:**

- **Investor Profile Card:** Shows name, email, and risk profile
- **Portfolio Grid:** Displays all portfolios with key metrics

**How to Use:**

1. Application opens to Dashboard by default
2. View your investor information in the top card
3. See all your portfolios displayed as cards below
4. Each portfolio card shows:
   - Portfolio name
   - Current account balance
   - Number of holdings
   - Creation date

---

### Holdings Interface

**Purpose:** View detailed holdings for each portfolio

**Components:**

- **Portfolio Selector:** Dropdown to choose portfolio
- **Holdings Table:** List of all stocks in portfolio

**How to Use:**

1. Navigate to Holdings section
2. Select a portfolio from the dropdown menu
3. View table with:
   - Stock company name (from Stock table)
   - Sector (from Stock table)
   - Exchange (from Market_Listings table)
   - Quantity (from Holding table)
   - Purchase Price (from Holding table)
   - Total Value (calculated)

---

### Orders Interface

**Purpose:** Place new buy/sell orders and view order history

**Components:**

- **Order Form:** Input fields for new orders
- **Orders Table:** List of all existing orders

**How to Use - Place New Order:**

1. Navigate to Orders section
2. Fill in the form:
   - Portfolio (dropdown)
   - Stock ID (number input)
   - Quantity (number input)
   - Price per Share (number input)
   - Order Type (Buy/Sell dropdown)
3. Click "Place Order" button
4. See success message

**How to Use - View Orders:**

1. Scroll to "Existing Orders" table
2. View all orders with Order ID, Portfolio ID, Stock ID, Quantity, Price, and Status

---

### Profile Interface

**Purpose:** Manage investor information and portfolios

**Components:**

- **Investor Profile Form:** Update personal information
- **Create Portfolio Form:** Add new portfolios
- **Portfolio List:** View and delete existing portfolios

**How to Use - Update Profile:**

1. Navigate to Profile section
2. Edit fields: Full Name, Email Address, or Risk Profile
3. Click "Update Profile" button
4. See confirmation message

**How to Use - Create Portfolio:**

1. Scroll to "Create New Portfolio" section
2. Enter portfolio name
3. Enter initial deposit amount
4. Click "Create Portfolio" button
5. New portfolio appears in list below

**How to Use - Delete Portfolio:**

1. Scroll to "Your Portfolios" section
2. Find portfolio to remove
3. Click red "Delete" button
4. Portfolio is removed from list

---

## 🔌 API Endpoints Summary

| Endpoint                            | Method | Purpose                           | SQL Type        |
| ----------------------------------- | ------ | --------------------------------- | --------------- |
| `/api/portfolios`                   | GET    | Fetch portfolios                  | SELECT          |
| `/api/portfolios`                   | POST   | Create portfolio                  | INSERT          |
| `/api/portfolios/:id`               | DELETE | Delete portfolio                  | DELETE          |
| `/api/investor/:id`                 | PUT    | Update investor                   | UPDATE          |
| `/api/holdings/:portfolioId`        | GET    | Fetch holdings with stock details | JOIN            |
| `/api/portfolio-value/:portfolioId` | GET    | Calculate total value             | AGGREGATE (SUM) |
| `/api/orders`                       | GET    | Fetch all orders                  | SELECT          |
| `/api/orders`                       | POST   | Place new order                   | INSERT          |

---

## 📊 Database Schema

The application uses these tables:

- `Investor` - Stores investor information
- `Portfolio` - Portfolio details linked to investors
- `Stock` - Stock company information
- `Market_Listings` - Stock exchange listings
- `Holding` - Portfolio holdings (links portfolios to stocks)
- `Order` - Buy/sell order records

## 🎨 Tech Stack

**Frontend:**

- React + TypeScript
- Vite
- CSS3
- Fetch API

**Backend:**

- Node.js + Express
- TypeScript
- mysql2/promise
- CORS middleware

## 📝 Notes

- Placeholder `currentPrice` of $100.00 used for calculations
- Default investor ID is 1
- Update database credentials for production
- CORS enabled for development

## 🐛 Troubleshooting

**Backend won't start:**

- Check MySQL service is running
- Verify database credentials
- Ensure port 4000 is available

**Frontend can't connect:**

- Verify backend is running on port 4000
- Check for CORS errors
- Ensure API URLs use `http://localhost:4000`

**Database errors:**

- Confirm `stock_trading` database exists
- Run CREATE_TABLES.sql script
- Check table names match schema

## 📄 License

This project is for educational purposes.
