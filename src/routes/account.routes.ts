import express from "express";
import {
    Access,
    AccessGuestUser,
    AddUserDeviceToken,
    GetMobileCountriesInfo,
    LogInUser,
    SendWhatsAppOtp
} from "../controllers/account.controller";
import Auth from '../middleware/Authentication';
import multer from 'multer';

const upload = multer();
const router = express.Router();

router.post('/Accounts/SendWhatsAppOtp', SendWhatsAppOtp);
router.post('/Accounts/login', LogInUser);
router.post('/Accounts/Access', Access);
router.get('/Countries/GetMobileCountriesInfo', GetMobileCountriesInfo);
// router.post('/ClientOrders/UpdateGuestUserOrder')
router.post('/Accounts/AccessGuestUser', upload.none(), AccessGuestUser);
router.post('/UserDeviceTokens/AddUserDeviceToken', Auth.UserAuthentication, upload.none(), AddUserDeviceToken);

export default router;