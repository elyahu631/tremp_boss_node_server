// src/index.ts
import express, { Request, Response } from 'express';
import { PORT } from './config/environment';
import userRoutes from './resources/users/UserRoutes';  
import adminRouter from './resources/adminUsers/AdminRoutes';  
const app = express();
app.use(express.json());
app.get('/', async (req: Request, res: Response) => {
  res.send('server runinig');
});

app.use('/api/users', userRoutes);
app.use('/api/adminUsers', adminRouter); 

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
