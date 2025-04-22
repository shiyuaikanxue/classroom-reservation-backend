const db = require("../config/db");

module.exports = {
  // 获取所有通知（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;

    // 构建WHERE条件
    const whereConditions = ['1=1'];
    const params = [];

    // 管理员筛选
    if (filter.admin_id) {
      whereConditions.push('n.admin_id = ?');
      params.push(filter.admin_id);
    }

    // 紧急状态筛选
    if (filter.is_urgent !== undefined) {
      whereConditions.push('n.is_urgent = ?');
      params.push(filter.is_urgent);
    }

    // 发布类型筛选
    if (filter.publish_type) {
      whereConditions.push('n.publish_type = ?');
      params.push(filter.publish_type);
    }

    // 时间范围筛选
    if (filter.date_from) {
      whereConditions.push('n.created_at >= ?');
      params.push(filter.date_from);
    }

    if (filter.date_to) {
      whereConditions.push('n.created_at <= ?');
      params.push(filter.date_to);
    }

    // 标题关键词搜索
    if (filter.keyword) {
      whereConditions.push('n.title LIKE ?');
      params.push(`%${filter.keyword}%`);
    }

    // 学生接收通知的特殊处理
    if (filter.student_id) {
      whereConditions.push(`
        (n.publish_type = 'all' OR 
        EXISTS (
          SELECT 1 FROM notification_targets nt
          JOIN student s ON (
            (nt.target_type = 'school') OR
            (nt.target_type = 'college' AND s.college_id = nt.target_id) OR
            (nt.target_type = 'class' AND s.class_id = nt.target_id)
          )
          WHERE nt.notification_id = n.id AND s.student_id = ?
        ))
      `);
      params.push(filter.student_id);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // 查询总数
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM notifications n ${whereClause}`,
      params
    );
    const total = totalResult[0].total;

    // 查询分页数据
    const [notifications] = await db.query(
      `SELECT 
        n.id,
        n.title,
        n.message,
        n.is_urgent,
        n.publish_type,
        n.start_time,
        n.end_time,
        n.created_at,
        a.username as admin_name,
        a.avatar as admin_avatar,
        (
          SELECT GROUP_CONCAT(
            CONCAT(
              CASE nt.target_type
                WHEN 'school' THEN '全校'
                WHEN 'college' THEN CONCAT('学院:', c.name)
                WHEN 'class' THEN CONCAT('班级:', cl.name)
              END
            ) SEPARATOR ', '
          )
          FROM notification_targets nt
          LEFT JOIN college c ON nt.target_type = 'college' AND c.college_id = nt.target_id
          LEFT JOIN class cl ON nt.target_type = 'class' AND cl.class_id = nt.target_id
          WHERE nt.notification_id = n.id
        ) as target_names
       FROM notifications n
       LEFT JOIN admin a ON n.admin_id = a.admin_id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { notifications, total };
  },
  // 获取通知的目标
  async getNotificationTargets(notificationId) {
    const [targets] = await db.query(
      `SELECT target_type, target_id 
       FROM notification_targets 
       WHERE notification_id = ?`,
      [notificationId]
    );

    // 返回简化后的目标信息
    return targets.map(target => ({
      type: target.target_type,
      id: target.target_id
    }));
  },
  // 根据ID获取通知详情（带关联信息）
  async getByIdWithDetails(id) {
    // 获取通知基本信息
    const [notifications] = await db.query(
      `SELECT 
        n.*,
        a.username as admin_name,
        a.avatar as admin_avatar
       FROM notifications n
       LEFT JOIN admin a ON n.admin_id = a.admin_id
       WHERE n.id = ?`,
      [id]
    );

    if (!notifications[0]) return null;

    // 获取通知目标详情
    const [targets] = await db.query(
      `SELECT 
        nt.target_type,
        nt.target_id,
        CASE nt.target_type
          WHEN 'school' THEN '全校'
          WHEN 'college' THEN c.name
          WHEN 'class' THEN cl.name
        END as target_name
       FROM notification_targets nt
       LEFT JOIN college c ON nt.target_type = 'college' AND c.college_id = nt.target_id
       LEFT JOIN class cl ON nt.target_type = 'class' AND cl.class_id = nt.target_id
       WHERE nt.notification_id = ?`,
      [id]
    );

    // 组合结果
    const notification = notifications[0];
    notification.targets = targets;

    return notification;
  },

  // 创建通知（包含目标）
  // 创建通知并添加目标
  async createWithTargets(notificationData, targets) {
    // 转换日期格式
    if (notificationData.start_time) {
      notificationData.start_time = new Date(notificationData.start_time)
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '')
        .split('.')[0];
    }

    if (notificationData.end_time) {
      notificationData.end_time = new Date(notificationData.end_time)
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '')
        .split('.')[0];
    }

    // 插入通知
    const [result] = await db.query(
      'INSERT INTO notifications SET ?',
      [notificationData]
    );

    // 插入通知目标
    if (targets && targets.length > 0) {
      await this.addNotificationTargets(notificationData.id, targets);
    }

    return notificationData.id;
  },

  // 添加通知目标
  async addNotificationTargets(notificationId, targets) {
    // 假设targets是学院ID数组，target_type为'college'
    const values = targets.map(targetId => [
      notificationId,
      'college', // 根据实际情况调整target_type
      targetId
    ]);

    await db.query(
      'INSERT INTO notification_targets (notification_id, target_type, target_id) VALUES ?',
      [values]
    );
  },

  // 更新通知（包含目标）
  async updateWithTargets(id, updateData, targets = []) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 更新主通知
      await connection.query(
        'UPDATE notifications SET ? WHERE id = ?',
        [updateData, id]
      );

      // 先删除旧目标
      await connection.query(
        'DELETE FROM notification_targets WHERE notification_id = ?',
        [id]
      );

      // 插入新目标
      if (targets.length > 0 && updateData.publish_type === 'selected') {
        await connection.query(
          'INSERT INTO notification_targets (notification_id, target_type, target_id) VALUES ?',
          [targets.map(t => [id, t.type, t.id])]
        );
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // 基础CRUD方法
  async getById(id) {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    return notifications[0];
  },

  async delete(id) {
    // 由于有外键约束，删除主通知会自动删除关联目标
    await db.query(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );
  },

  // 获取学生未读通知数量
  async getUnreadCount(studentId) {
    const [result] = await db.query(
      `SELECT COUNT(*) as count
       FROM notifications n
       WHERE n.publish_type = 'all' OR 
       EXISTS (
         SELECT 1 FROM notification_targets nt
         JOIN student s ON (
           (nt.target_type = 'school') OR
           (nt.target_type = 'college' AND s.college_id = nt.target_id) OR
           (nt.target_type = 'class' AND s.class_id = nt.target_id)
         )
         WHERE nt.notification_id = n.id AND s.student_id = ?
       )`,
      [studentId]
    );
    return result[0].count;
  }
};