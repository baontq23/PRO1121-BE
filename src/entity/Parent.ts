import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Entity({ name: 'tbl_parents' })
export class Parent {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Tên không được để trống!' })
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  @IsNotEmpty({ message: 'Mật khẩu không thể để trống!' })
  password: string;

  @Column({ type: 'text', nullable:true })
  dob: string;

  @Column({ type: 'text', unique: true })
  @IsNotEmpty({ message: 'Số điện thoại không thể để trống!' })
  phone: string;

  @Column({ type: 'text', nullable: true })
  fcmToken: string;
  
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
