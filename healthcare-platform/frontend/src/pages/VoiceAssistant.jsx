import { useEffect, useRef, useState } from "react";
import { Bot, Mic, MicOff, Send, Volume2, History, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function VoiceAssistant() {
  const [queryText, setQueryText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [intent, setIntent] = useState("");
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  function setupSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage("Speech recognition is not supported in this browser. You can type your query.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setMessage("Listening...");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setQueryText(spokenText);
      setMessage("Voice captured. Click Ask Assistant to submit.");
    };

    recognition.onerror = () => {
      setListening(false);
      setMessage("Could not capture voice. Please try again or type your query.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    return recognition;
  }

  function startListening() {
    let recognition = recognitionRef.current;

    if (!recognition) {
      recognition = setupSpeechRecognition();
      recognitionRef.current = recognition;
    }

    if (recognition) {
      recognition.start();
    }
  }

  function speakResponse(text) {
    if (!window.speechSynthesis) {
      setMessage("Text-to-speech is not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function askAssistant(event) {
    event?.preventDefault();

    if (!token) {
      setMessage("Please login first.");
      return;
    }

    if (!queryText.trim()) {
      setMessage("Please speak or type a question.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResponseText("");
    setIntent("");

    try {
      const response = await fetch(`${API_URL}/voice-assistant/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query_text: queryText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Voice assistant request failed");
      }

        setResponseText(data.response_text);
        setQueryText("");
        setIntent(data.intent);
      setMessage("Assistant response generated successfully.");

      await loadHistory();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/voice-assistant/my-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load history");
      }

      setHistory(data);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const sampleQuestions = [
    "What is my queue status?",
    "Show my appointments",
    "Which doctors are available?",
    "Which departments are available?",
    "What can you do?",
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 p-8 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3">
              <Bot size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-100">
                Patient Assistant
              </p>
              <h1 className="text-3xl font-bold">Voice AI Assistant</h1>
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-orange-50">
            Ask about your queue status, appointments, available doctors and hospital services using voice or text.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm font-medium text-orange-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Sparkles className="text-orange-500" size={22} />
              <h2 className="text-xl font-bold text-slate-900">
                Ask Assistant
              </h2>
            </div>

            <form onSubmit={askAssistant}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Your Question
              </label>

              <textarea
                className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-500"
                rows="4"
                value={queryText}
                onChange={(event) => setQueryText(event.target.value)}
                placeholder="Example: What is my queue status?"
              />

              <div className="mb-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startListening}
                  disabled={listening}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:bg-orange-300"
                >
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  {listening ? "Listening..." : "Speak"}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                >
                  <Send size={18} />
                  {loading ? "Asking..." : "Ask Assistant"}
                </button>
              </div>
            </form>

            <div className="mb-6">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Try sample questions:
              </p>

              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setQueryText(question)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {responseText && (
              <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-orange-700">
                      Assistant Response
                    </p>
                    <p className="text-xs text-slate-500">
                      Detected intent: {intent || "N/A"}
                    </p>
                  </div>

                  <button
                    onClick={() => speakResponse(responseText)}
                    className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-orange-700 shadow-sm hover:bg-orange-100"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                <p className="leading-7 text-slate-800">{responseText}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="text-blue-600" size={22} />
                <h2 className="text-xl font-bold text-slate-900">
                  My Assistant History
                </h2>
              </div>

              <button
                onClick={loadHistory}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {history.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                No assistant history yet.
              </p>
            ) : (
              <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {item.intent}
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-900">
                      Q: {item.query_text}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      A: {item.response_text}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
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