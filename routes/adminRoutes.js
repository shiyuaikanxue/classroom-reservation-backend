const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// 获取某学校的所有管理员账号
router.get('/school/:schoolId/admins', AdminController.getAdminsBySchool);

// 新增管理员账号
router.post('/addAdmin', AdminController.createAdmin);

// 更新管理员信息
router.put('/updateAdmin/:adminId', AdminController.updateAdmin);

// 删除管理员账号
router.delete('/delAdmin/:adminId', AdminController.deleteAdmin);

module.exports = router;