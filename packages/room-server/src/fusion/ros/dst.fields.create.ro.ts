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

import { Field, FieldType, getFieldClass, getFieldTypeByString, getNewId, IAddFieldOptions, IDPrefix, IField, IReduxState } from '@apitable/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { DatasheetFieldCreateRo } from './datasheet.field.create.ro';

export class DstFieldsCreateRo {
  @ApiPropertyOptional({
    type: [DatasheetFieldCreateRo],
    required: false,
    description: 'List of fields to be created',
    example: [
      {
        name: 'Title',
        type: 'TEXT',
        isPrimary: true,
      },
      {
        name: 'Options',
        type: 'SingleSelect',
        property: {
          options: [
            {
              name: 'abc',
            },
          ],
        },
      },
    ],
  })
  @IsOptional()
  // @ArrayMaxSize(200, { message: ApiTipConstant.api_params_max_count_error, context: { value: 200 }})
  @Type(() => DatasheetFieldCreateRo)
  @ValidateNested()
  fields?: DatasheetFieldCreateRo[];

  transferToCommandData(): IAddFieldOptions[] {
    const fields: any[] = [];
    if (this.fields) {
      this.fields.forEach(field => {
        const fieldType = getFieldTypeByString(field.type as any)!;
        const fieldInfo = {
          id: getNewId(IDPrefix.Field),
          name: field.name,
          desc: field.desc,
          type: fieldType,
          property: getFieldClass(fieldType).defaultProperty(),
        } as IField;
        const fieldContext = Field.bindContext(fieldInfo, {} as IReduxState);
        const property = fieldContext.addOpenFieldPropertyTransformProperty(field.property!) || null;
        fields.push({
          data: {
            name: field.name,
            type: fieldType,
            desc: field.desc,
            property,
          },
        });
      });
    }
    return fields;
  }
  foreignDatasheetIds(): string[] {
    const foreignDatasheetIds: string[] = [];
    if (this.fields) {
      this.fields.forEach(field => {
        const fieldType = getFieldTypeByString(field.type as any)!;
        if (fieldType === FieldType.Link && field.property) {
          foreignDatasheetIds.push(field.property['foreignDatasheetId']);
        }
      });
    }
    return foreignDatasheetIds;
  }
}
