import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class GamePlayService {
  cron: number;

  constructor(latency: number) {
    this.cron = latency;
  }
}
