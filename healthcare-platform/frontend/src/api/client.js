const API_URL = "http://127.0.0.1:8000";

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

  const text = await response.text();

  console.log("RAW RESPONSE:", text);

  let data = {};

  try {
    data = JSON.parse(text);
  } catch {}

  if (!response.ok) {
    console.log("API ERROR:", response.status, data);
    throw new Error(text);
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

export const bedResourceApi = {
  summary: () => api("/bed-resources/summary"),

  beds: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(
        ([, value]) => value !== "" && value != null
      )
    );

    return api(`/bed-resources/beds${query.size ? `?${query}` : ""}`);
  },

  createBed: (payload) =>
    api("/bed-resources/beds", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateBed: (bedId, payload) =>
    api(`/bed-resources/beds/${bedId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateBedStatus: (bedId, status) =>
    api(`/bed-resources/beds/${bedId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  assignBed: (bedId, payload) =>
    api(`/bed-resources/beds/${bedId}/assign`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  releaseBed: (bedId, notes = null) =>
    api(`/bed-resources/beds/${bedId}/release`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),

  patients: () => api("/bed-resources/patients"),

  assignments: () => api("/bed-resources/assignments"),

  resources: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(
        ([, value]) => value !== "" && value != null
      )
    );

    return api(`/bed-resources/resources${query.size ? `?${query}` : ""}`);
  },

  createResource: (payload) =>
    api("/bed-resources/resources", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateResource: (resourceId, payload) =>
    api(`/bed-resources/resources/${resourceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  adjustResource: (resourceId, payload) =>
    api(`/bed-resources/resources/${resourceId}/adjust`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  allocateResource: (resourceId, payload) =>
    api(`/bed-resources/resources/${resourceId}/allocate`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  allocations: (activeOnly = false) =>
    api(`/bed-resources/allocations?active_only=${activeOnly}`),

  releaseAllocation: (allocationId, notes = null) =>
    api(`/bed-resources/allocations/${allocationId}/release`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),

  transactions: () => api("/bed-resources/transactions"),
};

export const digitalTokenApi = {
  analytics: () =>
    api("/digital-token/analytics"),

  notifications: () =>
    api("/digital-token/notifications"),

  myTokens: () =>
    api("/digital-token/tokens/mine"),

  getToken: (tokenId) =>
    api(`/digital-token/tokens/${tokenId}`),

  tokenActivity: (tokenId) =>
    api(`/digital-token/tokens/${tokenId}/activity`),

  createToken: (payload) =>
    api("/digital-token/tokens", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  checkIn: (qrToken) =>
    api("/digital-token/checkin", {
      method: "POST",
      body: JSON.stringify({
        qr_token: qrToken,
      }),
    }),

    listTokens: () =>
  api("/digital-token/tokens"),

updateTokenStatus: (tokenId, status) =>
  api(`/digital-token/tokens/${tokenId}/status`, {
    method: "POST",
    body: JSON.stringify({
      status,
    }),
  }),

callNext: (departmentId) =>
  api(`/digital-token/departments/${departmentId}/call-next`, {
    method: "POST",
  }),
};



export const telemedicineApi = {
  analytics: () =>
    api("/telemedicine/analytics"),

  appointments: () =>
    api("/telemedicine/appointments"),

  createAppointment: (payload) =>
    api("/telemedicine/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  reports: () =>
    api("/telemedicine/reports"),

  deleteReport: async (reportId) => {
  const response = await fetch(
    `${API_URL}/telemedicine/reports/${reportId}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
},

deletePrescription: async (prescriptionId) => {
  const response = await fetch(
    `${API_URL}/telemedicine/prescriptions/${prescriptionId}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
},

updateAppointment: async (id, status) => {

    const response = await fetch(
        `${API_URL}/telemedicine/appointments/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status,
            }),
        }
    );

    return response.json();
},


  createReport: (payload) =>
    api("/telemedicine/reports", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  prescriptions: () =>
    api("/telemedicine/prescriptions"),

  createPrescription: (payload) =>
    api("/telemedicine/prescriptions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getPrescriptions: async () => {
  const response = await fetch(
    `${API_URL}/telemedicine/prescriptions`
  );

  return response.json();
},
};

// -------------------- Pharmacy --------------------

export const getMedicines = () =>
  api("/pharmacy/medicines");

export const getAlerts = () =>
  api("/pharmacy/alerts");

export const getPrescriptions = () =>
  api("/pharmacy/prescriptions");

export const addMedicine = (payload) =>
  api("/pharmacy/medicines", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateMedicine = (id, payload) =>
  api(`/pharmacy/medicines/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteMedicine = (id) =>
  api(`/pharmacy/medicines/${id}`, {
    method: "DELETE",
  });

export const updatePrescriptionStatus = async (id, status) => {

    const response = await fetch(
        `${API_URL}/pharmacy/prescriptions/${id}?status=${status}`,
        {
            method: "PATCH",
        }
    );

    return response.json();
};