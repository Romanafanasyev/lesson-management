const { Op, literal } = require('sequelize');
const { Lesson, Teacher, Student } = require('../models');

class LessonService {
  /**
   * Parse and validate filters for lessons.
   * @param {Object} filters
   * @returns {Object}
   */
  static parseFilters(filters) {
    const { date, status, teacherIds, studentsCount } = filters;
    const whereClause = {};

    // Handle date filter
    if (date) {
      const dateRange = date.split(',');
      if (dateRange.length === 1) {
        whereClause.date = dateRange[0];
      } else if (dateRange.length === 2) {
        whereClause.date = { [Op.between]: [dateRange[0], dateRange[1]] };
      } else {
        throw new Error('Invalid date format.');
      }
    }

    // Handle status filter
    if (status !== undefined) {
      if (![0, 1].includes(Number(status))) {
        throw new Error('Invalid status parameter.');
      }
      whereClause.status = status;
    }

    // Parse teacher IDs
    const parsedTeacherIds = teacherIds
      ? teacherIds.split(',').map(Number)
      : null;

    // Parse student count
    let studentFilter = null;
    if (studentsCount) {
      const range = studentsCount.split(',').map(Number);
      studentFilter = range.length === 1
        ? `= ${range[0]}`
        : `BETWEEN ${range[0]} AND ${range[1]}`;
    }

    return { whereClause, parsedTeacherIds, studentFilter };
  }

  /**
   * Build subquery for filtering lessons.
   * @param {Object} filters
   * @param {number} lessonsPerPage
   * @param {number} offset
   * @returns {string}
   */
  static buildSubQuery(filters, lessonsPerPage, offset) {
    const { whereClause, parsedTeacherIds, studentFilter } = filters;

    const teacherFilter = parsedTeacherIds
      ? `AND "Lesson"."id" IN (
          SELECT "lt"."lesson_id"
          FROM "lesson_teachers" AS "lt"
          WHERE "lt"."teacher_id" IN (${parsedTeacherIds.join(',')})
        )`
      : '';

    const studentHaving = studentFilter
      ? `HAVING COUNT("ls"."student_id") ${studentFilter}`
      : '';

    return `
      SELECT "Lesson"."id"
      FROM "lessons" AS "Lesson"
      LEFT JOIN "lesson_students" AS "ls" ON "Lesson"."id" = "ls"."lesson_id"
      WHERE 1=1
      ${whereClause.date ? `AND "Lesson"."date" ${whereClause.date[Op.between] ? `BETWEEN '${whereClause.date[Op.between][0]}' AND '${whereClause.date[Op.between][1]}'` : `= '${whereClause.date}'`}` : ''}
      ${whereClause.status !== undefined ? `AND "Lesson"."status" = ${whereClause.status}` : ''}
      ${teacherFilter}
      GROUP BY "Lesson"."id"
      ${studentHaving}
      ORDER BY "Lesson"."date" ASC
      LIMIT ${lessonsPerPage} OFFSET ${offset}
    `;
  }

  /**
   * Get lessons with filtering and pagination.
   * @param {Object} filters - Filters for lessons
   * @param {number} page - Page number
   * @param {number} lessonsPerPage - Lessons per page
   * @returns {Promise<Array>}
   */
  static async getLessons(filters = {}, page = 1, lessonsPerPage = 5) {
    try {
      const offset = (page - 1) * lessonsPerPage;
      const parsedFilters = this.parseFilters(filters);
      const subQuery = this.buildSubQuery(parsedFilters, lessonsPerPage, offset);

      const lessons = await Lesson.findAll({
        where: {
          id: {
            [Op.in]: literal(`(${subQuery})`),
          },
        },
        include: [
          {
            model: Teacher,
            as: 'teachers',
            attributes: ['id', 'name'],
            through: { attributes: [] },
          },
          {
            model: Student,
            as: 'students',
            attributes: ['id', 'name'],
            through: {
              attributes: ['visit'],
            },
          },
        ],
        attributes: {
          include: [
            [
              literal(`(
                SELECT COUNT(*)
                FROM "lesson_students" AS "ls"
                WHERE "ls"."lesson_id" = "Lesson"."id"
              )`),
              'studentCount',
            ],
          ],
        },
        subQuery: false,
      });

      return lessons.map((lesson) => ({
        id: lesson.id,
        date: lesson.date,
        title: lesson.title,
        status: lesson.status,
        visitCount: lesson.students.filter((s) => s.LessonStudent.visit).length,
        students: lesson.students.map((student) => ({
          id: student.id,
          name: student.name,
          visit: student.LessonStudent.visit,
        })),
        teachers: lesson.teachers.map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
        })),
      }));
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw new Error(`Error: ${error.message}`);
    }
  }
}

module.exports = LessonService;
