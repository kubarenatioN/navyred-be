import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({
    unique: true,
  })
  @Column()
  uid: string;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    name: 'expired_at',
    type: 'timestamp',
  })
  expiredAt: Date;
}
