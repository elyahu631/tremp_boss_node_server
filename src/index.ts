// index.js
import express, { Request, Response } from 'express';
import cors from 'cors';
import db from './utils/db'; 

import { PORT } from './config/environment';
import userRoutes from './resources/users/UserRoutes';
import adminRoutes from './resources/adminUsers/AdminRoutes';
import trempRoutes from './resources/tremps/TrempRoutes';
import giftRoutes from './resources/gifts/GiftRoutes';
import groupRoutes from './resources/groups/GroupRoutes';
import { jsonErrorHandler } from './middleware/jsonErrorHandler';
import kpiRoutes from './resources/kpis/KpiRoutes';
import userGroupsRoutes from './resources/usersGroups/UserGroupsRoutes';
import groupRequestRoutes from './resources/groupRequest/GroupRequestRoutes';

const app = express();
app.use(cors());// enable CORS 
app.use(express.json());// parse incoming requests with JSON
app.use(jsonErrorHandler);

app.get('/', async (req: Request, res: Response) => {
  res.send('server runinig');
});

//main api routs
app.use('/api/users', userRoutes);
app.use('/api/adminUsers', adminRoutes);
app.use("/api/tremps", trempRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/user-groups', userGroupsRoutes);
app.use('/api/group-request', groupRequestRoutes);
app.use('/api/kpis', kpiRoutes);


const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close(); // close the HTTP server
  await db.client.close(); // close the MongoDB connection
  process.exit(0);
});
