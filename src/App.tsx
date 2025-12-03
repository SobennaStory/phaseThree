import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Header,
  Dashboard,
  Holdings,
  Orders,
  Profile,
} from "./components/Components";
import type { Investor, Holding, Portfolio } from "./types";

function App() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(
    null
  );
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all investors on mount
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const res = await fetch("http://localhost/api/get_investors.php");
        if (!res.ok) throw new Error("Failed to fetch investors");
        const dataRaw: any[] = await res.json();
        const mappedInvestors: Investor[] = dataRaw.map((inv) => ({
          id: Number(inv.ID),
          firstName: inv.First_Name,
          middleInitial: inv.Middle_Initial || undefined,
          lastName: inv.Last_Name,
          email: inv.Email,
          riskProfile: "Moderate", // placeholder if you want to fetch actual riskProfile separately
        }));
        setInvestors(mappedInvestors);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchInvestors();
  }, []);

  // Fetch data for selected investor
  const fetchInvestorData = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      // 1️⃣ Fetch investor info
      const resInvestor = await fetch(
        `http://localhost/api/get_investor.php?id=${id}`
      );
      if (!resInvestor.ok) throw new Error("Investor not found");
      const data = await resInvestor.json();

      const investorData: Investor = {
        id: Number(data.ID),
        firstName: data.First_Name,
        middleInitial: data.Middle_Initial || undefined,
        lastName: data.Last_Name,
        email: data.Email,
        riskProfile: data.Risk_Profile as Investor["riskProfile"],
        portfolios: [], // will populate next
      };

      // 2️⃣ Fetch portfolios
      const resPortfolios = await fetch(
        `http://localhost/api/get_portfolios.php?investorId=${id}`
      );
      if (!resPortfolios.ok) throw new Error("Failed to fetch portfolios");
      const portfoliosData = await resPortfolios.json();

      const portfolios: Portfolio[] = portfoliosData.portfolios.map(
        (p: any) => ({
          pId: p.P_ID,
          id: p.ID,
          name: p.Name,
          accountBalance: parseFloat(p.Account_Balance),
          creationDate: p.Creation_Date,
          holdings: [], // will populate below
        })
      );

      // 3️⃣ Fetch holdings for each portfolio
      const holdingsPromises = portfolios.map((p) =>
        fetch(
          `http://localhost/api/get_portfolio_holdings.php?pId=${p.pId}`
        ).then((res) => {
          if (!res.ok)
            throw new Error(`Failed to fetch holdings for portfolio ${p.pId}`);
          return res.json();
        })
      );

      const holdingsData = await Promise.all(holdingsPromises);

      portfolios.forEach((p, i) => {
        p.holdings = holdingsData[i].holdings.map((h: any) => ({
          pId: h.P_ID,
          sId: h.S_ID,
          quantity: h.Quantity,
          purchasePrice: parseFloat(h.Purchase_Price),
        }));
      });

      // 4️⃣ Set state
      setInvestor({ ...investorData, portfolios });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setInvestor(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Investor Dashboard</h1>

      {/* Investor selection */}
      <div className="investor-selector">
        <label>Select Investor: </label>
        <select
          value={selectedInvestorId ?? ""}
          onChange={(e) => setSelectedInvestorId(Number(e.target.value))}
        >
          <option value="">-- Choose Investor --</option>
          {investors.map((inv) => (
            <option
              key={inv.id} // unique key
              value={inv.id} // value must match the investor ID
            >
              {inv.firstName}{" "}
              {inv.middleInitial ? inv.middleInitial + ". " : ""}
              {inv.lastName}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            selectedInvestorId && fetchInvestorData(selectedInvestorId)
          }
          disabled={!selectedInvestorId || loading}
        >
          Load Investor
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {investor && (
        <>
          <Header investor={investor} />
          <div className="main-container">
            <div className="cards-grid">
              <div className="card-container dashboard-card">
                <Dashboard investor={investor} />
              </div>
              <div className="card-container holdings-card">
                <Holdings portfolios={investor.portfolios || []} />
              </div>
              <div className="card-container orders-card">
                <Orders
                  portfolios={investor.portfolios || []}
                  investorId={investor.id}
                />
              </div>
              <div className="card-container profile-card">
                <Profile
                  investor={investor}
                  setInvestor={setInvestor}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
