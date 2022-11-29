import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Classroom } from './Classroom';
import { Student } from './Student';
import { Teacher } from './Teacher';

@Entity({ name: 'tbl_feedbacks' })
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Nội dung không thể để trống!' })
  content: string;

  @Column({ type: 'bigint', nullable: true })
  date: number;

  @ManyToOne(() => Classroom, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: false
  })
  @JoinColumn({
    name: 'classroom_id',
    foreignKeyConstraintName: 'FK_ClassRoom_Feedback'
  })
  classroom: Classroom;

  @ManyToOne(() => Student, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: false
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'FK_Student_Feedback'
  })
  studentId: Student;
}
