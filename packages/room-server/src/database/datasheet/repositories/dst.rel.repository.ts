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

import { EntityRepository, In, Repository } from 'typeorm';
import { DstRelEntity } from '../entities/dst.rel.entity';

@EntityRepository(DstRelEntity)
export class DstRelRepository extends Repository<DstRelEntity> {
  selectDstRelRecordIdsByDstIdAndDataIds(dstId: string, dataIds: string[]): Promise<string[] | null> {
    return this.find({
      select: ['recordId'],
      where: [{ dstId, dataId: In(dataIds), isDeleted: false }],
    }).then(entities => {
      return entities.map(entity => entity.recordId);
    });
  }

  selectDstRelRecordsDataByDstIdAndFormId(dstId: string, formId: string): Promise<DstRelEntity[] | undefined> {
    return this.find({
      select: ['formId','dstId', 'recordId', 'dataId'],
      where: [{ dstId, formId, isDeleted: false }],
    });
  }

  selectDstIdByFormId(formId: string): Promise<string[] | undefined> {
    return this.find({
      select: ['dstId'],
      where: [{ formId }],
    }).then(entities => {
      return entities.map(entity => entity.dstId);
    });
  }

  selectDstRelRecordIdByDataId(dstId: string, dataId: string): Promise<string[] | undefined> {
    return this.find({
      select: ['recordId'],
      where: [{ dstId, dataId, isDeleted: false }],
    }).then(entities => {
      return entities.map(entity => entity.recordId);
    });
  }

  async deleteDstRelRecordsByDataId(dataIds: string[]): Promise<any> {
    return await this.createQueryBuilder()
      .delete()
      .where('data_id IN (:...dataIds)', { dataIds })
      .from(DstRelEntity)
      .execute();
  }
}
