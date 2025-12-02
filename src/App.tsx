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
  const [investor, setInvestor] = useState<Investor>({
    id: 1,
    firstName: "Alice",
    lastName: "Doe",
    email: "alice@example.com",
    riskProfile: "Moderate",
    portfolios: [],
  });
  const fetchPortfolios = async () => {
    const res = await fetch(
      "http://localhost:4000/api/portfolios?investorId=1"
    );
    const data = await res.json();
    const mappedPortfolios = data.portfolios.map((p: any) => ({
      pId: p.P_ID,
      id: p.ID,
      name: p.Name,
      accountBalance: parseFloat(p.Account_Balance),
      creationDate: p.Creation_Date,
      holdings: [], // placeholder
    }));
    setInvestor((prev) => ({ ...prev, portfolios: mappedPortfolios }));
  };

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        const investorRes = await fetch(
          `http://localhost:4000/api/investor/${investor.id}`
        );
        const investorData = await investorRes.json();
        const portfoliosRes = await fetch(
          `http://localhost:4000/api/portfolios?investorId=${investor.id}`
        );
        const portfoliosData = await portfoliosRes.json();
        const portfolios: Portfolio[] = portfoliosData.portfolios;

        const holdingsPromises = portfolios.map((p) =>
          fetch(`http://localhost:4000/api/holdings/${p.pId}`).then((res) =>
            res.json()
          )
        );

        const holdingsData = await Promise.all(holdingsPromises);
        const allHoldings: Holding[] = holdingsData.flatMap((h) => h.holdings);

        setInvestor({ ...investorData, portfolios });
        setHoldings(allHoldings);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data", err);
        setLoading(false);
      }
    };

    fetchInvestorData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="app">
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
    </div>
  );
}

export default App;
