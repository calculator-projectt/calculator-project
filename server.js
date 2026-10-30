// Calculator backend - Node.js + Express
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Serve only the frontend files (all code lives in one folder)
const FRONTEND = ["index.html", "style.css", "script.js"];
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/:file", (req, res, next) => {
  if (FRONTEND.includes(req.params.file)) {
    return res.sendFile(path.join(__dirname, req.params.file));
  }
  next();
});

// Core calculation logic
function calculate(a, b, operator) {
  switch (operator) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    case "%": return a % b;
    case "^": return Math.pow(a, b);
    default:
      throw new Error("Unsupported operator: " + operator);
  }
}

// POST /api/calculate  body: { "a": 10, "b": 5, "operator": "+" }
app.post("/api/calculate", (req, res) => {
  const { a, b, operator } = req.body || {};
  const x = Number(a);
  const y = Number(b);

  if (a === undefined || b === undefined || !Number.isFinite(x) || !Number.isFinite(y)) {
    return res.status(400).json({ error: "Please send two valid numbers" });
  }

  try {
    const raw = calculate(x, y, operator);
    const result = Number(raw.toPrecision(12)); // removes 0.1+0.2 noise
    console.log(`${x} ${operator} ${y} = ${result}`);
    res.json({ a: x, b: y, operator, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Calculator running at http://localhost:${PORT}`);
});
