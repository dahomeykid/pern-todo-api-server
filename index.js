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

// Get Home API
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Todos API" });
});

// Get all todos
app.get("/todos", async (req, res) => {
  const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
  res.json(result.rows);
});

// Add a new todo
app.post("/todos", async (req, res) => {
  const { text } = req.body;
  const result = await pool.query(
    "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
    [text, false]
  );
  res.json(result.rows[0]);
});

// Update a todo
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const result = await pool.query(
    "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
    [completed, id]
  );
  res.json(result.rows[0]);
});

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM todos WHERE id = $1", [id]);
  res.json({ message: "Deleted successfully" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));