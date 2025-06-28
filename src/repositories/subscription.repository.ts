import SubscriptionModel from '../models/subscription.model';

class Subscription {
    public async FindSubscription(userId: number): Promise<any | null> {
        return await SubscriptionModel.findOne({
            where: {
                client_id: userId,
                active: 1,
            },
        });
    }
}

export default new Subscription();