import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../helpers/transformers';
import { Unit } from './Unit.entity';

export type RaidStatusType =
  | 'in_progress'
  | 'returned'
  | 'completed'
  | 'stopped';

export enum RaidStatusEnum {
  InProgress = 'in_progress',
  Returned = 'returned',
  Completed = 'completed',
  Stopped = 'stopped',
}

@Entity('raids')
export class Raid {
  @PrimaryGeneratedColumn()
  id: number;

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

  /**
   * Calculated ahead of time gold loot for the raid.
   * This value should be defined by a goldLoot function,
   * which takes different input data like unit level, unit type, etc.
   * and also slightly randomizes the end result.
   */
  @Column({
    name: 'gold_loot',
    type: 'decimal',
    default: 0,
    transformer: new ColumnNumericTransformer(),
    select: false,
  })
  goldLoot: number;

  @Column({
    name: 'status',
    enum: RaidStatusEnum,
    default: RaidStatusEnum.InProgress,
  })
  status: RaidStatusEnum;

  @ManyToOne(() => Unit, (unit) => unit.raids)
  unit: Unit;
}
