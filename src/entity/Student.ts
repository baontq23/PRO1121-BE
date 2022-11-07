import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import { Parent } from './Parent';

@Entity({ name: 'tbl_students' })
export class Student {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Tên không được để trống!' })
  name: string;

  @Column({ type: 'text', default: '' })
  dob: string;

  @Column({ type: 'text', nullable: true })
  gender: string;

  @ManyToOne(() => Parent, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    eager: true
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'FK_PARENT_STUDENT'
  })
  parentId: Parent;
}
