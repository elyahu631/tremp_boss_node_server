import express, { Request, Response } from 'express';
import cors from 'cors';
import { PORT } from './config/environment';
import userRoutes from './resources/users/UserRoutes';  
import adminRoutes from './resources/adminUsers/AdminRoutes';  
import trempRoutes from './resources/tremps/TrempRoutes';
import giftRoutes from './resources/gifts/GiftRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  res.send('server runinig');
});


app.use('/api/users', userRoutes);
app.use('/api/adminUsers', adminRoutes); 
app.use("/api/tremps", trempRoutes);
app.use('/api/gifts', giftRoutes);


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
