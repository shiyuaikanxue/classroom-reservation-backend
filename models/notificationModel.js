const db = require("../config/db");

module.exports = {
  // 获取所有通知（带分页和筛选）
  async getAllWithPagination(page, limit, filter) {
    const offset = (page - 1) * limit;
    
    // 构建WHERE条件
    const whereConditions = [];
    const params = [];
    
    if (filter.recipient_id) {
      whereConditions.push('n.recipient_id = ?');
      params.push(filter.recipient_id);
    }
    
    if (filter.sender_id) {
      whereConditions.push('n.sender_id = ?');
      params.push(filter.sender_id);
    }
    
    if (filter.type) {
      whereConditions.push('n.type = ?');
      params.push(filter.type);
    }
    
    if (filter.is_read !== undefined) {
      whereConditions.push('n.is_read = ?');
      params.push(filter.is_read);
    }
    
    if (filter.date_from) {
      whereConditions.push('n.created_at >= ?');
      params.push(filter.date_from);
    }
    
    if (filter.date_to) {
      whereConditions.push('n.created_at <= ?');
      params.push(filter.date_to);
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
        n.*,
        r.name as recipient_name,
        s.name as sender_name
       FROM notifications n
       LEFT JOIN users r ON n.recipient_id = r.user_id
       LEFT JOIN users s ON n.sender_id = s.user_id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    return { notifications, total };
  },

  // 根据ID获取通知详情（带关联信息）
  async getByIdWithDetails(id) {
    const [notifications] = await db.query(
      `SELECT 
        n.*,
        r.name as recipient_name,
        s.name as sender_name
       FROM notifications n
       LEFT JOIN users r ON n.recipient_id = r.user_id
       LEFT JOIN users s ON n.sender_id = s.user_id
       WHERE n.notification_id = ?`,
      [id]
    );
    return notifications[0];
  },

  // 标记为已读
  async markAsRead(id) {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE notification_id = ?',
      [id]
    );
  },

  // 基础CRUD方法
  async getById(id) {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE notification_id = ?', 
      [id]
    );
    return notifications[0];
  },

  async create(notificationData) {
    const [result] = await db.query(
      'INSERT INTO notifications SET ?', 
      [notificationData]
    );
    return result.insertId;
  },

  async update(id, updateData) {
    await db.query(
      'UPDATE notifications SET ? WHERE notification_id = ?', 
      [updateData, id]
    );
  },

  async delete(id) {
    await db.query(
      'DELETE FROM notifications WHERE notification_id = ?', 
      [id]
    );
  }
};