// Database Types based on ER Model

import { ReactNode } from "react";

export interface User {
  user_id: number;
  city_id: number;
  email: string;
  password: string;
  username: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface City {
  city_id: number;
  city_name: string;
  cost_of_living: number;
}

export interface Category {
  category_id: number;
  category_name: string;
  category_type: "income" | "expense";
  icon: string;
}

export interface Transaction {
  category: ReactNode;
  icon: ReactNode;
  type: string;
  transaction_id: number;
  user_id: number;
  category_id: number;
  amount: number;
  transaction_type: "income" | "expense";
  transaction_date: Date | string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Report {
  report_id: number;
  user_id: number;
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  generated_at?: Date;
}

// API Request/Response Types
export interface CreateTransactionRequest {
  user_id: number;
  category_id: number;
  amount: number;
  transaction_type: "income" | "expense";
  transaction_date: string;
  description?: string;
}

export interface TransactionWithCategory extends Transaction {
  category_name: string;
  icon: string;
}

export interface DashboardSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
  recent_transactions: TransactionWithCategory[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const CURRENT_USER_ID = 1;