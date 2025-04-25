const Announcement = require("../models/announcementModel");
const { validationResult } = require('express-validator');

// 获取公告列表（分页+筛选）
exports.getAnnouncements = async (req, res, next) => {
    try {
        const {
            skip = 0,    // 默认从第0条开始
            limit = 10,  // 默认每页10条
            status,
            is_urgent,
            is_top,
            keyword,
            date_from,
            date_to,
            only_valid,  // 移除默认值
            school_id    // 从查询参数获取学校ID
        } = req.query;

        // 构建筛选条件（所有条件都是可选的）
        const filter = {
            school_id,  // 不再强制要求school_id
            status,
            is_urgent: is_urgent !== undefined ? Boolean(is_urgent) : undefined,
            is_top: is_top !== undefined ? Boolean(is_top) : undefined,
            keyword,
            date_from,
            date_to,
            only_valid: only_valid === 'true' // 只有明确传true时才筛选有效公告
        };

        // 获取公告数据
        const { announcements, total } = await Announcement.getAllWithPagination(
            Number(skip),
            Number(limit),
            filter
        );

        res.status(200).json({
            code: 200,
            data: {
                announcements,
                total,
                pagination: {
                    skip: Number(skip),
                    limit: Number(limit),
                    hasMore: (Number(skip) + Number(limit)) < total
                },
                filter
            }
        });
    } catch (err) {
        next(err);
    }
};

// 获取公告详情
exports.getAnnouncementById = async (req, res, next) => {
    try {
        const announcement = await Announcement.getByIdWithDetails(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        res.status(200).json({
            code: 200,
            data: announcement
        });
    } catch (err) {
        next(err);
    }
};

// 创建新公告
exports.createAnnouncement = async (req, res, next) => {
    try {
        // 验证输入
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            content,
            is_top = false,
            is_urgent = false,
            start_time,
            end_time,
            status = 'draft'
        } = req.body;

        // 创建公告数据
        const announcementData = {
            school_id: req.user.school_id,
            admin_id: req.user.id, // 从认证用户信息中获取管理员ID
            title,
            content,
            is_top,
            is_urgent,
            start_time,
            end_time,
            status
        };

        // 创建公告
        const announcementId = await Announcement.create(announcementData);

        res.status(201).json({
            announcement_id: announcementId,
            message: "Announcement created successfully"
        });
    } catch (err) {
        next(err);
    }
};

// 更新公告
exports.updateAnnouncement = async (req, res, next) => {
    try {
        // 验证输入
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const {
            title,
            content,
            is_top,
            is_urgent,
            start_time,
            end_time,
            status
        } = req.body;

        // 检查公告是否存在
        const announcement = await Announcement.getByIdWithDetails(id);
        if (!announcement) {
            return res.status(404).json({
                code: 404,
                message: "Announcement not found"
            });
        }

        // 更新数据
        const updateData = {
            title,
            content,
            is_top,
            is_urgent,
            start_time,
            end_time,
            status
        };

        // 移除未定义的字段
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        // 更新公告
        await Announcement.update(id, updateData);

        res.status(200).json({
            code: 200,
            message: "Announcement updated successfully",
            data: {
                id,
                ...updateData
            }
        });
    } catch (err) {
        next(err);
    }
};

// 更新公告状态
exports.updateAnnouncementStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 验证状态值
        const validStatuses = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value"
            });
        }

        // 检查公告是否存在
        const announcement = await Announcement.getByIdWithDetails(id);
        if (!announcement) {
            return res.status(404).json({
                message: "Announcement not found"
            });
        }

        // 检查权限
        if (announcement.school_id !== req.user.school_id) {
            return res.status(403).json({
                message: "No permission to update this announcement"
            });
        }

        // 更新状态
        await Announcement.updateStatus(id, status);

        res.status(200).json({
            message: "Announcement status updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

// 删除公告
exports.deleteAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 检查公告是否存在
        const announcement = await Announcement.getByIdWithDetails(id);
        if (!announcement) {
            return res.status(404).json({
                code: 404,
                message: "Announcement not found"
            });
        }

        // 删除公告
        await Announcement.delete(id);

        res.status(200).json({
            code: 200,
            message: "Announcement deleted successfully",
            data: {
                id
            }
        });
    } catch (err) {
        next(err);
    }
};

// 获取置顶公告（公开接口，无需认证）
exports.getTopAnnouncements = async (req, res, next) => {
    try {
        const { school_id } = req.params;
        const { limit = 5 } = req.query;

        // 获取置顶公告
        const announcements = await Announcement.getTopAnnouncements(school_id, limit);

        res.status(200).json(announcements);
    } catch (err) {
        next(err);
    }
};

// 获取最新公告（公开接口，无需认证）
exports.getLatestAnnouncements = async (req, res, next) => {
    try {
        const { school_id } = req.params;
        const { limit = 10 } = req.query;

        // 获取最新公告
        const announcements = await Announcement.getLatestAnnouncements(school_id, limit);

        res.status(200).json(announcements);
    } catch (err) {
        next(err);
    }
};