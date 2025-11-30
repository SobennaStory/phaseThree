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
            key={portfolio.pId}
            portfolio={portfolio}
          />
        ))}
      </div>
    </div>
  );
};

export const Holdings: React.FC<{ portfolios?: Portfolio[] }> = ({
  portfolios,
}) => {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(
    portfolios && portfolios.length > 0 ? portfolios[0].pId : null
  );

  const [holdings, setHoldings] = useState<
    (Holding & { stock?: Stock; listing?: MarketListing })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedPortfolioId) return;

    const fetchHoldings = async () => {
      try {
        setLoading(true);

        if (!selectedPortfolioId) return;

        const holdingsRes = await fetch(
          `http://localhost:4000/api/holdings/${selectedPortfolioId}`
        );

        if (!holdingsRes.ok) {
          console.warn(
            `Holdings not found for portfolio ${selectedPortfolioId}`
          );
          setHoldings([]);
          return;
        }

        const data = await holdingsRes.json();
        setHoldings(data.holdings || []);
      } catch (err) {
        console.error("Error fetching holdings", err);
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
          {portfolios?.map((p) => (
            <option
              key={p.pId}
              value={p.pId}
            >
              {p.name}
            </option>
          ))}
        </select>
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
            const totalValue = h.quantity * h.purchasePrice;
            return (
              <tr key={h.sId}>
                <td>{h.stock?.companyName || "-"}</td>
                <td>{h.stock?.sector || "-"}</td>
                <td>{h.listing?.exchangeCode || "-"}</td>
                <td>{h.quantity}</td>
                <td>${h.purchasePrice.toFixed(2)}</td>
                <td>${totalValue.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const Orders: React.FC<{ portfolios?: Portfolio[] }> = ({
  portfolios,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrder, setNewOrder] = useState({
    portfolioId: portfolios?.[0]?.pId ?? 0,
    sId: 0,
    quantity: 0,
    price: 0,
    type: "buy" as "buy" | "sell",
  });
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/orders`);
        const fetchedOrders = await res.json();
        const transformedOrders: Order[] = fetchedOrders.map((o: any) => ({
          orderId: o.Order_ID,
          id: o.ID,
          sId: o.S_ID,
          price: Number(o.Price),
          quantity: o.Quantity,
          status: o.Status,
          date: o.Date,
        }));
        setOrders(transformedOrders);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
      if (!res.ok) throw new Error("Order failed");
      const order: Order = await res.json();
      setOrders([...orders, order]);
      setMessage("Order placed successfully");
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
      <h2>📈 Orders</h2>

      {message && <div className="message">{message}</div>}

      <form onSubmit={handlePlaceOrder}>
        <div>
          <label>Portfolio</label>
          <select
            value={newOrder.portfolioId}
            onChange={(e) =>
              setNewOrder({ ...newOrder, portfolioId: Number(e.target.value) })
            }
          >
            {portfolios?.map((p) => (
              <option
                key={p.pId}
                value={p.pId}
              >
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Stock ID</label>
          <input
            type="number"
            value={newOrder.sId}
            onChange={(e) =>
              setNewOrder({ ...newOrder, sId: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label>Quantity</label>
          <input
            type="number"
            value={newOrder.quantity}
            onChange={(e) =>
              setNewOrder({ ...newOrder, quantity: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label>Price per Share</label>
          <input
            type="number"
            step="0.01"
            value={newOrder.price}
            onChange={(e) =>
              setNewOrder({ ...newOrder, price: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label>Order Type</label>
          <select
            value={newOrder.type}
            onChange={(e) =>
              setNewOrder({
                ...newOrder,
                type: e.target.value as "buy" | "sell",
              })
            }
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <button type="submit">Place Order</button>
      </form>

      <h3>Existing Orders</h3>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Portfolio</th>
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
              <td>{o.id}</td>
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
        `http://localhost:4000/api/investor/${investor.id}`,
        {
          method: "PUT",
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
    if (!newPortfolio.name || !newPortfolio.deposit) return;
    try {
      const res = await fetch("http://localhost:4000/api/portfolios", {
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
      setInvestor({
        ...investor,
        portfolios: [...(investor.portfolios || []), data.portfolio],
      });
      setNewPortfolio({ name: "", deposit: "" });
      setMessage("Portfolio created on database");
    } catch (err) {
      console.error(err);
      setMessage("Error creating portfolio");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const deletePortfolio = async (portfolioId: number) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/portfolios/${portfolioId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete portfolio");
      setInvestor({
        ...investor,
        portfolios: (investor.portfolios || []).filter(
          (p) => p.id !== portfolioId
        ),
      });
      setMessage("Portfolio deleted");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
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
            <option value="Low">Low - Conservative</option>
            <option value="Medium">Medium - Balanced</option>
            <option value="High">High - Aggressive</option>
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
            key={p.id}
            className="portfolio-item"
          >
            {p.name} (${p.accountBalance.toLocaleString()}){" "}
            <button
              className="btn btn-danger"
              onClick={() => deletePortfolio(p.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
