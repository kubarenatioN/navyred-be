import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity({
  name: 'refresh_tokens',
})
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column({
    default: false,
  })
  used: boolean;

  @Column({
    name: 'expires_in',
    type: 'timestamptz',
  })
  expiresIn: Date;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  user: User;
}
