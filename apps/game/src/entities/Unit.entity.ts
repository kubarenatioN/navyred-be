import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
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
import { UnitUpgrade } from './UnitUpgrades.entity';
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

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: new Date(),
  })
  createdAt: Date;

  maxExp: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @ManyToOne(() => UnitModel)
  model: UnitModel;

  @OneToMany(() => Raid, (raid) => raid.unit)
  raids: Raid[];

  @OneToMany(() => UnitUpgrade, (upgrade) => upgrade.unit)
  upgrades: UnitUpgrade[];

  @AfterLoad()
  _afterLoad() {
    this.maxExp = this.upgradeExp;
  }

  @AfterInsert()
  _afterInsert() {
    console.log('Unit.entity After Insert');
  }

  @AfterUpdate()
  _afterUpdate() {
    console.log('Unit.entity After Update');
  }

  get upgradeExp(): number {
    // return 2;
    return UnitUpgradeExpCalculator.calc(this.level);
  }
}
