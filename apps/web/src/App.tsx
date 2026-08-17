import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { AccountPage } from "@/pages/AccountPage"
import { CreateAccountPage } from "@/pages/CreateAccountPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { LeaderboardPage } from "@/pages/LeaderboardPage"
import { LearnPage } from "@/pages/LearnPage"
import { LoginPage } from "@/pages/LoginPage"
import { PortfolioPage } from "@/pages/PortfolioPage"
import { TradePage } from "@/pages/TradePage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/trade" element={<TradePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
