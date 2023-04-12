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

import {
  ApiTipConstant, Field, FieldTypeDescriptionMap, getFieldClass, getFieldTypeByString, getMaxFieldCountPerSheet, getNewId, IDPrefix, IField,
  IReduxState,
} from '@apitable/core';
import { Injectable, PipeTransform } from '@nestjs/common';
import { DatasheetCreateRo } from 'fusion/ros/datasheet.create.ro';
import { DatasheetFieldCreateRo } from 'fusion/ros/datasheet.field.create.ro';
import { ApiException } from 'shared/exception';

@Injectable()
export class CreateDstFieldsPipe implements PipeTransform {

  transform(ro: DatasheetCreateRo): DatasheetCreateRo {
    if (ro.fields && ro.fields.length > 0) {
      const fieldLenthLimit = getMaxFieldCountPerSheet();
      if (ro.fields.length > fieldLenthLimit) {
        throw ApiException.tipError(ApiTipConstant.api_params_max_count_error, { property: 'fields', value: fieldLenthLimit });
      }
      this.validateFields(ro.fields);
      this.validatePrimaryFieldType(ro.fields[0]!.type);
    }
    if (ro.fields) {
      ro.fields = this.transformProperty(ro.fields);
    }
    return ro;
  }

  public transformProperty(fields: DatasheetFieldCreateRo[]): DatasheetFieldCreateRo[] {
    fields.forEach(field => {
      switch (field.type) {
        case 'Number':
          this.transformNumberProperty(field);
          break;
      }
    });
    return fields;
  }

  public validatePrimaryFieldType(type: string) {
    const fieldType = getFieldTypeByString(type as any)!;
    const canBePrimaryField = FieldTypeDescriptionMap[fieldType]!.canBePrimaryField;
    if (!canBePrimaryField) {
      throw ApiException.tipError(ApiTipConstant.api_params_invalid_primary_field_type_error, { value: type });
    }
  }

  public validateFields(fields: DatasheetFieldCreateRo[]) {
    fields.forEach(field => {
      this.validate(field);
    });
    const seen = new Set();
    const hasDuplicatedFieldName = fields.some(function(field) {
      return seen.size === seen.add(field.name).size;
    });
    if (hasDuplicatedFieldName) {
      throw ApiException.tipError(ApiTipConstant.api_params_must_unique, { property: 'field.name' });
    }
  }

  public validate(field: DatasheetFieldCreateRo) {
    if (!field.name) {
      throw ApiException.tipError(ApiTipConstant.api_params_invalid_value, { property: 'field.name' });
    }
    if (field.name.length > 100) {
      throw ApiException.tipError(ApiTipConstant.api_params_max_length_error, { property: 'field.name', value: 100 });
    }
    const fieldType = getFieldTypeByString(field.type as any)!;
    if (!fieldType) {
      throw ApiException.tipError(ApiTipConstant.api_params_invalid_value, { property: `fields[${field.name}].type`, value: field.type });
    }
    const fieldInfo = {
      id: getNewId(IDPrefix.Field),
      name: field.name,
      desc: field.desc,
      type: fieldType,
      property: getFieldClass(fieldType).defaultProperty(),
    } as IField;
    const fieldContext = Field.bindContext(fieldInfo, {} as IReduxState);
    const { error } = fieldContext.validateAddOpenFieldProperty(field.property || null);
    if (error) {
      throw ApiException.tipError(ApiTipConstant.api_params_invalid_value, { property: `fields[${field.name}].property`, value: field.property });
    }
    return true;
  }

  private transformNumberProperty(field: DatasheetFieldCreateRo) {
    const property: any = field.property;
    if (typeof property.precision === 'string') {
      property.precision = Number(property.precision);
    }
    field.property = property;
  }
}
