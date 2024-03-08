import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UnitUpgradeExpCalculator } from '../helpers/calculators/units.calculator';
import { ColumnNumericTransformer } from '../helpers/transformers';
import { Raid } from './Raid.entity';
import { UnitModel } from './UnitModel.entity';
import { User } from './User.entity';

@Entity({
  name: 'user_units',
})
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 1,
  })
  level: number;

  @Column({
    default: 0,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  exp: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @ManyToOne(() => UnitModel)
  model: UnitModel;

  @OneToMany(() => Raid, (raid) => raid.unit)
  raids: Raid[];

  get upgradeExp(): number {
    return UnitUpgradeExpCalculator.calc(this.level);
  }
}
