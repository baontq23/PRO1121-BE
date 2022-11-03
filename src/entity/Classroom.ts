import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Teacher } from './Teacher';

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text', default: '' })
  name: string;
  @Column({ type: 'text', default: '' })
  decription: string;
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
