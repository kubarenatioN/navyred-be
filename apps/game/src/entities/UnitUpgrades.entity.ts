import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Unit } from './Unit.entity';

export type UpgradeUnitStatusType = 'completed' | 'in_progress';

@Entity({
  name: 'units_upgrades',
})
export class UnitUpgrade {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Unit)
  unit: Unit;

  @Column({
    name: 'start_at',
    type: 'timestamptz',
  })
  startAt: Date;

  @Column({
    name: 'end_at',
    type: 'timestamptz',
  })
  endAt: Date;

  @Column()
  status: UpgradeUnitStatusType;
}
