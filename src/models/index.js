const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
  }
);


const Lesson = require('./lesson.model')(sequelize);
const Teacher = require('./teacher.model')(sequelize);
const Student = require('./student.model')(sequelize);
const LessonTeacher = require('./lessonTeacher.model')(sequelize);
const LessonStudent = require('./lessonStudent.model')(sequelize);

Lesson.belongsToMany(Teacher, {
  through: LessonTeacher,
  as: 'teachers',
  foreignKey: 'lessonId',
  otherKey: 'teacherId',
});

Teacher.belongsToMany(Lesson, {
  through: LessonTeacher,
  as: 'lessons',
  foreignKey: 'teacherId',
  otherKey: 'lessonId',
});

Lesson.belongsToMany(Student, {
  through: LessonStudent,
  as: 'students',
  foreignKey: 'lessonId',
  otherKey: 'studentId',
});

Student.belongsToMany(Lesson, {
  through: LessonStudent,
  as: 'lessons',
  foreignKey: 'studentId',
  otherKey: 'lessonId',
});



module.exports = {
  sequelize,
  Sequelize,
  Lesson,
  Teacher,
  Student,
  LessonTeacher,
  LessonStudent,
};
