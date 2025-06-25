import express from 'express';
import dotenv from 'dotenv';
import sequelizeDB from './config/db.config';
import i18n from './config/i18n.config';
import healthCheckRoutes from './routes/healthcheck.routes';
import accountRoutes from './routes/account.routes';

dotenv.config();
const app = express();

app.use(express.json());
app.use(i18n.init);

app.use('/', healthCheckRoutes);
app.use('/api/v2', accountRoutes);

if (process.env.SERVER_TYPE !== 'lambda') {
    sequelizeDB.sync().then(() => {
        const port = Number(process.env.PORT) || 3333;
        app.listen(port, () => {
            console.log(`App running on port %s. Visit http://localhost:${port}/ in your browser.`);
        });
    });
}

export default app;
