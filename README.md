# Backend (Express + PostgreSQL on Neon)

✅ Form validation:

Ensures text is a non-empty string with at least 3 characters before adding a task.

Ensures completed is a boolean when updating a task.

✅ Error handling:

Catches server errors and sends a 500 Internal Server Error response.

Returns 400 Bad Request for invalid input.

Returns 404 Not Found if the task doesn't exist.

✅ Trimmed text before inserting into the database for consistency.