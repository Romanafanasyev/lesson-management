const LessonService = require('../services/LessonService');

class LessonController {
  static async getLessons(req, res, next) {
    try {
      const { date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5 } = req.query;

      const filters = { date, status, teacherIds, studentsCount };
      const lessonsData = await LessonService.getLessons(
        filters,
        parseInt(page, 10),
        parseInt(lessonsPerPage, 10)
      );

      return res.json(lessonsData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LessonController;
