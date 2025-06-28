import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import appConst from '../config/app.const';
import i18n from '../config/i18n.config';

declare module 'express' {
    interface Request {
        loggedUserId?: number | string;
    }
}

class Authentication {

    public protected(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    public logApiCall(req: Request, res: Response, next: NextFunction): void {
        console.info('API Call:', {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            user_agent: req.headers['user-agent'],
            params: req.method === 'GET' ? req.query : req.body,
            authorization_token: req.headers['authorization'],
            headers: req.headers,
        });

        next();
    }

    public SetLocale = (req: Request, res: Response, next: NextFunction): void => {
        const lang = (req.headers['lang'] as string) || 'ar';
        i18n.setLocale(req, lang);
        return next();
    };

    public verifyToken(req: Request, res: Response, next: NextFunction): void {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Unauthorized: No token provided' });
            return;
        }

        if (token !== 'your-valid-token') {
            res.status(403).json({ message: 'Forbidden: Invalid token' });
            return;
        }

        next();
    }

    public UserAuthentication(req: Request, res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthenticated.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, appConst.jwt.jwt_secret) as JwtPayload;
            req.loggedUserId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
            next();
        } catch (err: any) {
            console.error('JWT verification failed:', err.message);
            res.status(401).json({ message: 'Unauthenticated.' });
        }
    }

    public GuestAuthentication(req: Request, res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthenticated.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, appConst.jwt.jwt_secret) as JwtPayload;
            req.loggedUserId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
            next();
        } catch (err: any) {
            console.error('JWT verification failed:', err.message);
            res.status(401).json({ message: 'Unauthenticated.' });
        }
    }

    public AuthenticationByToken(token: string): number | string | null {
        try {
            const decoded = jwt.verify(token, appConst.jwt.jwt_secret) as JwtPayload;
            return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
        } catch {
            return null;
        }
    }
}

export default new Authentication();