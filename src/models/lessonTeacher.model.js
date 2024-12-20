const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LessonTeacher = sequelize.define('LessonTeacher', {
    lessonId: {
      type: DataTypes.INTEGER,
      field: 'lesson_id',
      primaryKey: true,
      references: {
        model: 'lessons',
        key: 'id',
      },
    },
    teacherId: {
      type: DataTypes.INTEGER,
      field: 'teacher_id',
      primaryKey: true,
      references: {
        model: 'teachers',
        key: 'id',
      },
    },
  }, {
    tableName: 'lesson_teachers',
    timestamps: false,
  });

  return LessonTeacher;
};
