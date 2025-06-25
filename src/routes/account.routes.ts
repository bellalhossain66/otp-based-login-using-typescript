import express from "express";
import { LogInUser, SendWhatsAppOtp } from "../controllers/account.controller";

const router = express.Router();

router.post('/Accounts/SendWhatsAppOtp', SendWhatsAppOtp);
router.post('/Accounts/login', LogInUser);

export default router;