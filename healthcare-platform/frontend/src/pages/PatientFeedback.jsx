import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function PatientFeedback() {
  const [rating, setRating] = useState(5);
  const [waitingExperience, setWaitingExperience] = useState("");
  const [doctorFeedback, setDoctorFeedback] = useState("");
  const [comments, setComments] = useState("");
  const [satisfactionScore, setSatisfactionScore] = useState(9);
  const [myFeedback, setMyFeedback] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  async function loadMyFeedback() {
    if (!token) {
      setMessage("Please login first to view feedback.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/feedback/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load feedback");
      }

      setMyFeedback(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitFeedback(event) {
    event.preventDefault();

    if (!token) {
      setMessage("Please login first to submit feedback.");
      return;
    }

    if (!waitingExperience.trim()) {
      setMessage("Waiting experience is required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(rating),
          waiting_experience: waitingExperience,
          doctor_feedback: doctorFeedback || null,
          comments: comments || null,
          satisfaction_score: Number(satisfactionScore),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Feedback submission failed");
      }

      setMessage("Feedback submitted successfully.");
      setRating(5);
      setWaitingExperience("");
      setDoctorFeedback("");
      setComments("");
      setSatisfactionScore(9);

      await loadMyFeedback();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyFeedback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Patient Experience
          </p>
          <h1 className="mt-2 text-3xl font-bold">Patient Feedback</h1>
          <p className="mt-3 max-w-2xl text-blue-50">
            Share your hospital experience, waiting time feedback, doctor consultation
            feedback, and overall satisfaction.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={submitFeedback}
            className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Submit Feedback
            </h2>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Overall Rating
            </label>
            <select
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Very Poor</option>
            </select>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Waiting Experience
            </label>
            <textarea
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              rows="3"
              value={waitingExperience}
              onChange={(event) => setWaitingExperience(event.target.value)}
              placeholder="Example: Waiting time was reasonable and queue updates were clear."
              required
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Doctor Feedback
            </label>
            <textarea
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              rows="3"
              value={doctorFeedback}
              onChange={(event) => setDoctorFeedback(event.target.value)}
              placeholder="Example: Doctor explained the issue clearly."
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Satisfaction Score / 10
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              value={satisfactionScore}
              onChange={(event) => setSatisfactionScore(event.target.value)}
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Additional Comments
            </label>
            <textarea
              className="mb-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              rows="3"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              placeholder="Any other comments?"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">My Feedback</h2>
              <button
                onClick={loadMyFeedback}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {myFeedback.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                No feedback submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myFeedback.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-bold text-slate-900">
                        Rating: {item.rating}/5
                      </p>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Score: {item.satisfaction_score || "-"} / 10
                      </span>
                    </div>

                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Waiting:</span>{" "}
                      {item.waiting_experience}
                    </p>

                    {item.doctor_feedback && (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold">Doctor:</span>{" "}
                        {item.doctor_feedback}
                      </p>
                    )}

                    {item.comments && (
                      <p className="mt-2 text-sm text-slate-700">
                        <span className="font-semibold">Comments:</span>{" "}
                        {item.comments}
                      </p>
                    )}

                    <p className="mt-3 text-xs text-slate-400">
                      Submitted on{" "}
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}