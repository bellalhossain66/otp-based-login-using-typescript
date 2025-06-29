import ClientOrder, { ClientOrderType } from "../models/clientorder.model";

class ClientOrderRepository {
    public GetClientOrderByClientId = async (guestUserId: number, orderIds: any): Promise<ClientOrderType[]> => {
        return await ClientOrder.findAll({
            where: {
                client_id: guestUserId,
                id: orderIds,
            },
        });
    }

    public UpdateClientOrderByUserId = async (loggedUserId: any, guestUserId: number, orderIds: any): Promise<void> => {
        await ClientOrder.update(
            { client_id: loggedUserId },
            {
                where: {
                    client_id: guestUserId,
                    id: orderIds,
                },
            }
        );
    }
}

export default new ClientOrderRepository();