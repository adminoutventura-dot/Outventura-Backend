import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Activities')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activitiesService: ActivityService) { }

  @Post()
  @ApiOperation({ summary: 'Crear activitat' })
  create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto);
  }

  @Post(':id/category/:catId')
  @ApiOperation({ summary: 'Assignar una categoria a una activitat' })
  addCategory(
    @Param('id', ParseIntPipe) id: number,
    @Param('catId', ParseIntPipe) catId: number
  ) {
    return this.activitiesService.addCategoryToActivity(id, catId);
  }

  @Get()
  findAll() {
    return this.activitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateActivityDto>) {
    return this.activitiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activitiesService.remove(id);
  }
}