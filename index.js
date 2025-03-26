import {config} from 'dotenv';
import express from 'express';
import cors from 'cors';
import pkg from 'pg';

config();
const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Middleware for error handling
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
};

// Validation function
const validateTodo = (req, res, next) => {
  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim().length < 3) {
    return res.status(400).json({ error: "Todo text must be at least 3 characters long" });
  }
  next();
};


// Get Home API
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Todos API" });
});

// Get all todos
app.get("/todos", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Add a new todo with validation
app.post("/todos", validateTodo, async (req, res, next) => {
  try {
    const { text } = req.body;
    const result = await pool.query(
      "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
      [text.trim(), false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});


// Update a todo
app.put("/todos/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Completed status must be true or false" });
    }

    const result = await pool.query(
      "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
      [completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete a todo
app.delete("/todos/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));