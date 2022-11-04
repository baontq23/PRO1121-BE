import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Classroom } from './Classroom';
import { Student } from './Student';

@Entity({ name: 'tbl_class_students' })
export class ClassStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Classroom, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true
  })
  @JoinColumn({
    name: 'classroom_id',
    foreignKeyConstraintName: 'FK_Classroom_ClassStudent'
  })
  classroomId: Classroom;

  @ManyToOne(() => Student, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'FK_Student_ClassStudent'
  })
  studentId: Student;

  @Column({ type: 'float', nullable: true })
  regularScore1: number;

  @Column({ type: 'float', nullable: true })
  regularScore2: number;

  @Column({ type: 'float', nullable: true })
  regularScore3: number;

  @Column({ type: 'float', nullable: true })
  midtermScore: number;

  @Column({ type: 'float', nullable: true })
  finalScore: number;

  @Column()
  @IsNotEmpty()
  semester: number;

}
