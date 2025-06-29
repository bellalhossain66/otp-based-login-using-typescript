import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import AppConst from '../config/app.const';
import ClientOrderRepo from '../repositories/clientorder.repository';

export const UpdateGuestUserOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderIds, shouldTransferOrders, guestToken } = req.body;

        if (!Array.isArray(orderIds) || orderIds.length === 0 || !guestToken) {
            res.status(400).json({ message: 'Invalid input', success: false });
            return;
        }

        let guestUserId: number;
        try {
            const decoded: any = jwt.verify(guestToken, AppConst.jwt.jwt_secret);
            guestUserId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"];
        } catch (err) {
            res.status(401).json({ message: 'Unauthorized', success: false });
            return;
        }

        // Load guest orders
        const guestOrders = await ClientOrderRepo.GetClientOrderByClientId(guestUserId, orderIds);

        const transfer = shouldTransferOrders === true || shouldTransferOrders === 'true';

        if (guestOrders.length > 0 && transfer) {
            await ClientOrderRepo.UpdateClientOrderByUserId(req.loggedUserId, guestUserId, orderIds);

            res.status(200).json({
                message: 'Order updated',
                success: true,
            });
            return;
        }

        res.status(404).json({
            message: 'No orders found to update',
            success: false,
        });
        return;
    } catch (error: any) {
        console.error('Error in UpdateGuestUserOrder:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
        return;
    }
}