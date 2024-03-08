export class RaidDurationCalculator {
  private static readonly BASE_MULT = 250;
  private static readonly BASE_SUBTRACTOR = 150;
  private static readonly BASE_LEVEL_FACTOR = 0.7;
  private static readonly POWER = 1.352;

  /**
   * Returns duration of the raid in seconds
   *
   * @param lvl level of a unit
   */
  public static calc(lvl: number): number {
    const powerBase = lvl * this.BASE_LEVEL_FACTOR;

    const result =
      this.BASE_MULT * Math.pow(powerBase, this.POWER) -
      this.BASE_SUBTRACTOR * (lvl - 1);

    return result;
  }
}

export class RaidGoldCalculator {
  private static readonly LOOT_BASE_MIN = 5;
  private static readonly LOOT_RAND_MAX = 5;
  private static readonly LEVEL_RATIO = 0.7142;

  public static calc(lvl: number): number {
    const randNum = Math.random();
    // const randGrade = 3; // debug
    const randGrade =
      randNum <= 0.45 ? 0 : randNum <= 0.8 ? 1 : randNum <= 0.95 ? 2 : 3;

    const randExtraLoot = Math.random() * this.LOOT_RAND_MAX * randGrade;
    const lvlBasedRandExtraLoot = randExtraLoot * ((100 + lvl) / 100);

    const baseGold = this.LOOT_BASE_MIN + (lvl - 1) * this.LEVEL_RATIO;

    return baseGold + lvlBasedRandExtraLoot;
  }
}

export class RaidExpCalculator {
  private static readonly BASE_MIN = 2;
  private static readonly RAND_MAX = 0.4;
  private static readonly LEVEL_RATIO = 0.1224;

  public static calc(lvl: number): number {
    const randNum = Math.random();
    const randGrade =
      randNum <= 0.45 ? 0 : randNum <= 0.8 ? 1 : randNum <= 0.95 ? 2 : 3;

    const randExtraExp = Math.random() * this.RAND_MAX * randGrade;
    const lvlBasedRandExp = randExtraExp * ((50 + lvl) / 50);

    const baseExp = this.BASE_MIN + (lvl - 1) * this.LEVEL_RATIO;

    return baseExp + lvlBasedRandExp;
  }
}

export class UnitUpgradeGoldCalculator {
  private static readonly BASE_SIZE = 200; // weak effect on results
  private static readonly BASE_LEVEL_FACTOR = 15; // change this (15-25)
  private static readonly POWER_LEVEL_FACTOR = 0.00765; // and change this slightly

  public static calc(lvl: number): number {
    const result = Math.pow(
      this.BASE_SIZE + (lvl - 1) * this.BASE_LEVEL_FACTOR,
      1 + lvl * this.POWER_LEVEL_FACTOR,
    );

    return result;
  }
}

export class UnitUpgradeExpCalculator {
  private static readonly BASE_SIZE = 100; // weak effect on results
  private static readonly BASE_LEVEL_FACTOR = 12; // change this (15-25)
  private static readonly POWER_LEVEL_FACTOR = 0.00555; // and change this slightly

  public static calc(lvl: number): number {
    const result = Math.pow(
      this.BASE_SIZE + (lvl - 1) * this.BASE_LEVEL_FACTOR,
      1 + lvl * this.POWER_LEVEL_FACTOR,
    );

    return result;
  }
}

export class UnitUpgradeDurationCalculator {
  private static readonly TIME_BASE = 10; // in seconds
  private static readonly LEVEL_MULTIPLIER = 40; // seconds
  private static readonly POWER = 1.92;

  public static calc(lvl: number) {
    const levelIncrement = Math.ceil(lvl / 10);

    const lvlShiftPowerFactor = (levelIncrement + 60) / 60;
    const lvlShiftBaseFactor = (levelIncrement + 10) / 10 - 0.6;

    const lvlShiftDelta = (levelIncrement - 1) * 5;

    const shiftedLevel = lvl - 1 - lvlShiftDelta;

    const timeForLevel = shiftedLevel * this.LEVEL_MULTIPLIER;

    return Math.pow(
      this.TIME_BASE + timeForLevel * lvlShiftBaseFactor,
      this.POWER * lvlShiftPowerFactor,
    );
  }
}
