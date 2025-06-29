import express from "express";
import {
    Access,
    AccessGuestUser,
    AddUserDeviceToken,
    GetAllCountriesInfo,
    GetMobileCountriesInfo,
    GetRefreshToken,
    LogInUser,
    SendWhatsAppOtp
} from "../controllers/account.controller";
import Auth from '../middleware/Authentication';
import multer from 'multer';
import { UpdateGuestUserOrder } from "../controllers/clientorder.controller";

const upload = multer();
const router = express.Router();

router.post('/Accounts/SendWhatsAppOtp', SendWhatsAppOtp);
router.post('/Accounts/login', LogInUser);
router.post('/Accounts/Access', Access);
router.get('/Countries/GetMobileCountriesInfo', GetMobileCountriesInfo);
router.get('/Countries/GetAllCountriesInfo', GetAllCountriesInfo);
router.post('/ClientOrders/UpdateGuestUserOrder', Auth.UserAuthentication, UpdateGuestUserOrder);
router.post('/Accounts/AccessGuestUser', upload.none(), AccessGuestUser);
router.post('/UserDeviceTokens/AddUserDeviceToken', Auth.UserAuthentication, upload.none(), AddUserDeviceToken);
router.post('/Accounts/RefreshToken', Auth.UserAuthentication, GetRefreshToken);

export default router;