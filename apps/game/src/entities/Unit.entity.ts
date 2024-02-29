import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Raid } from './Raid.entity';
import { UnitModel } from './UnitModel.entity';
import { User } from './User.entity';

@Entity({
  name: 'user_units',
})
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  owner: User;

  @ManyToOne(() => UnitModel)
  model: UnitModel;

  @OneToMany(() => Raid, (raid) => raid.unit)
  raids: Raid[];
}
