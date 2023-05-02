import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import 'dotenv/config';
import cors from 'cors';

const app = express();
app.use(helmet());
app.use(express.json());

const corsOptions = {
    origin: '*',
    // origin: '*',
    credentials: true,
};
app.use(cors(corsOptions));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('hello world');
});

app.listen(process.env.PORT, () => {
    console.log(`server listening on port ${process.env.PORT} `);
});
