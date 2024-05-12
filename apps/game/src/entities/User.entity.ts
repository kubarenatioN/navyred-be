import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from './UserAccount.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  login: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    nullable: true,
  })
  walletAddress: string;

  @OneToOne(() => UserAccount, (acc) => acc.user)
  @JoinColumn()
  gameAccount: UserAccount;
}
