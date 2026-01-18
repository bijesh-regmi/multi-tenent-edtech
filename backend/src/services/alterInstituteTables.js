import sequelize from "../config/database.js";

const createRelationship = async (instituteNumber) => {
    await sequelize.query(`
        ALTER TABLE course_${instituteNumber}

        ADD CONSTRAINT fk_course_category_${instituteNumber}
        FOREIGN KEY (categoryId)
        REFERENCES category_${instituteNumber}(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
        ADD CONSTRAINT fk_course_teacher_${instituteNumber}
        FOREIGN KEY (teacherId)
        REFERENCES teacher_${instituteNumber}(id)
    `);



    await sequelize.query(`
        ALTER TABLE course_chapter_${instituteNumber}
        ADD CONSTRAINT fk_course_chapter_${instituteNumber}
        FOREIGN KEY (courseId)
        REFERENCES course_${instituteNumber}(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    `);

    await sequelize.query(`
        ALTER TABLE chapter_lesson_${instituteNumber}
        ADD CONSTRAINT fk_chapter_lesson_${instituteNumber}
        FOREIGN KEY (chapterId)
        REFERENCES course_chapter_${instituteNumber}(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    `);
};

export default createRelationship;
