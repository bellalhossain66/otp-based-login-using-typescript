import { Request, Response } from "express";

export const UpdateGuestUserOrder = async (req: Request, res: Response) => {
    try {
        const orderData = req.body;
        const result = await clientOrderService.updateGuestUserOrder(orderData);
        res.json(result);
    } catch (error: any) {
        console.error('Error in UpdateGuestUserOrder:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
}