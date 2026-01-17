// import sequelize from "../../database/connection.js";

// export const addInstituteForeignKeys = async (req, _res, next) => {
//   const n = req.user.currentInstituteNumber;

//   await sequelize.transaction(async (t) => {
//     await sequelize.query(
//       `
//       ALTER TABLE user_institute
//       ADD CONSTRAINT fk_user_institute_user
//       FOREIGN KEY (userId)
//       REFERENCES users(id)
//       ON DELETE CASCADE
//       ON UPDATE CASCADE;
//       `,
//       { transaction: t }
//     );

//     await sequelize.query(
//       `
//       ALTER TABLE course_${n}
//       ADD CONSTRAINT fk_course_category_${n}
//       FOREIGN KEY (categoryId)
//       REFERENCES category_${n}(id);
//       `,
//       { transaction: t }
//     );

//     await sequelize.query(
//       `
//       ALTER TABLE course_${n}
//       ADD CONSTRAINT fk_course_teacher_${n}
//       FOREIGN KEY (teacherId)
//       REFERENCES teacher_${n}(id)
//       ON DELETE SET NULL;
//       `,
//       { transaction: t }
//     );

//     await sequelize.query(
//       `
//       ALTER TABLE course_chapter_${n}
//       ADD CONSTRAINT fk_chapter_course_${n}
//       FOREIGN KEY (courseId)
//       REFERENCES course_${n}(id)
//       ON DELETE CASCADE;
//       `,
//       { transaction: t }
//     );

//     await sequelize.query(
//       `
//       ALTER TABLE chapter_lesson_${n}
//       ADD CONSTRAINT fk_lesson_chapter_${n}
//       FOREIGN KEY (chapterId)
//       REFERENCES course_chapter_${n}(id)
//       ON DELETE CASCADE;
//       `,
//       { transaction: t }
//     );
//   });

//   next();
// };
