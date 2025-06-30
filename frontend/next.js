import { useState, useEffect } from "react";

export default function Home() {
  const BACKEND_URL =
    "https://a1a01c3c-3efd-4dbc-b944-2de7bec0d5c1-00-b7jcjcvwjg4y.pike.replit.dev/";

  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState([]);
  const [newTicker, setNewTicker] = useState("");
  const [message, setMessage] = useState("");

  // Fetch current portfolio from backend
  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/portfolio`);
      const data = await res.json();
      setPortfolio(data.portfolio || []);
    } catch (error) {
      setMessage("Error fetching portfolio");
    }
  };

  // Fetch portfolio summary (prices etc)
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/portfolio/summary`);
      const data = await res.json();
      setSummary(data.summary || []);
    } catch (error) {
      setMessage("Error fetching summary");
    }
  };

  // Add new ticker
  const addTicker = async () => {
    if (!newTicker.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/portfolio/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: newTicker.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setNewTicker("");
        fetchPortfolio();
        fetchSummary();
      } else {
        setMessage(data.detail || "Failed to add ticker");
      }
    } catch (error) {
      setMessage("Error adding ticker");
    }
  };

  // Remove ticker
  const removeTicker = async (ticker) => {
    try {
      const res = await fetch(`${BACKEND_URL}/portfolio/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchPortfolio();
        fetchSummary();
      } else {
        setMessage(data.detail || "Failed to remove ticker");
      }
    } catch (error) {
      setMessage("Error removing ticker");
    }
  };

  // Send daily email report
  const sendEmail = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/send-email`);
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || "Failed to send email");
      }
    } catch (error) {
      setMessage("Error sending email");
    }
  };

  // Load portfolio & summary on first render
  useEffect(() => {
    fetchPortfolio();
    fetchSummary();
  }, []);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial",
      }}
    >
      <h1>📈 Stock Portfolio Tracker</h1>

      <div>
        <input
          type="text"
          placeholder="Enter ticker e.g. AAPL"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          style={{ padding: 8, width: "70%", marginRight: 8 }}
        />
        <button onClick={addTicker} style={{ padding: "8px 16px" }}>
          Add Ticker
        </button>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <h2>Your Portfolio</h2>
      {portfolio.length === 0 ? (
        <p>No stocks added yet.</p>
      ) : (
        <ul>
          {portfolio.map((ticker) => (
            <li key={ticker}>
              {ticker}{" "}
              <button
                onClick={() => removeTicker(ticker)}
                style={{ color: "red", marginLeft: 10 }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2>Portfolio Summary</h2>
      {summary.length === 0 ? (
        <p>No summary available.</p>
      ) : (
        <table
          border="1"
          cellPadding="6"
          cellSpacing="0"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Price</th>
              <th>Change %</th>
            </tr>
          </thead>
          <tbody>
            {summary.map(({ ticker, price, change_percent, error }) => (
              <tr key={ticker}>
                <td>{ticker}</td>
                <td>{price}</td>
                <td>{change_percent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={sendEmail}
        style={{ marginTop: 20, padding: "10px 20px" }}
      >
        Send Daily Email Report
      </button>
    </div>
  );
}
