import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../helpers/transformers';
import { User } from './User.entity';

@Entity('user_accounts')
export class UserAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'gold_balance',
    type: 'decimal',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  goldBalance: number;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
