import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUserContext } from '@adaptive-planner/contracts';
import { IntegrationsService } from './integrations.service';

@ApiTags('Integrations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Show supported integration providers and tools' })
  @ApiResponse({ status: 200, description: 'Catalog returned successfully' })
  getCatalog() {
    const catalog = this.integrationsService.getCatalog();
    return {
      success: true,
      data: catalog,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':provider/connect')
  @ApiOperation({ summary: 'Begin OAuth flow for a provider' })
  @ApiResponse({ status: 200, description: 'Authorization redirect URL generated' })
  async beginConnect(
    @Param('provider') provider: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const result = await this.integrationsService.beginConnect(provider, user);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List connected provider accounts for current workspace' })
  @ApiResponse({ status: 200, description: 'Connected accounts returned' })
  async listConnections(@CurrentUser() user: AuthenticatedUserContext) {
    const connections = await this.integrationsService.listConnections(user);
    return {
      success: true,
      data: connections,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect and revoke an integration connection' })
  @ApiResponse({ status: 200, description: 'Connection disconnected' })
  async disconnect(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserContext,
  ) {
    const result = await this.integrationsService.disconnect(id, user);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
