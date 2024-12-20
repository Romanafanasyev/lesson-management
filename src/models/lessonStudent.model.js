
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LessonStudent = sequelize.define('LessonStudent', {
    lessonId: {
      type: DataTypes.INTEGER,
      field: 'lesson_id',
      references: {
        model: 'Lesson',
        key: 'id',
      },
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      field: 'student_id',
      references: {
        model: 'Student',
        key: 'id',
      },
      allowNull: false,
    },
    visit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'lesson_students',
    timestamps: false,
  });

  return LessonStudent;
};
