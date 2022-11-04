import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './Student';
import { Teacher } from './Teacher';

@Entity({ name: 'tbl_feedbacks' })
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'text'})
  @IsNotEmpty({message: 'Nội dung không thể để trống!'})
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => Teacher, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true
  })
  @JoinColumn({
    name: 'teacher_id',
    foreignKeyConstraintName: 'FK_Teacher_Feedback'
  })
  teacherId: Teacher;

  @ManyToOne(() => Student, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true
  })
  @JoinColumn({
    name: 'student_id',
    foreignKeyConstraintName: 'FK_Student_Feedback'
  })
  studentId: Student;
}
