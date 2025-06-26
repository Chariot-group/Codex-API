import { Module } from '@nestjs/common';
import { DysonService } from './dyson.service';

@Module({
  imports: [],
  providers: [DysonService],
  exports: [DysonService],
})
export class DysonModule {}
