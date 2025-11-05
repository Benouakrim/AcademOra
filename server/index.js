import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import orientationRoutes from './routes/orientation.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import matchingRoutes from './routes/matching.js';
import adminUniversityRoutes from './routes/adminUniversities.js';
import universitiesRoutes from './routes/universities.js';
import universityGroupsRoutes from './routes/universityGroups.js';
import adminUniversityGroupsRoutes from './routes/adminUniversityGroups.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/orientation', orientationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/matching', matchingRoutes);
// Public universities (no auth required)
app.use('/api/universities', universitiesRoutes);
// Public university groups (no auth required)
app.use('/api/university-groups', universityGroupsRoutes);
// Admin universities CRUD
app.use('/api/admin/universities', adminUniversityRoutes);
// Admin university groups CRUD
app.use('/api/admin/university-groups', adminUniversityGroupsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AcademOra API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

