import express, { Request, Response } from "express";
import cors from "cors";
import mysql from "mysql2/promise";

//This assumes you have alraedy ran mysql workbench with our CREATE_TABLES.sql under a database named stock_trading
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "stock_trading",
});

// ------------------------
// Express Setup
// ------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ======================================================
// 1. GET PORTFOLIOS FOR INVESTOR  (simple SELECT query)
// Frontend: GET /api/portfolios?investorId=1
// ======================================================
app.get("/api/portfolios", async (req: Request, res: Response) => {
  try {
    const { investorId } = req.query;

    let query = "SELECT * FROM Portfolio";
    let params: any[] = [];

    if (investorId) {
      query += " WHERE ID = ?";
      params.push(investorId);
    }

    const [rows] = await db.query(query, params);

    res.json({ portfolios: rows });
  } catch (err) {
    console.error("Error fetching portfolios:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ======================================================
// 2. GET HOLDINGS FOR PORTFOLIO  (JOIN query)
// Frontend: GET /api/holdings/:portfolioId
// ======================================================
app.get("/api/holdings/:portfolioId", async (req: Request, res: Response) => {
  try {
    const { portfolioId } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        h.P_ID AS portfolioId,
        h.S_ID AS stockId,
        ml.Symbol_Code AS symbol,
        s.Company_Name AS company,
        s.Sector AS sector,
        h.Quantity AS quantity,
        h.Purchase_Price AS purchasePrice,
        100.00 AS currentPrice,    -- placeholder
        ml.Exchange_Code AS exchange
      FROM Holding h
      JOIN Stock s ON h.S_ID = s.S_ID
      JOIN Market_Listings ml ON h.S_ID = ml.S_ID
      WHERE h.P_ID = ?;
      `,
      [portfolioId]
    );

    res.json({ holdings: rows });
  } catch (err) {
    console.error("Error fetching holdings:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ======================================================
// 3. GET PORTFOLIO VALUE  (aggregate query SUM())
// Frontend: GET /api/portfolio-value/:portfolioId
// ======================================================
app.get(
  "/api/portfolio-value/:portfolioId",
  async (req: Request, res: Response) => {
    try {
      const { portfolioId } = req.params;

      const [rows]: any = await db.query(
        `
        SELECT 
          SUM(h.Quantity * 100.00) AS totalValue
        FROM Holding h
        WHERE h.P_ID = ?;
        `,
        [portfolioId]
      );

      res.json({ totalValue: rows[0].totalValue || 0 });
    } catch (err) {
      console.error("Error calculating portfolio value:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ======================================================
// 4. CREATE A NEW PORTFOLIO (INSERT)
// Frontend: POST /api/portfolios
// ======================================================
app.post("/api/portfolios", async (req: Request, res: Response) => {
  try {
    const { investorId, name, deposit } = req.body;

    const [result]: any = await db.query(
      `
      INSERT INTO Portfolio (ID, Name, Account_Balance, Creation_Date)
      VALUES (?, ?, ?, CURDATE());
      `,
      [investorId, name, deposit]
    );

    res.json({
      success: true,
      portfolio: {
        id: result.insertId,
        investorId,
        name,
        value: deposit,
        holdings: 0,
        return: 0,
        creationDate: new Date().toISOString().split("T")[0],
      },
    });
  } catch (err) {
    console.error("Error creating portfolio:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ======================================================
// 5. UPDATE AN INVESTOR (UPDATE)
// Frontend: PUT /api/investor/:id
// ======================================================
app.put("/api/investor/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, riskProfile } = req.body;

    const [result]: any = await db.query(
      `
      UPDATE Investor
      SET First_Name = ?, Email = ?, Risk_Profile = ?
      WHERE ID = ?;
      `,
      [name, email, riskProfile, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating investor:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ======================================================
// 6. DELETE A PORTFOLIO (DELETE)
// Frontend: DELETE /api/portfolios/:id
// ======================================================
app.delete("/api/portfolios/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM Portfolio WHERE P_ID = ?", [id]);

    res.json({ success: true, message: "Portfolio deleted" });
  } catch (err) {
    console.error("Error deleting portfolio:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ======================================================
// ORDERS ROUTES
// ======================================================
app.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM `Order`");
    res.json(rows || []);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const { portfolioId, sId, quantity, price, type } = req.body;

    const [result]: any = await db.query(
      `INSERT INTO \`Order\` (P_ID, S_ID, Quantity, Price, Type, Status, Order_Date)
    VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [portfolioId, sId, quantity, price, type]
    );

    res.json({
      orderId: result.insertId,
      portfolioId,
      sId,
      quantity,
      price,
      type,
      status: "pending",
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------------
// Start Server
// ------------------------
app.listen(4000, () => {
  console.log("Server running on port 4000");
});
