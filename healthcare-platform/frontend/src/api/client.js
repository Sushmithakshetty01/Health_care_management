const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function setSession(data) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function api(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.log("API ERROR:", response.status, data);

    let message = "Something went wrong";

    if (typeof data.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data.detail)) {
      message = data.detail
        .map((err) => `${err.loc?.join(".")} - ${err.msg}`)
        .join(", ");
    }

    throw new Error(message);
  }

  return data;
}

export const authApi = {
  signup: (payload) =>
    api("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    api("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => api("/auth/me"),
};

export const symptomsApi = {
  getSymptoms: (query = "") => {
    const q = query ? `?q=${encodeURIComponent(query)}` : "";
    return api(`/symptoms${q}`);
  },

  submitSymptoms: (payload) =>
    api("/symptom-submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const hospitalApi = {
  departments: () => api("/departments"),

  doctors: () => api("/doctors"),

  analyticsOverview: () => api("/analytics/overview"),

  createDoctor: (payload) =>
    api("/admin/doctors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateDoctor: (doctorId, payload) =>
    api(`/admin/doctors/${doctorId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateDoctorAvailability: (doctorId, isAvailable) =>
    api(
      `/admin/doctors/${doctorId}/availability?is_available=${isAvailable}`,
      {
        method: "PATCH",
      }
    ),

  updateDoctorPatientCount: (doctorId, count) =>
    api(
      `/admin/doctors/${doctorId}/patient-count?current_patient_count=${count}`,
      {
        method: "PATCH",
      }
    ),

  myQueue: () => api("/queue/my"),

  adminQueue: () => api("/admin/queue"),

  confirmQueueAppointment: (queueId) =>
    api(`/queue/${queueId}/confirm`, {
      method: "PATCH",
    }),

  updateQueueStatus: (queueId, status) =>
    api(`/admin/queue/${queueId}/status?status=${encodeURIComponent(status)}`, {
      method: "PATCH",
    }),

  bookAppointment: (payload) =>
    api("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  myAppointments: () => api("/appointments/my"),

  adminAppointments: () => api("/admin/appointments"),
};