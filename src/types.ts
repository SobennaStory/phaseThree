export interface Investor {
  id: number;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  email: string;
  riskProfile: "Conservative" | "Moderate" | "Aggressive" | "Very Aggressive";
  portfolios?: Portfolio[];
}

export interface Portfolio {
  pId: number;
  id: number;
  name: string;
  accountBalance: number;
  creationDate: string;
  holdings?: Holding[];
}

export interface Stock {
  S_ID: number;
  Company_Name: string;
  Sector: string;
}

export interface StockSector {
  sId: number;
  sector: string;
}

export interface MarketListing {
  sId: number;
  exchangeCode: string;
  symbolCode: string;
}

export interface Holding {
  pId: number;
  sId: number;
  purchasePrice: number;
  quantity: number;
}

export interface Order {
  orderId: number;
  date: string;
  price: number;
  quantity: number;
  sId: number;
  id: number;
  status: "Pending" | "Completed" | "Cancelled" | "Failed";
}

export interface BuyOrder {
  orderId: number;
  paymentType:
    | "Credit Card"
    | "Debit Card"
    | "Bank Transfer"
    | "Wire Transfer"
    | "Cash";
}

export interface SellOrder {
  orderId: number;
  settlementDate: string;
}
