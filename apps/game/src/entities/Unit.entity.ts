import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Raid } from './Raid.entity';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Raid, (raid) => raid.unit)
  raids: Raid[];

  level: number;

  goldLootFactor: number;
  minGoldLoot: number;
  maxGoldLoot: number;

  expFactor: number;
  minExpLoot: number;
  maxExpLoot: number;
}
