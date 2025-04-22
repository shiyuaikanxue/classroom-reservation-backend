const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { check } = require('express-validator');

const createAnnouncementRules = [
    check('title').notEmpty().withMessage('Title is required'),
    check('content').notEmpty().withMessage('Content is required'),
    check('is_top').optional().isBoolean(),
    check('is_urgent').optional().isBoolean(),
    check('status').optional().isIn(['draft', 'published', 'archived']),
    check('start_time').optional().isISO8601(),
    check('end_time').optional().isISO8601()
];

router.get("/public/top/:school_id", announcementController.getTopAnnouncements);

router.get("/public/latest/:school_id", announcementController.getLatestAnnouncements);

router.get("/", announcementController.getAnnouncements);

router.get("/:id", announcementController.getAnnouncementById);

router.post("/", createAnnouncementRules, announcementController.createAnnouncement);

router.put("/:id", createAnnouncementRules, announcementController.updateAnnouncement);

router.patch("/:id/status", announcementController.updateAnnouncementStatus);

router.delete("/:id", announcementController.deleteAnnouncement);

module.exports = router;