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

import classNames from 'classnames';
import { CellMember } from 'pc/components/multi_grid/cell/cell_member';
import { stopPropagation } from 'pc/utils';
import { useRef } from 'react';
import * as React from 'react';
import { IHeadMemberProps } from './interface';
import styles from './styles.module.less';

export const MemberFieldHead: React.FC<React.PropsWithChildren<IHeadMemberProps>> = props => {
  const { cellValue, field, editing, setEditing, readOnly, isNewBoard } = props;
  const divRef = useRef(null);

  function onDoubleClick() {
    if (editing || readOnly) {
      return;
    }
    setEditing(true);
  }

  const style: React.CSSProperties = editing ? { width: isNewBoard ? '80%' : '100%' } : {};

  // The setEditing operation is not done here because it is a compromise for the member column to go beyond the ellipses and 
  // to fit the width of the statistics on the right, 
  // so setEditing(false) needs to be implemented in the upper level
  return (
    <>
      <div onClick={onDoubleClick} ref={divRef} style={{ position: 'relative', overflow: 'hidden', ...style }}>
        {editing && (
          <div className={styles.memberEdit} onMouseDown={stopPropagation}>
            <CellMember field={field} cellValue={cellValue} className={classNames(styles.memberHeader, styles.whiteBg)} />
          </div>
        )}

        {!editing && <CellMember field={field} cellValue={cellValue} className={styles.memberHeader} />}
      </div>
    </>
  );
};
