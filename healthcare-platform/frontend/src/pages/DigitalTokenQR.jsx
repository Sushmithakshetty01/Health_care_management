import { QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { digitalTokenApi } from "../api/client";
import { QRCodeCanvas } from "qrcode.react";

export default function DigitalTokenQR() {
    const [tokenNumber, setTokenNumber] = useState(100);

const [notifications, setNotifications] = useState([]);

const [currentToken, setCurrentToken] = useState(null);

const [timeline, setTimeline] = useState([
  {
    action: "System Started",
    time: new Date().toLocaleTimeString()
  }
]);


    const [analytics, setAnalytics] = useState(null);
    const [queuePosition, setQueuePosition] = useState(0);
const [estimatedWait, setEstimatedWait] = useState(0);
const [qrToken, setQrToken] = useState("");


    const generateToken = async () => {
  try {
    
    const result = await digitalTokenApi.createToken({
      department_id: "0cf5ad14-52a7-449a-86da-9998853e8875",
       patient_name: "Tanmay"
    });
    setCurrentToken(result.token);

    console.log("Token Created:", result);

    setQueuePosition(result.token.position);
setEstimatedWait(result.token.estimated_wait_minutes);
setQrToken(result.token.qr_token);

    setCurrentToken(result.token);
    setNotifications(prev => [
  {
    id: Date.now(),
    title: "Token Issued",
    message: `${result.token.token_number} created successfully`
  },
  ...prev
]);

    setTimeline(prev => [
  {
    id: Date.now(),
    action: `Token ${result.token.token_number} Generated`,
    time: new Date().toLocaleTimeString()
  },
  ...prev
]);


  } catch (err) {
    console.error("Create Token Error:", err);
  }
};
    

    useEffect(() => {
  fetch("http://127.0.0.1:8000/digital-token/analytics")
    .then((res) => res.json())
    .then((data) => {
      console.log("Analytics:", data);
      setAnalytics(data);
    })
    .catch((err) => {
      console.error("Analytics Error:", err);
    });
}, []);

useEffect(() => {
  fetch("http://127.0.0.1:8000/digital-token/notifications")
    .then((res) => res.json())
    .then((data) => {
      console.log("Notifications:", data);
      setNotifications(data);
    })
    .catch((err) => {
      console.error("Notification Error:", err);
    });
}, []);

const checkInToken = async () => {
  try {
    const result = await digitalTokenApi.checkIn(qrToken);

console.log("Check In Success:", result.token);
console.log("Token Type:", typeof result.token);
console.log("Is Array:", Array.isArray(result.token));
    setCurrentToken(result.token);

    setTimeline((prev) => [
      {
        id: Date.now(),
        action: "Patient Checked In",
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);

  } catch (err) {
    console.error("Check In Error:", err);
  }
};

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <QrCode size={30} />
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            QR Check-In
          </span>
        </div>

        <h1 className="text-4xl font-bold mb-3">
          Digital Token & QR Queue System
        </h1>

        <p className="max-w-3xl text-blue-100">
          Generates QR tokens for digital check-in and live queue
          tracking without physical waiting lines.
        </p>
      </section>

      <button
  onClick={generateToken}
  className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700"
>
  Generate Token
</button>

{currentToken && currentToken.status === "waiting" && (
  <button
    onClick={checkInToken}
    className="bg-green-600 text-white px-6 py-3 rounded-xl ml-4"
  >
    Check In
  </button>
)}

{qrToken && (
  <div className="bg-white rounded-3xl shadow-lg p-6">
  <h3 className="text-2xl font-bold mb-4">
    QR Verification Token
  </h3>

  {qrToken && (
    <div className="flex flex-col items-center">
      <QRCodeCanvas
        value={qrToken}
        size={180}
      />

      <p className="mt-4 text-sm text-gray-500 break-all">
        {qrToken}
      </p>
    </div>
  )}
</div>
)}

      {/* Metrics Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Queue Overview
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-blue-500">
  <p className="text-gray-500 text-sm">
    Current Token
  </p>
<p className="mt-2 text-lg font-semibold">
  Status: {currentToken?.status || "waiting"}
</p>



  <h3 className="text-4xl font-bold text-blue-600 mt-2">
  {currentToken?.token_number || "No Token"}
</h3>      

  <p className="text-sm text-gray-400 mt-2">
    Currently being served
  </p>

<p className="text-sm text-blue-600 mt-2">
  Queue Position: {queuePosition}
</p>

<p className="text-sm text-orange-600">
  Estimated Wait: {estimatedWait} mins
</p>

</div>

          <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-green-500">
  <p className="text-gray-500 text-sm">
    Checked In
  </p>

  <h3 className="text-4xl font-bold text-green-600 mt-2">
    {analytics?.checked_in_tokens || 0}
  </h3>

  <p className="text-sm text-gray-400 mt-2">
    Patients verified
  </p>
</div>

          <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-red-500">
  <p className="text-gray-500 text-sm">
    Skipped Tokens
  </p>

  <h3 className="text-4xl font-bold text-red-600 mt-2">
    {analytics?.skipped_tokens || 0}
  </h3>

  <p className="text-sm text-gray-400 mt-2">
    Missed queue entries
  </p>
</div>

        </div>
      </section>


      {/* Placeholder Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-3xl shadow p-6">
  <h2 className="text-xl font-semibold mb-3">
    Notifications
  </h2>

  {notifications.length === 0 ? (
    <p className="text-gray-500">
      No notifications available
    </p>
  ) : (
    notifications.map((n) => (
      <div
        key={n.id}
        className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-3 mb-3"
      >
        <h4 className="font-semibold">
          {n.title}
        </h4>

        <p className="text-sm text-gray-600">
          {n.message}
        </p>
      </div>
    ))
  )}
</div>

        <div className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-xl font-semibold mb-3">
            Activity Timeline
          </h2>

          <div className="space-y-4">
  {timeline.map((activity, index) => (
    <div
      key={activity.id || index}
      className="flex items-center justify-between border-l-4 border-cyan-500 bg-cyan-50 p-3 rounded-lg"
    >
      <div>
        <h4 className="font-semibold">
          {activity.action}
        </h4>
      </div>

      <span className="text-sm text-gray-500">
        {activity.time}
      </span>
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  );
}
