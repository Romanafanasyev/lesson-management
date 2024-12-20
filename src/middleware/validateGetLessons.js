const moment = require('moment');

const validateGetLessons = (req, res, next) => {
  const { date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5 } = req.query;
  const errors = [];

  // Validate date
  if (date) {
    const dates = date.split(',');
    if (dates.length > 2) {
      errors.push('Параметр date должен содержать одну или две даты в формате YYYY-MM-DD, разделённые запятой.');
    } else {
      dates.forEach((d) => {
        if (!moment(d, 'YYYY-MM-DD', true).isValid()) {
          errors.push(`Дата "${d}" имеет некорректный формат или не является действительной датой.`);
        }
      });
    }
  }

  // Validate status
  if (status !== undefined && !['0', '1'].includes(status)) {
    errors.push('Параметр status должен быть либо 0, либо 1.');
  }

  // Validate teacherIds
  if (teacherIds) {
    const ids = teacherIds.split(',');
    if (ids.some((id) => isNaN(parseInt(id, 10)))) {
      errors.push('Параметр teacherIds должен содержать только числовые значения, разделённые запятой.');
    }
  }

  // Validate studentsCount
  if (studentsCount) {
    const counts = studentsCount.split(',');
    if (counts.length > 2 || counts.some((count) => isNaN(parseInt(count, 10)))) {
      errors.push('Параметр studentsCount должен содержать одно число или два числа, разделённые запятой.');
    }
  }

  // Validate page and lessonsPerPage
  if (isNaN(parseInt(page, 10)) || parseInt(page, 10) < 1) {
    errors.push('Параметр page должен быть положительным числом.');
  }

  if (isNaN(parseInt(lessonsPerPage, 10)) || parseInt(lessonsPerPage, 10) < 1) {
    errors.push('Параметр lessonsPerPage должен быть положительным числом.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = validateGetLessons;
