import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'units',
})
export class UnitModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  level: number;

  goldLootFactor: number;
  minGoldLoot: number;
  maxGoldLoot: number;

  expFactor: number;
  minExpLoot: number;
  maxExpLoot: number;
}
