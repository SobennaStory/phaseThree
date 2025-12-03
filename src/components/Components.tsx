import React, { useState, useEffect } from "react";
import "../App.css";
import type {
  Holding,
  Investor,
  Order,
  Portfolio,
  Stock,
  MarketListing,
} from "../types";

interface HoldingWithStock extends Holding {
  stock?: Stock;
  listing?: MarketListing;
}

interface OrdersProps {
  portfolios?: Portfolio[];
  investorId: number;
  onHoldingsUpdate?: (pId: number) => void;
}

export const Header: React.FC<{ investor: Investor }> = ({ investor }) => {
  return (
    <header className="header">
      <h1>
        <a
          href="/"
          className="logo-link"
        >
          {/* Replace src with your actual logo image path */}
          <img
            src="https://www.citypng.com/public/uploads/preview/money-cash-black-icon-transparent-png-735811696867890gjy3llao2p.png"
            alt="Stock Trading Platform"
            className="logo-image"
            onError={(e) => {
              // Fallback to text logo if image fails to load
              e.currentTarget.style.display = "none";
              document.getElementById("logo-fallback")!.style.display = "flex";
            }}
          />
          <div
            id="logo-fallback"
            className="logo"
            style={{ display: "none" }}
          >
            SYM
          </div>
        </a>
        <span>SYMTRADE</span>
      </h1>
      <div className="user-info">
        <div className="user-profile">
          <div className="user-avatar">
            {investor.firstName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <span>{investor.firstName}</span>
        </div>
      </div>
    </header>
  );
};

// Navigation Component
export const Navigation: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "holdings", label: "Holdings" },
    { id: "orders", label: "Place Order" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <nav className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

// Dashboard Component
const PortfolioCard: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => {
  const holdingsCount = portfolio.holdings?.length ?? 0;
  const accountBalance = portfolio.accountBalance ?? 0;

  return (
    <div className="portfolio-card">
      <div className="portfolio-header">
        <div className="portfolio-title">{portfolio.name}</div>
      </div>
      <div className="portfolio-value">${accountBalance}</div>
      <div className="portfolio-stats">
        <div className="stat-item">
          <div className="stat-label">Holdings</div>
          <div className="stat-value">{holdingsCount}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Created</div>
          <div className="stat-value">
            {new Date(portfolio.creationDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<{ investor: Investor }> = ({ investor }) => {
  const portfolios = investor.portfolios ?? [];

  return (
    <div className="dashboard">
      <h2 className="section-title">📊 Dashboard Overview</h2>

      <div className="risk-profile-card">
        <h3>Investor Profile</h3>
        <p>
          <strong>Name:</strong> {investor.firstName}{" "}
          {investor.middleInitial ? `${investor.middleInitial}. ` : ""}
          {investor.lastName}
        </p>
        <p>
          <strong>Email:</strong> {investor.email}
        </p>
        <p>
          <strong>Risk Profile:</strong>{" "}
          <span
            className={`risk-level risk-${investor.riskProfile
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {investor.riskProfile}
          </span>
        </p>
      </div>

      <h3 className="portfolios-title">Your Portfolios</h3>
      <div className="portfolio-grid">
        {portfolios.map((portfolio) => (
          <PortfolioCard
            key={`${portfolio.pId}-${portfolio.id}`}
            portfolio={portfolio}
          />
        ))}
      </div>
    </div>
  );
};

export const Holdings: React.FC<{ portfolios?: Portfolio[] }> = ({
  portfolios = [],
}) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(
    portfolios.length > 0 ? portfolios[0].pId : null
  );
  const [holdings, setHoldings] = useState<HoldingWithStock[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedPortfolioId) return;

    const fetchHoldings = async () => {
      try {
        setLoading(true);

        // Fetch holdings for the selected portfolio
        const holdingsRes = await fetch(
          `http://localhost/api/get_portfolio_holdings.php?pId=${selectedPortfolioId}`
        );
        const data = await holdingsRes.json();
        const mappedHoldings: HoldingWithStock[] = (data.holdings || []).map(
          (h: any) => ({
            pId: h.P_ID,
            sId: h.S_ID,
            quantity: Number(h.Quantity),
            purchasePrice: Number(h.Purchase_Price),
            stock: {
              companyName: h.Company_Name,
              sector: h.Sector,
            },
            listing: {
              exchangeCode: h.Exchange_Code,
              symbolCode: h.Symbol_Code,
            },
          })
        );
        setHoldings(mappedHoldings);

        // Fetch portfolio total value from backend
        const valueRes = await fetch(
          `http://localhost/api/calculate_portfolio_value.php?pId=${selectedPortfolioId}`
        );
        const valueData = await valueRes.json();
        setPortfolioValue(valueData.totalValue ?? 0);
      } catch (err) {
        console.error("Error fetching holdings or portfolio value:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [selectedPortfolioId]);

  if (loading) return <div>Loading holdings...</div>;

  return (
    <div className="holdings">
      <h2>💼 Portfolio Holdings</h2>
      <div>
        <label>Select Portfolio</label>
        <select
          value={selectedPortfolioId ?? ""}
          onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
        >
          {portfolios.map((p) => (
            <option
              key={p.pId}
              value={p.pId}
            >
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="portfolio-total-value">
        <strong>Total Holding Value:</strong> ${portfolioValue.toLocaleString()}
      </div>

      <table>
        <thead>
          <tr>
            <th>Stock</th>
            <th>Sector</th>
            <th>Exchange</th>
            <th>Quantity</th>
            <th>Purchase Price</th>
            <th>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const total = h.quantity * h.purchasePrice;
            return (
              <tr key={`${h.pId}-${h.sId}`}>
                <td>{h.stock?.Company_Name || "-"}</td>
                <td>{h.stock?.Sector || "-"}</td>
                <td>{h.listing?.exchangeCode || "-"}</td>
                <td>{h.quantity}</td>
                <td>${h.purchasePrice}</td>
                <td>${isNaN(total) ? 0 : total.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const Orders: React.FC<OrdersProps> = ({
  portfolios = [],
  investorId,
  onHoldingsUpdate,
}) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(
    portfolios.length > 0 ? portfolios[0].pId : null
  );
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [newOrder, setNewOrder] = useState({
    sId: 0,
    quantity: 0,
    price: 0,
    type: "buy" as "buy" | "sell",
  });

  // Fetch available stocks
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("http://localhost/api/get_stocks.php");
        if (!res.ok) throw new Error("Failed to fetch stocks");
        const data = await res.json();
        setStocks(data.stocks || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStocks();
  }, []);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost/api/get_orders.php");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      const transformedOrders: Order[] = data.map((o: any) => ({
        orderId: o.Order_ID,
        id: o.ID,
        sId: o.S_ID,
        quantity: Number(o.Quantity),
        price: Number(o.Price),
        status: o.Status,
        date: o.Date,
      }));
      setOrders(transformedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedPortfolioId ||
      newOrder.sId === 0 ||
      newOrder.quantity <= 0 ||
      newOrder.price <= 0
    ) {
      setMessage("Please fill in all fields correctly.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch("http://localhost/api/place_order.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorId,
          pId: selectedPortfolioId,
          sId: newOrder.sId,
          quantity: newOrder.quantity,
          price: newOrder.price,
          type: newOrder.type,
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      const data = await res.json();
      if (data.success) {
        setMessage("Order placed successfully!");
        setOrders([...orders, data]);
        setNewOrder({ sId: 0, quantity: 0, price: 0, type: "buy" });
        if (onHoldingsUpdate) onHoldingsUpdate(selectedPortfolioId); // refresh holdings
      } else {
        setMessage("Failed to place order");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error placing order");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="orders">
      <h2 className="section-title">📈 Place an Order</h2>

      {message && (
        <div
          className={`message ${
            message.includes("success") ? "success-message" : "error-message"
          }`}
        >
          {message}
        </div>
      )}

      <div className="form-group">
        <label>Select Portfolio</label>
        <select
          value={selectedPortfolioId ?? ""}
          onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
        >
          {portfolios.map((p) => (
            <option
              key={p.pId}
              value={p.pId}
            >
              {p.name} $
              {isNaN(p.accountBalance) ? 0 : p.accountBalance.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <div className="order-type-selector">
        <button
          type="button"
          className={`order-type-btn ${
            newOrder.type === "buy" ? "active" : ""
          }`}
          onClick={() => setNewOrder({ ...newOrder, type: "buy" })}
        >
          Buy
        </button>
        <button
          type="button"
          className={`order-type-btn ${
            newOrder.type === "sell" ? "active" : ""
          }`}
          onClick={() => setNewOrder({ ...newOrder, type: "sell" })}
        >
          Sell
        </button>
      </div>

      <form
        className="order-form"
        onSubmit={handlePlaceOrder}
      >
        <div className="form-group">
          <label>Stock</label>
          <select
            value={newOrder.sId}
            onChange={(e) =>
              setNewOrder({ ...newOrder, sId: Number(e.target.value) })
            }
          >
            <option value={0}>Select a stock</option>
            {stocks.map((s) => (
              <option
                key={s.S_ID}
                value={s.S_ID}
              >
                {s.Company_Name} (ID: {s.S_ID}, Sector: {s.Sector})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min={1}
              value={newOrder.quantity}
              onChange={(e) =>
                setNewOrder({ ...newOrder, quantity: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Price per Share</label>
            <input
              type="number"
              step="0.01"
              min={0.01}
              value={newOrder.price}
              onChange={(e) =>
                setNewOrder({ ...newOrder, price: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
        >
          Place Order
        </button>
      </form>

      <h2 className="section-title">📄 Existing Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Portfolio ID</th>
            <th>Stock ID</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId}>
              <td>{o.orderId}</td>
              <td>{(o as any).pId ?? "-"}</td>
              <td>{o.sId}</td>
              <td>{o.quantity}</td>
              <td>${o.price}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Profile: React.FC<{
  investor: Investor;
  setInvestor: (investor: Investor) => void;
}> = ({ investor, setInvestor }) => {
  const [message, setMessage] = useState("");
  const [newPortfolio, setNewPortfolio] = useState({ name: "", deposit: "" });

  const handleInvestorUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost/api/update_investor.php?id=${investor.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(investor),
        }
      );

      if (!res.ok) throw new Error("Failed to update investor");
      setMessage("Profile updated on database");
    } catch (err) {
      console.error(err);
      setMessage("Error updating profile");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolio.name || !newPortfolio.deposit) {
      setMessage("Please provide both a name and initial deposit.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await fetch("http://localhost/api/create_portfolio.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorId: investor.id,
          name: newPortfolio.name,
          deposit: parseFloat(newPortfolio.deposit),
        }),
      });

      if (!res.ok) throw new Error("Failed to create portfolio");

      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Failed to create portfolio");

      // Map the PHP response to your TypeScript Portfolio type
      const newPortfolioObj: Portfolio = {
        pId: data.portfolio.P_ID,
        id: data.portfolio.ID,
        name: data.portfolio.Name,
        accountBalance: data.portfolio.Account_Balance,
        creationDate: data.portfolio.Creation_Date,
        holdings: [],
      };

      setInvestor({
        ...investor,
        portfolios: [...(investor.portfolios || []), newPortfolioObj],
      });

      setNewPortfolio({ name: "", deposit: "" });
      setMessage("Portfolio created successfully!");
    } catch (err) {
      console.error("Create portfolio error:", err);
      setMessage("Error creating portfolio");
    } finally {
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const deletePortfolio = async (portfolioId: number) => {
    try {
      const res = await fetch(
        `http://localhost/api/delete_portfolio.php?pId=${portfolioId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete portfolio");
      }

      setInvestor({
        ...investor,
        portfolios: (investor.portfolios || []).filter(
          (p) => p.pId !== portfolioId
        ),
      });

      setMessage("Portfolio deleted");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Delete portfolio error:", err);
      setMessage("Error deleting portfolio");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="profile">
      <h2 className="section-title">👤 Investor Profile</h2>

      {message && <div className="message success-message">✓ {message}</div>}

      <form
        className="profile-form"
        onSubmit={handleInvestorUpdate}
      >
        <div className="form-group">
          <label>Investor ID</label>
          <input
            type="text"
            className="form-control"
            value={investor.id}
            disabled
          />
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-control"
            value={investor.firstName}
            onChange={(e) =>
              setInvestor({ ...investor, firstName: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            value={investor.email}
            onChange={(e) =>
              setInvestor({ ...investor, email: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Risk Profile</label>
          <select
            className="form-control"
            value={investor.riskProfile}
            onChange={(e) =>
              setInvestor({
                ...investor,
                riskProfile: e.target.value as
                  | "Conservative"
                  | "Moderate"
                  | "Aggressive"
                  | "Very Aggressive",
              })
            }
          >
            <option value="Conservative">Low - Conservative</option>
            <option value="Balanced">Medium - Balanced</option>
            <option value="Aggressive">High - Aggressive</option>
          </select>
        </div>
        <div className="action-buttons">
          <button
            type="submit"
            className="btn btn-primary"
          >
            Update Profile
          </button>
        </div>
      </form>

      <h3 className="subsection-title">Create New Portfolio</h3>
      <form
        className="portfolio-form"
        onSubmit={handleCreatePortfolio}
      >
        <div className="form-group">
          <label>Portfolio Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., Retirement Fund"
            value={newPortfolio.name}
            onChange={(e) =>
              setNewPortfolio({ ...newPortfolio, name: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Initial Deposit</label>
          <input
            type="number"
            className="form-control"
            placeholder="0.00"
            value={newPortfolio.deposit}
            onChange={(e) =>
              setNewPortfolio({ ...newPortfolio, deposit: e.target.value })
            }
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Create Portfolio
        </button>
      </form>

      <h3 className="subsection-title">Your Portfolios</h3>
      <div className="portfolio-list">
        {(investor.portfolios || []).map((p) => (
          <div
            key={`${p.pId}-${p.id}`}
            className="portfolio-item"
          >
            {p.name} $
            {isNaN(p.accountBalance) ? 0 : p.accountBalance.toLocaleString()}{" "}
            <button
              className="btn btn-danger"
              onClick={() => deletePortfolio(p.pId)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
