import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { AuthGuard } from '../auth/guards';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across vaults, items, and organizations' })
  @ApiQuery({ name: 'q', required: true })
  async globalSearch(@Query('q') query: string, @Req() req: any) {
    return this.searchService.globalSearch(req.user.userId, query);
  }

  @Get('vaults/:vaultId')
  @ApiOperation({ summary: 'Search items within a specific vault' })
  @ApiQuery({ name: 'q', required: true })
  async searchItems(
    @Param('vaultId') vaultId: string,
    @Query('q') query: string,
    @Req() req: any,
  ) {
    return this.searchService.searchItems(vaultId, query, req.user.userId);
  }
}
