/**
 * APITable <https://github.com/apitable/apitable>
 * Copyright (C) 2022 APITable Ltd. <https://apitable.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Injectable } from '@nestjs/common';
import { DatasheetRecordService } from 'database/datasheet/services/datasheet.record.service';
import { difference } from 'lodash';
import { ApiException, ApiTipId } from 'shared/exception';

@Injectable()
export class FusionApiRecordService {
  constructor(
    private readonly recordService: DatasheetRecordService
  ) {
  }

  /**
   * Check if recordId and table ID match
   *
   * @param dstId
   * @param recordIds
   * @param error error message
   *
   * @throws ApiException
   */
  public async validateRecordExists(dstId: string, recordIds: string[], error: ApiTipId) {
    const dbRecordIds = await this.recordService.selectIdsByDstIdAndRecordIds(dstId, recordIds);
    if (!dbRecordIds?.length) {
      throw ApiException.tipError(error, { recordId: recordIds.join(', ') });
    }
    const diffs = difference(recordIds, dbRecordIds);
    if (diffs.length) {
      throw ApiException.tipError(error, { recordId: diffs.join(',') });
    }
  }
  
  /**
   * Check if Lcode relation recordId and table ID match
   *
   * @param dstId
   * @param recordIds
   * @param error error message
   *
   * @throws ApiException
   */
  public async validateRecordExistsOfLcode(dstId: string, recordIds: string[], error: ApiTipId) {
    const dbRecordIds = await this.recordService.selectDstRelRecordIdsByDstIdAndDataIds(dstId, recordIds);
    if (!dbRecordIds?.length) {
      throw ApiException.tipError(error, { recordId: recordIds.join(', ') });
    }
    return dbRecordIds;
  }
  /**
   * Check if Lcode relation recordId and table ID match
   *
   * @param dstId
   * @param recordIds
   * @param error error message
   *
   * @throws ApiException
   */
  public async deleteDstRelRecordsByDataId(recordIds: string[]) {
    console.log('$#####$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', recordIds);

    const res = await this.recordService.deleteDstRelRecordsByDataId(recordIds);
    console.log('jjjjjjjjjjjjjdasdasdasdsaj22222222222222222222222222222222222222222', res);
    return res;
    
  }
  /**
   * Check if recordId and dataId match
   *
   * @param dstId
   * @param dataId
   * @param error error message
   *
   * @throws ApiException
   */
  public async getRecordIdByDataId(dstId: string, dataId: string, error: ApiTipId) {
    const dbRecordIds = await this.recordService.selectDstRelRecordIdByDataId(dstId, dataId);
    if (!dbRecordIds?.length) {
      throw ApiException.tipError(error, { recordId: '没有找到对应的记录' });
    }
    return dbRecordIds[0];
  }

  /**
   * Check if recordId and dataId match
   *
   * @param dstId
   * @param dataId
   * @param error error message
   *
   * @throws ApiException
   */
  public async getRecordsIdByDataIds(dstId: string, dataIds: string[], error: ApiTipId) {
    const dbRecordIds = await this.recordService.selectDstRelRecordIdsByDstIdAndDataIds(dstId, dataIds);
    if (!dbRecordIds?.length) {
      throw ApiException.tipError(error, { dataIds: dataIds.join(', ') });
    }
    return dbRecordIds;
  }
}
