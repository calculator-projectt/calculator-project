// Calculator frontend - sends each operation to the Node.js backend
const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const statusEl = document.getElementById("status");

const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" };

let current = "0";     // number being typed
let previous = null;   // first operand
let operator = null;   // pending operator
let justCalculated = false;

function render(errorMsg) {
  if (errorMsg) {
    resultEl.textContent = errorMsg;
    resultEl.classList.add("error");
  } else {
    resultEl.textContent = current;
    resultEl.classList.remove("error");
  }
  expressionEl.textContent =
    previous !== null && operator ? `${previous} ${SYMBOLS[operator]}` : "";
}

// Call the backend API
async function compute(a, b, op) {
  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a, b, operator: op }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Calculation failed");
  return data.result;
}

function inputNumber(n) {
  if (justCalculated) { current = "0"; justCalculated = false; }
  if (n === "." && current.includes(".")) return;
  current = current === "0" && n !== "." ? n : current + n;
  render();
}

async function chooseOperator(op) {
  if (previous !== null && operator && !justCalculated) {
    await equals();               // chain: 2 + 3 + ...
    if (resultEl.classList.contains("error")) return;
  }
  previous = current;
  operator = op;
  current = "0";
  justCalculated = false;
  render();
}

async function equals() {
  if (previous === null || !operator) return;
  const a = previous, b = current, op = operator;
  try {
    statusEl.textContent = "Calculating on server…";
    const result = await compute(a, b, op);
    expressionEl.textContent = `${a} ${SYMBOLS[op]} ${b} =`;
    current = String(result);
    previous = null;
    operator = null;
    justCalculated = true;
    resultEl.textContent = current;
    resultEl.classList.remove("error");
    statusEl.textContent = "";
  } catch (err) {
    clearAll();
    render(err.message);
    statusEl.textContent = "";
  }
}

function clearAll() {
  current = "0"; previous = null; operator = null; justCalculated = false;
  render();
}

function backspace() {
  if (justCalculated) return;
  current = current.length > 1 ? current.slice(0, -1) : "0";
  if (current === "-") current = "0";
  render();
}

function toggleSign() {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  render();
}

// Button clicks
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { num, op, action } = btn.dataset;
  if (num !== undefined) inputNumber(num);
  else if (op) chooseOperator(op);
  else if (action === "equals") equals();
  else if (action === "clear") clearAll();
  else if (action === "back") backspace();
  else if (action === "sign") toggleSign();
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (/^[0-9.]$/.test(e.key)) inputNumber(e.key);
  else if (["+", "-", "*", "/", "%"].includes(e.key)) chooseOperator(e.key);
  else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); equals(); }
  else if (e.key === "Backspace") backspace();
  else if (e.key === "Escape") clearAll();
});

render();
