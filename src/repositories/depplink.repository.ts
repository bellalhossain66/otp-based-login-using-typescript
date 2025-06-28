import { Transaction, QueryTypes } from 'sequelize';
import sequelizeDB from '../config/db.config';
import AppConst from '../config/app.const';

class DeepLink {
    public async GetGenerateDeepLink(referral_id: string): Promise<any | undefined> {
        const [deepLink] = await sequelizeDB.query(
            `SELECT * FROM ${AppConst.table.generate_deep_links} WHERE deep_link_code = ? AND status = 1 LIMIT 1`,
            {
                replacements: [referral_id],
                type: QueryTypes.SELECT,
            }
        );
        return deepLink;
    }

    public async GetGenerateCampaign(deepLink: any): Promise<any | undefined> {
        const [campaign] = await sequelizeDB.query(
            `SELECT * FROM ${AppConst.table.generate_campaigns} WHERE status = 1 AND owner_id = ? ORDER BY id DESC LIMIT 1`,
            {
                replacements: [deepLink.owner_id],
                type: QueryTypes.SELECT,
            }
        );
        return campaign;
    }

    public async CreateDeepLinkActivity(
        user_id: number | null,
        campaign: any,
        deepLink: any,
        referral_id: string,
        action_type: string,
        device_id: string | null,
        ip: string | null,
        platform: string,
        isExpired: boolean
    ): Promise<void> {
        await sequelizeDB.query(
            `INSERT INTO ${AppConst.table.deep_link_activities} 
      (user_id, campaign_id, generate_deep_link_id, deep_link_code, action_type, count, device_id, ip, platform, is_expired)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    user_id,
                    campaign.id,
                    deepLink.id,
                    referral_id,
                    action_type,
                    1,
                    device_id,
                    ip,
                    platform,
                    isExpired,
                ],
                type: QueryTypes.INSERT,
            }
        );
    }

    public async ExistDeepLinkActivity(device_id: string | null): Promise<any | undefined> {
        const [exists] = await sequelizeDB.query(
            `SELECT id FROM ${AppConst.table.deep_link_activities} WHERE action_type = 'DOWNLOAD' AND device_id = ? LIMIT 1`,
            {
                replacements: [device_id],
                type: QueryTypes.SELECT,
            }
        );
        return exists;
    }

    public async CreateDeepLinkActivityForActions(
        user_id: number | null,
        campaign: any,
        deepLink: any,
        referral_id: string,
        action: string,
        device_id: string | null,
        ip: string | null,
        platform: string,
        isExpired: boolean
    ): Promise<void> {
        await sequelizeDB.query(
            `INSERT INTO ${AppConst.table.deep_link_activities} 
      (user_id, campaign_id, generate_deep_link_id, deep_link_code, action_type, count, device_id, ip, platform, is_expired)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    user_id,
                    campaign.id,
                    deepLink.id,
                    referral_id,
                    action,
                    1,
                    device_id,
                    ip,
                    platform,
                    isExpired,
                ],
                type: QueryTypes.INSERT,
            }
        );
    }

    public async FindRecentClickByIP(ip: string): Promise<any | undefined> {
        const [activity] = await sequelizeDB.query(
            `SELECT * FROM ${AppConst.table.deep_link_activities}
      WHERE ip = ? AND action_type = 'CLICK' AND user_id IS NULL
      ORDER BY created_at DESC LIMIT 1`,
            {
                replacements: [ip],
                type: QueryTypes.SELECT,
            }
        );
        return activity;
    }

    public async FindDownloadByIP(ip: string): Promise<any | undefined> {
        const [activity] = await sequelizeDB.query(
            `SELECT * FROM ${AppConst.table.deep_link_activities} 
      WHERE ip = ? AND action_type = 'DOWNLOAD' LIMIT 1`,
            {
                replacements: [ip],
                type: QueryTypes.SELECT,
            }
        );
        return activity;
    }

    public async InsertActivities(
        types: string[],
        user_id: number,
        source: any,
        device_id: string | null,
        ip: string | null,
        platform: string,
        transaction: Transaction
    ): Promise<void> {
        const now = new Date();
        const rows = types.map(type => ([
            user_id,
            source.campaign_id,
            source.generate_deep_link_id,
            source.deep_link_code,
            type,
            1,
            device_id,
            ip,
            platform,
            source.is_expired,
            now,
            now
        ]));

        const valuePlaceholders = rows.map(() => '(?)').join(', ');

        await sequelizeDB.query(
            `INSERT INTO ${AppConst.table.deep_link_activities}
      (user_id, campaign_id, generate_deep_link_id, deep_link_code, action_type, count, device_id, ip, platform, is_expired, created_at, updated_at)
      VALUES ${valuePlaceholders}`,
            {
                replacements: rows,
                transaction,
                type: QueryTypes.INSERT,
            }
        );
    }

    public async DeleteAnonymousClicks(ip: string, transaction: Transaction): Promise<void> {
        await sequelizeDB.query(
            `DELETE FROM ${AppConst.table.deep_link_activities}
      WHERE ip = ? AND action_type = 'CLICK' AND user_id IS NULL`,
            {
                replacements: [ip],
                transaction,
                type: QueryTypes.DELETE,
            }
        );
    }

    public async WithTransaction(callback: (t: Transaction) => Promise<void>): Promise<void> {
        const t = await sequelizeDB.transaction();
        try {
            await callback(t);
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
}

export default new DeepLink();