const db = require("../config/db");

module.exports = {
    // 获取所有公告（带分页和筛选）
    // 修改后的模型方法
    async getAllWithPagination(skip, limit, filter) {
        const whereConditions = [];
        const params = [];

        // 动态构建WHERE条件
        if (filter.school_id) {
            whereConditions.push('a.school_id = ?');
            params.push(filter.school_id);
        }

        if (filter.status) {
            whereConditions.push('a.status = ?');
            params.push(filter.status);
        }

        if (filter.is_urgent !== undefined) {
            whereConditions.push('a.is_urgent = ?');
            params.push(filter.is_urgent);
        }

        if (filter.is_top !== undefined) {
            whereConditions.push('a.is_top = ?');
            params.push(filter.is_top);
        }

        if (filter.keyword) {
            whereConditions.push('a.title LIKE ?');
            params.push(`%${filter.keyword}%`);
        }

        if (filter.date_from) {
            whereConditions.push('a.created_at >= ?');
            params.push(filter.date_from);
        }

        if (filter.date_to) {
            whereConditions.push('a.created_at <= ?');
            params.push(filter.date_to);
        }

        // 只有明确要求时才筛选有效公告
        if (filter.only_valid) {
            whereConditions.push('(a.start_time IS NULL OR a.start_time <= NOW())');
            whereConditions.push('(a.end_time IS NULL OR a.end_time >= NOW())');
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // 查询总数
        const [totalResult] = await db.query(
            `SELECT COUNT(*) as total FROM announcements a ${whereClause}`,
            params
        );
        const total = totalResult[0].total;

        // 查询分页数据
        const [announcements] = await db.query(
            `SELECT 
            a.*,
            ad.username as admin_name,
            ad.avatar as admin_avatar
         FROM announcements a
         LEFT JOIN admin ad ON a.admin_id = ad.admin_id
         ${whereClause}
         ORDER BY a.is_top DESC, a.is_urgent DESC, a.created_at DESC
         LIMIT ? OFFSET ?`,
            [...params, limit, skip]
        );

        return { announcements, total };
    },
    // 添加获取公告详情的方法
    async getByIdWithDetails(id) {
        const [announcements] = await db.query(
            `SELECT 
            a.*,
            ad.username as admin_name,
            ad.avatar as admin_avatar,
            s.name as school_name
         FROM announcements a
         LEFT JOIN admin ad ON a.admin_id = ad.admin_id
         LEFT JOIN school s ON a.school_id = s.school_id
         WHERE a.id = ?`,
            [id]
        );

        return announcements[0]; // 返回第一条记录或undefined
    },
    // 更新公告
    async update(id, updateData) {
        // 转换日期时间格式
        if (updateData.start_time) {
            updateData.start_time = new Date(updateData.start_time)
                .toISOString()
                .replace('T', ' ')
                .replace('Z', '')
                .split('.')[0];
        }

        if (updateData.end_time) {
            updateData.end_time = new Date(updateData.end_time)
                .toISOString()
                .replace('T', ' ')
                .replace('Z', '')
                .split('.')[0];
        }

        await db.query(
            'UPDATE announcements SET ? WHERE id = ?',
            [updateData, id]
        );
    },

    // 更新公告状态
    async updateStatus(id, status) {
        await db.query(
            'UPDATE announcements SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, id]
        );
    },

    // 删除公告
    async delete(id) {
        await db.query(
            'DELETE FROM announcements WHERE id = ?',
            [id]
        );
    },

    // 获取置顶公告
    async getTopAnnouncements(schoolId, limit = 5) {
        const [announcements] = await db.query(
            `SELECT 
        a.id,
        a.title,
        a.is_urgent,
        a.created_at
       FROM announcements a
       WHERE a.school_id = ?
       AND a.status = 'published'
       AND a.is_top = 1
       AND (a.start_time IS NULL OR a.start_time <= NOW())
       AND (a.end_time IS NULL OR a.end_time >= NOW())
       ORDER BY a.created_at DESC
       LIMIT ?`,
            [schoolId, limit]
        );

        return announcements;
    },

    // 获取最新公告
    async getLatestAnnouncements(schoolId, limit = 10) {
        const [announcements] = await db.query(
            `SELECT 
        a.id,
        a.title,
        a.is_urgent,
        a.is_top,
        a.created_at
       FROM announcements a
       WHERE a.school_id = ?
       AND a.status = 'published'
       AND (a.start_time IS NULL OR a.start_time <= NOW())
       AND (a.end_time IS NULL OR a.end_time >= NOW())
       ORDER BY a.created_at DESC
       LIMIT ?`,
            [schoolId, limit]
        );

        return announcements;
    }
};