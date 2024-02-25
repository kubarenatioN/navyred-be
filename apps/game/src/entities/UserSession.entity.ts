import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_session')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;
}
