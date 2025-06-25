import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import JWTService from '../services/jwt.service';
import appConst from '../config/app.const';

interface TokenPayload extends JwtPayload {
    iss: string;
    iat: number;
    exp: number;
    nbf: number;
    jti: string;
    sub: string;
    prv: string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid': number;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
    FirstLogin: boolean;
}

interface RefreshTokenResponse {
    new_access_token: string;
    is_new_token: boolean;
}

export const GenerateAccessToken = (
    userId: number,
    name: string,
    phone: string,
    role: string
): string => {
    const now = Math.floor(Date.now() / 1000);
    const ttl = 60 * 60 * 30 * 100;

    const payload: TokenPayload = {
        iss: 'https://qatarat.sa',
        iat: now,
        exp: now + ttl,
        nbf: now,
        jti: crypto.randomBytes(8).toString('hex'),
        sub: userId.toString(),
        prv: '23bd5c8949f600adb39e701c400872db7a5976f7',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': phone.toString(),
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': role,
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid': userId,
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': name || '',
        FirstLogin: false
    };

    return jwt.sign(payload, appConst.jwt.jwt_secret, {
        algorithm: 'HS256',
        // header: {
        //     typ: 'JWT'
        // }
    });
};

export const GenerateRefreshToken = (
    userId: number,
    name: string,
    phone: string,
    role: string
): string => {
    return GenerateAccessToken(userId, name, phone, role);
};

export const CheckToken = (token: string): void => {
    try {
        const decoded = jwt.verify(token, appConst.jwt.jwt_secret);
        console.log('Token is valid. Payload:', decoded);
    } catch (err: any) {
        console.error('Token verification failed:', err.message);
    }
};

export const DecodeToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, appConst.jwt.jwt_secret) as TokenPayload;
    } catch {
        const [, payload] = token.split('.');
        if (payload) {
            try {
                return JSON.parse(Buffer.from(payload, 'base64').toString());
            } catch {
                return null;
            }
        }
        return null;
    }
};

export const RefreshTokenIfNeeded = async (token: string, appSecretKey: string): Promise<RefreshTokenResponse> => {
    let newTokenData: RefreshTokenResponse = {
        new_access_token: '',
        is_new_token: false
    };

    try {
        jwt.verify(token, appConst.jwt.jwt_secret);
    } catch {
        if (appSecretKey === appConst.jwt.app_secret_key) {
            const decoded = DecodeToken(token);
            const sid = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'];

            if (sid) {
                const user = await JWTService.GetUserFindById(sid);
                if (user) {
                    const newToken = jwt.sign({ id: user.id }, appConst.jwt.jwt_secret);
                    newTokenData = {
                        new_access_token: newToken,
                        is_new_token: true
                    };
                    console.log('user_token_generations', {
                        old_token: token,
                        app_secret_key: appSecretKey,
                        ...newTokenData
                    });
                }
            }
        }
    }

    return newTokenData;
};