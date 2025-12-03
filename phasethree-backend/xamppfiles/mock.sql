USE stock_trading;

-- ===============================================
-- 1. Investors
-- ===============================================
INSERT INTO Investor (Risk_Profile, Email, First_Name, Middle_Initial, Last_Name)
VALUES
('Moderate', 'alice@example.com', 'Alice', 'M', 'Doe'),
('Aggressive', 'bob@example.com', 'Bob', NULL, 'Smith'),
('Conservative', 'carol@example.com', 'Carol', 'A', 'Jones');

-- ===============================================
-- 2. Portfolios
-- ===============================================
INSERT INTO Portfolio (ID, Name, Account_Balance, Creation_Date)
VALUES
(1, 'Retirement Fund', 50000.00, '2025-01-01'),
(1, 'Tech Growth', 20000.00, '2025-03-15'),
(2, 'High Risk Ventures', 15000.00, '2025-02-10');

-- ===============================================
-- 3. Stocks
-- ===============================================
INSERT INTO Stock (Company_Name, Sector)
VALUES
('Apple Inc.', 'Technology'),
('Microsoft Corp.', 'Technology'),
('Tesla Inc.', 'Automotive'),
('Pfizer Inc.', 'Healthcare');

-- ===============================================
-- 4. StockSectors
-- ===============================================
INSERT INTO StockSectors (S_ID, Sector)
VALUES
(1, 'Technology'),
(2, 'Technology'),
(3, 'Automotive'),
(4, 'Healthcare');

-- ===============================================
-- 5. Market Listings
-- ===============================================
INSERT INTO Market_Listings (S_ID, Exchange_Code, Symbol_Code)
VALUES
(1, 'NASDAQ', 'AAPL'),
(2, 'NASDAQ', 'MSFT'),
(3, 'NASDAQ', 'TSLA'),
(4, 'NYSE', 'PFE');

-- ===============================================
-- 6. Holdings
-- ===============================================
INSERT INTO Holding (P_ID, S_ID, Purchase_Price, Quantity)
VALUES
(1, 1, 120.50, 100),
(1, 2, 250.00, 50),
(2, 3, 700.00, 10),
(3, 4, 40.00, 200);

-- ===============================================
-- 7. Orders
-- ===============================================
INSERT INTO `Order` (Date, Price, Quantity, S_ID, ID, Status)
VALUES
('2025-04-01 10:00:00', 125.00, 10, 1, 1, 'Completed'),
('2025-04-02 11:00:00', 255.00, 5, 2, 1, 'Pending'),
('2025-04-03 09:30:00', 710.00, 2, 3, 2, 'Completed'),
('2025-04-04 14:15:00', 42.00, 50, 4, 3, 'Cancelled');

-- ===============================================
-- 8. Buy Orders
-- ===============================================
INSERT INTO BuyOrder (Order_ID, Payment_Type)
VALUES
(1, 'Credit Card'),
(2, 'Bank Transfer');

-- ===============================================
-- 9. Sell Orders
-- ===============================================
INSERT INTO SellOrder (Order_ID, Settlement_Date)
VALUES
(3, '2025-04-06'),
(4, '2025-04-07');
