import axios from 'axios';
import { Normalizephone } from '../utils/common';
import AppConst from '../config/app.const';
import ClientOrder, { ClientOrderType } from "../models/clientorder.model";

export const SendPaymentCompleteNotify = async (clientOrder: ClientOrder): Promise<void> => {
    try {
        const url = AppConst.whatsApp.whatsapp_template_url;
        const bearerToken = AppConst.whatsApp.whatsapp_token;

        const client = clientOrder.client;
        if (client) {
            const phone = Normalizephone(client.phone_number);
            const userRole = client.roles?.[0]?.name || '';

            if (userRole !== 'guest') {
                await axios.post(url, {
                    token: bearerToken,
                    phone: phone,
                    template_name: 'payment_done',
                    template_language: 'ar',
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: `${clientOrder.number}`,
                                },
                            ],
                        },
                    ],
                });
            }
        }
    } catch (err: any) {
        console.error('Payment notify error:', err);
        throw new Error(err.message || 'Failed to notify payment.');
    }
};