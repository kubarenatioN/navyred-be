import { ReadUnit } from '../../units/models';

export interface CreateRaid {
  unitId: number;
}

export interface RaidCompleteResponse {
  id: number;
  goldBalance: number;
  unit: ReadUnit;
}
