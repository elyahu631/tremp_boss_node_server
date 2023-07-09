import express, { Request, Response } from 'express';
import cors from 'cors';
import { PORT } from './config/environment';
import userRoutes from './resources/users/UserRoutes';  
import adminRouter from './resources/adminUsers/AdminRoutes';  
import tremprRouter from './resources/tremps/TrempRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  res.send('server runinig');
});


app.use('/api/users', userRoutes);
app.use('/api/adminUsers', adminRouter); 
app.use("/api/tremps", tremprRouter);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
