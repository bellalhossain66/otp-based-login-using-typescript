import { Request, Response } from "express";

export const HealthCheck = async (req: Request, res: Response) => {
    res.send('Okay')
};