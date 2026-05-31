require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const inspectionRoutes = require('./routes/inspections');
const violationRoutes = require('./routes/violations');
const reportRoutes = require('./routes/reports');

const app = express();

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadDir));

app.get('/health', (_req, res) => res.json({ ok: true, name: 'BuildCheck Monitor API' }));

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/inspections', inspectionRoutes);
app.use('/violations', violationRoutes);
app.use('/reports', reportRoutes);

// Centralized error handler
app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    details: err.details || undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`BuildCheck Monitor API listening on http://localhost:${PORT}`);
});
