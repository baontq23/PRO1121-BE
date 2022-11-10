import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import * as bcrypt from 'bcryptjs';

@Entity({ name: 'tbl_teachers' })

export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  @IsNotEmpty({ message: 'Mật khẩu không thể để trống!' })
  password: string;

  @Column()
  @IsNotEmpty({ message: 'Họ tên không thể để trống!' })
  name: string;

  @Column({ type: 'text', unique: true })
  @IsNotEmpty({ message: 'Số điện thoại không thể để trống!' })
  phone: string;

  @Column({ nullable: true })
  dob: string;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
