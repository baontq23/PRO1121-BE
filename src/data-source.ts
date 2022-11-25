import { DataSource } from 'typeorm';
import { Teacher } from './entity/Teacher';
import { Classroom } from './entity/Classroom';
import { Parent } from './entity/Parent';
import { Student } from './entity/Student';
import { ClassStudent } from './entity/ClassStudent';
import { Feedback } from './entity/Feedback';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'easyedu_db',
  synchronize: true,
  logging: false,
  entities: [Teacher, Classroom, Parent, Student, ClassStudent, Feedback],
  migrations: ['src/migration/**/*.js'],
  subscribers: []
});
