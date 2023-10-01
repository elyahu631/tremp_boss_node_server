// index.js
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PORT } from './config/environment';
import userRoutes from './resources/users/UserRoutes';
import adminRoutes from './resources/adminUsers/AdminRoutes';
import trempRoutes from './resources/tremps/TrempRoutes';
import groupRoutes from './resources/groups/GroupRoutes';
import { jsonErrorHandler } from './middleware/jsonErrorHandler';
import kpiRoutes from './resources/kpis/KpiRoutes';
import userGroupsRoutes from './resources/usersGroups/UserGroupsRoutes';
import groupRequestRoutes from './resources/groupRequest/GroupRequestRoutes';
import { startTrempCronJob } from './resources/tremps/TrempCronJob';

const app = express();
app.use(cors());// enable CORS 
app.use(express.json());// parse incoming requests with JSON
app.use(jsonErrorHandler);
startTrempCronJob();

app.get('/', async (req: Request, res: Response) => {
  res.send('server runinig');
});

//main api routs
app.use('/api/users', userRoutes);
app.use('/api/adminUsers', adminRoutes);
app.use("/api/tremps", trempRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/user-groups', userGroupsRoutes);
app.use('/api/group-request', groupRequestRoutes);
app.use('/api/kpis', kpiRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

