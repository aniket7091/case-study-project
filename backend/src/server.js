// Load env vars FIRST — before any other module reads process.env
require("dotenv").config();

const app = require("./app");

// Fetch port from env file
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});