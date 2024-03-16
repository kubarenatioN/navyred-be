import { Unit, UpgradeUnitStatusType } from 'apps/game/src/entities';

export interface CreateUnit {
  name: string;
}

export interface ReadUnit {
  id: number;
  level: number;
  exp: number;
}

export interface CreateUpgradeUnit {
  unit: Unit;
  status: UpgradeUnitStatusType;
  startAt: Date;
  endAt: Date;
}
