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

import React from 'react';
import { IDividerProps } from './interface';
import { DividerStyled, DividerChildStyled } from './styled';

export const Divider: React.FC<React.PropsWithChildren<IDividerProps>> = ({
  orientation = 'horizontal', textAlign, dashed, component = 'div', style, className, children, typography = 'body2'
}) => {
  const hasChildren = Boolean(children);
  const dividerProps = { orientation, textAlign, dashed, style, className, hasChildren, typography };
  return (
    <DividerStyled
      as={component}
      {...dividerProps}
    >
      {hasChildren && (
        <DividerChildStyled>{children}</DividerChildStyled>
      )}
    </DividerStyled>
  );
};