import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Teacher } from './Teacher';

@Entity({name: 'tbl_classrooms'})
export class Classroom {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  @IsNotEmpty()
  name: string;
  @Column({ type: 'text', nullable: true})
  description: string;
  @Column({type: 'text'})
  @IsNotEmpty()
  subject: string;
  @ManyToOne(() => Teacher, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true
  })
  @JoinColumn({
    name: 'teacher_id',
    foreignKeyConstraintName: 'FK_Teacher_Classroom'
  })
  teacherId: Teacher;
}
