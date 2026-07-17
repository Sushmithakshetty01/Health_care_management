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

import BedResourceManagement from "./pages/BedResourceManagement";

import DigitalTokenQR from "./pages/DigitalTokenQR";
import AdminDigitalQueue from "./pages/AdminDigitalQueue";

import Telemedicine from "./pages/Telemedicine";
import AdminTelemedicine from "./pages/AdminTelemedicine";

import PharmacyDashboard from "./pages/PharmacyDashboard";
import AdminPharmacyDashboard from "./pages/AdminPharmacyDashboard";

import AdminDiagnosticQueue from './pages/AdminDiagnosticQueue';

import AmbulanceRequest from "./pages/AmbulanceRequest"; 
import AdminAmbulance from "./pages/AdminAmbulance";

import AdminSaaS from "./pages/AdminSaaS";
import UserSaaS from "./pages/UserSaaS";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          {/* HOME */}

          <Route path="/" element={<Home />} />

          {/* AUTH */}

          <Route
            path="/login"
            element={<Auth mode="login" />}
          />

          <Route
            path="/signup"
            element={<Auth mode="signup" />}
          />

          {/* FEATURES */}

          <Route
            path="/features"
            element={
              <ProtectedRoute>
                <Features />
              </ProtectedRoute>
            }
          />
          
          {/* DIGITAL TOKEN PAGE */}
          <Route
            path="/features/digital-token-qr"
            element={
              <ProtectedRoute>
                <DigitalTokenQR />
              </ProtectedRoute>
            }
          />

          <Route
  path="/features/telemedicine"
  element={
    <ProtectedRoute>
      <Telemedicine />
    </ProtectedRoute>
  }
/>

          {/* FEATURE DETAILS */}

          <Route
            path="/features/:slug"
            element={
              <ProtectedRoute>
                <FeatureDetail />
              </ProtectedRoute>
            }
          />

          {/* USER MODULES */}

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
            path="/features/bed-resource-management"
            element={
              <ProtectedRoute>
                <BedResourceManagement />
              </ProtectedRoute>
            }
          />

          {/* DASHBOARDS */}

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

          {/* USER */}

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

          {/* ADMIN */}

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

       

            <Route
  path="/admin/telemedicine"
  element={
    <ProtectedRoute role="admin">
      <AdminTelemedicine />
    </ProtectedRoute>
  }
  
/><Route
  path="/admin/digital-queue"
  element={<AdminDigitalQueue />}
/>
<Route
  path="/admin/diagnostic-queue"
  element={
    <ProtectedRoute role="admin">
      <AdminDiagnosticQueue />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/digital-queue"
  element={
    <ProtectedRoute role="admin">
      <AdminDigitalQueue />
    </ProtectedRoute>
  }
/>
<Route
    path="/features/pharmacy"
    element={
        <ProtectedRoute role="user">
            <PharmacyDashboard />
        </ProtectedRoute>
    }
/>

<Route
    path="/admin/pharmacy"
    element={
        <ProtectedRoute role="admin">
            <AdminPharmacyDashboard />
        </ProtectedRoute>
    }
/>
{/* USER VIEW FOR AMBULANCE */}
<Route
  path="/features/ambulance-tracking"
  element={
    <ProtectedRoute role="user">
      <AmbulanceRequest />
    </ProtectedRoute>
  }
/>

{/* ADMIN VIEW FOR AMBULANCE */}
<Route
  path="/admin/ambulance-tracking"
  element={
    <ProtectedRoute role="admin">
      <AdminAmbulance />
    </ProtectedRoute>
  }
/>
{/* Admin SaaS Route */}
<Route path="/admin/saas" element={<AdminSaaS />} />

{/* User SaaS Route */}
<Route path="/features/multi-hospital-saas" element={<UserSaaS />} />
        </Routes>

        

      </Layout>
    </BrowserRouter>
  );
}