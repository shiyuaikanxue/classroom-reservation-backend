const AdminModel = require('../models/adminModel');
const db = require('../config/db');
class AdminController {
    // 获取某学校的所有管理员账号
    static async getAdminsBySchool(req, res) {
        try {
            const { schoolId } = req.params;
            const { pageNum = 1, pageSize = 10, name } = req.query;

            // 确保 pageNum 和 pageSize 为整数
            const offset = (parseInt(pageNum) - 1) * parseInt(pageSize);

            // 获取分页数据
            const { admins, total } = await AdminModel.getAdminsBySchool(schoolId, offset, pageSize, name);
            const totalPages = Math.ceil(total / parseInt(pageSize));

            // 规范化返回数据
            res.status(200).json({
                code: 200,
                success: true,
                message: '管理员数据获取成功',
                data: {
                    admins,
                    total,
                    totalPages,
                    currentPage: parseInt(pageNum),
                    pageSize: parseInt(pageSize)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '服务器错误',
                error: error.message
            });
        }
    }

    // 新增管理员账号
    static async createAdmin(req, res) {
        try {
            const { school_id, username, password, phoneNumber, avatar, role } = req.body;

            console.log(school_id, Number(school_id), username, password, phoneNumber, avatar, role);
            // 调用模型方法插入数据
            const adminId = await AdminModel.createAdmin(Number(school_id), username, password, phoneNumber, avatar, role);

            // 返回成功响应
            res.status(201).json({
                success: true,
                message: '管理员账号创建成功',
                data: {
                    adminId
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: '服务器错误',
                error: error.message
            });
        }
    }

    // 更新管理员信息
    // 更新管理员信息
    static async updateAdmin(req, res) {
        try {
            const { adminId } = req.params;
            const data = req.body;

            // 验证必要字段
            if (!data.username || !data.role) {
                return res.status(400).json({
                    success: false,
                    message: '用户名和角色为必填字段'
                });
            }

            // 确保所有参数都是基本类型
            const params = {
                username: String(data.username),
                avatar: data.avatar ? String(data.avatar) : null,
                phone_number: data.phone_number ? String(data.phone_number) : null,
                role: String(data.role),
                responsibility: data.responsibility ? String(data.responsibility) : null,
                office_location: data.office_location ? String(data.office_location) : null
            };

            // 调用模型方法更新数据
            const isUpdated = await AdminModel.updateAdmin(adminId, params);

            if (isUpdated) {
                res.status(200).json({
                    success: true,
                    message: '管理员信息更新成功',
                    data: {
                        adminId
                    }
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: '管理员未找到'
                });
            }
        } catch (error) {
            console.error('更新管理员错误:', error);
            res.status(500).json({
                success: false,
                message: '服务器错误',
                error: error.message
            });
        }
    }
    // 删除管理员账号
    static async deleteAdmin(req, res) {
        try {
            const { adminId } = req.params;
            const isDeleted = await AdminModel.deleteAdmin(adminId);
            if (isDeleted) {
                res.status(200).json({ message: '管理员删除成功' });
            } else {
                res.status(404).json({ message: '管理员未找到' });
            }
        } catch (error) {
            res.status(500).json({ message: '服务器错误', error: error.message });
        }
    }
}

module.exports = AdminController;