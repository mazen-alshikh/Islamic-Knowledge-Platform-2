import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { initializeDatabase } from './config/database.js';
import { QuranService } from './services/quranService.js';
import { authMiddleware } from './middleware/auth.js';
import { authRoutes } from './routes/auth.js';
import { resourceRoutes } from './routes/resources.js';
import { searchRoutes } from './routes/search.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

// Ensure required directories exist
const dirs = [
  join(__dirname, 'data'),
  join(__dirname, 'uploads')
];

dirs.forEach(dir => {
  try {
    mkdirSync(dir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create directory ${dir}:`, err);
  }
});

// Initialize database and load Quran dataset
async function initialize() {
  try {
    await initializeDatabase();
    await QuranService.initializeDataset();
    console.log('Database and Quran dataset initialized successfully');
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', authMiddleware, resourceRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

initialize().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});