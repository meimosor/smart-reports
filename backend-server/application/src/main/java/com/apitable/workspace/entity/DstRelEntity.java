/*
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

package com.apitable.workspace.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.*;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * Workbench -  Node Table
 * </p>
 *
 * @author Mybatis Generator Tool
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode
@TableName(keepGlobalPrefix = true, value = "datasheet_rel")
public class DstRelEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Primary key
     */
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * lowcode form id
     */
    private String formId;

    /**
     * datasheet Id
     */
    private String dstId;

    /**
     * lowcode table record id
     */
    private String dataId;

    /**
     * datasheet table  record id
     */
    private String recordId;

    /**
     * Delete tag(0:No,1:Yes)
     */
    @TableLogic
    private Boolean isDeleted;

    public DstRelEntity(String formId, String dstId) {
        this.formId = formId;
        this.dstId = dstId;
    }

    public DstRelEntity(String formId, String dstId, String dataId, String recordId, Boolean isDeleted) {
        this.formId = formId;
        this.dstId = dstId;
        this.dataId = dataId;
        this.recordId = recordId;
        this.isDeleted = isDeleted;
    }
}
