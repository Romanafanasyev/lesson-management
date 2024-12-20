const express = require('express');
const router = express.Router();

const LessonController = require('../controllers/LessonController');
const validateGetLessons = require("../middleware/validateGetLessons");

router.get('/', validateGetLessons, LessonController.getLessons);

module.exports = router;
