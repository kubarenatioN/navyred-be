import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'apps/game/src/entities';
import { Repository } from 'typeorm';
import { CreateUnit } from '../model/units.model';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepo: Repository<Unit>,
  ) {}

  async getAll() {
    return this.unitsRepo.find();
  }

  async create(data: CreateUnit) {
    // TODO: make important checks (db lookup)
    const saved = await this.unitsRepo.save(data);
    return saved;
  }
}
