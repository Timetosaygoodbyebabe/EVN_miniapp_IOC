const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/public', express.static('public'));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Khởi chạy Weather Cronjob
const weatherCron = require('./cron/weatherCron');

// Khởi chạy EVN Sync Cronjob
const evnSyncCron = require('./cron/evnSyncCron');

// Endpoint Thời tiết hôm nay (Từ Cache)
app.get('/api/weather/today', (req, res) => {
  const weather = weatherCron.getWeatherCache();
  if (!weather) {
    return res.status(503).json({ error: "Weather data is not ready yet." });
  }
  res.json(weather);
});

// Endpoint Dự báo thời tiết ngày cúp điện (Từ Cache)
app.get('/api/weather/forecast', async (req, res) => {
  const { date, phuongXa } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Missing date parameter" });
  }
  
  const forecast = await weatherCron.getForecastForDate(date, phuongXa);
  if (!forecast) {
    return res.status(503).json({ error: "Could not fetch forecast for the given date." });
  }
  res.json(forecast);
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
