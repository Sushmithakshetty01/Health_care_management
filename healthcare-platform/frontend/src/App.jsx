import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Symptoms from "./pages/Symptoms";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Features from "./pages/Features";
import FeatureDetail from "./pages/FeatureDetail";
import SmartQueuePrediction from "./pages/SmartQueuePrediction";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotificationsDashboard from "./pages/NotificationsDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />

          <Route
            path="/features"
            element={
              <ProtectedRoute>
                <Features />
              </ProtectedRoute>
            }
          />

          <Route
            path="/features/:slug"
            element={
              <ProtectedRoute>
                <FeatureDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/smart-queue-prediction"
            element={
              <ProtectedRoute>
                <SmartQueuePrediction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics-dashboard"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications-dashboard"
            element={
              <ProtectedRoute>
                <NotificationsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/symptoms"
            element={
              <ProtectedRoute role="user">
                <Symptoms />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}