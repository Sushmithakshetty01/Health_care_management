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
import PatientFeedback from "./pages/PatientFeedback";
import AdminFeedback from "./pages/AdminFeedback";
import VoiceAssistant from "./pages/VoiceAssistant";
import AdminVoiceAssistant from "./pages/AdminVoiceAssistant";
import DiseaseRiskPrediction from "./pages/DiseaseRiskPrediction";
import AdminDiseaseRisk from "./pages/AdminDiseaseRisk";
import HealthHistoryDashboard from "./pages/HealthHistoryDashboard";
import AdminHealthHistory from "./pages/AdminHealthHistory";

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
            path="/features/patient-feedback"
            element={
              <ProtectedRoute role="user">
                <PatientFeedback />
              </ProtectedRoute>
            }
          />

          <Route
            path="/features/voice-ai-assistant"
            element={
              <ProtectedRoute role="user">
                <VoiceAssistant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/features/disease-risk-prediction"
            element={
              <ProtectedRoute role="user">
                <DiseaseRiskPrediction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/features/health-history-dashboard"
            element={
              <ProtectedRoute role="user">
                <HealthHistoryDashboard />
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

          <Route
            path="/admin/patient-feedback"
            element={
              <ProtectedRoute role="admin">
                <AdminFeedback />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/voice-ai-assistant"
            element={
              <ProtectedRoute role="admin">
                <AdminVoiceAssistant />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/disease-risk-prediction"
            element={
              <ProtectedRoute role="admin">
                <AdminDiseaseRisk />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/health-history-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminHealthHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}