const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));

// Banana Math Proxy Route - Solves CORS issues
app.get('/api/banana/question', async (req, res) => {
  try {
    console.log('🍌 Fetching banana math question from external API...');
    
    const response = await axios.get('https://marcconrad.com/uob/banana/api.php', {
      params: {
        task: 'math'
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Banana API response:', response.data);
    
    // Validate response
    if (!response.data || !response.data.question || typeof response.data.solution !== 'number') {
      throw new Error('Invalid response from banana API');
    }
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('❌ Banana API error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch banana question',
      error: error.message
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});