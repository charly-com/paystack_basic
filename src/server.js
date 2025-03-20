const app = require('./app');
const connectDB = require('./config/database');

const port = process.env.PORT || 3001;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});