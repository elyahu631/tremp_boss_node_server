// index.js
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PORT } from './config/environment';
import userRoutes from './resources/users/UserRoutes';
import adminRoutes from './resources/adminUsers/AdminRoutes';
import trempRoutes from './resources/tremps/TrempRoutes';
import giftRoutes from './resources/gifts/GiftRoutes';
import groupRoutes from './resources/groups/GroupRoutes';
import { jsonErrorHandler } from './middleware/jsonErrorHandler';
import kpiRoutes from './resources/kpis/KpiRoutes';
/** 
app object represents the entire web application and is responsible

for handling incoming requests, routing them to the appropriate handlers,

and generating responses.
*/
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
app.use('/api/kpis', kpiRoutes);


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
