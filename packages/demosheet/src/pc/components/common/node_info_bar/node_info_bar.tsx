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

import { FC, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { ConfigConstant, FOLDER_SHOWCASE_ID, Strings, t } from '@apitable/core';
import styles from './style.module.less';
import { KeyCode } from 'pc/utils';
import { NodeFavoriteStatus } from '../node_favorite_status';
import { Tooltip } from '../tooltip';
import classNames from 'classnames';
import { DescriptionModal } from 'pc/components/tab_bar/description_modal';
import { Typography } from '@apitable/components';
import { useSelector } from 'react-redux';

export const NODE_NAME_MIN_LEN = 1;
export const NODE_NAME_MAX_LEN = 100;

export interface INodeInfoBarProps {
  data: {
    nodeId: string;
    name: string | undefined;
    icon: string | undefined;
    type: ConfigConstant.NodeType;
    nameEditable?: boolean;
    iconEditable?: boolean;
    favoriteEnabled?: boolean;
    role?: string;
    iconSize?: number;
  };
  style?: React.CSSProperties;
  hiddenModule?: { icon?: boolean, permission?: boolean, favorite?: boolean };
}

export const NodeInfoBar: FC<React.PropsWithChildren<INodeInfoBarProps>> = ({ data, hiddenModule, style }) => {
  const {
    nodeId,
    type,
    name,
    favoriteEnabled = false,
    nameEditable = false,
  } = data;
  const [newName, setNewName] = useState(name);
  const [editing, setEditing] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const nodeInfoBarRef = useRef<HTMLDivElement>(null);
  const isDatasheet = type === ConfigConstant.NodeType.DATASHEET;
  const embedId = useSelector(state => state.pageParams.embedId);

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const rename = () => {
    if (!newName) {
      return;
    }

    const value = newName.trim();
    if (value === name) {
      setEditing(false);
      return;
    }
    setEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setNewName(inputValue);
    if (inputValue.length < NODE_NAME_MIN_LEN || inputValue.length > NODE_NAME_MAX_LEN) {
      setErrMsg(t(Strings.name_length_err));
      return;
    }

  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.keyCode) {
      case KeyCode.Enter:
        if (errMsg) {
          return;
        }
        rename();
        setEditing(false);
        break;
      case KeyCode.Esc:
        setNewName(name);
        setEditing(false);
        (e.target as HTMLInputElement).blur();
    }
  };

  const handleBlur = () => {
    setNewName(name);
    setEditing(false);
  };

  return (
    <div className={classNames(styles.nodeInfoBar, { [styles.multiLine]: isDatasheet })} ref={nodeInfoBarRef}>
      <div className={classNames(styles.nameWrapper, { [styles.editing]: editing })}>
        {
          editing ? (
            <Tooltip title={errMsg} visible={Boolean(errMsg)}>
              <input
                id={FOLDER_SHOWCASE_ID.TITLE_INPUT}
                className={styles.nameInput}
                value={newName}
                onChange={handleChange}
                disabled={!nameEditable}
                onKeyDown={handleKeyDown}
                style={style}
                onBlur={handleBlur}
                autoFocus
                spellCheck='false'
              />
            </Tooltip>
          ) : (
            <div id={FOLDER_SHOWCASE_ID.TITLE} className={styles.nameBox} onClick={() => nameEditable && setEditing(true)}>
              <Typography variant="h7" className={styles.name} style={style} component="span" ellipsis>{newName}</Typography>
            </div>
          )
        }
        {!hiddenModule?.favorite && (!editing || (editing && isDatasheet)) && !embedId &&
          <NodeFavoriteStatus nodeId={nodeId} enabled={favoriteEnabled} />
        }
      </div>
      <div className={styles.permissionWrapper}>
        {/* {!hiddenModule?.permission && (!editing || (editing && isDatasheet)) &&
        <Tooltip title={getPermissionTip()}>
          <div style={{ flexShrink: 0, display: 'flex' }}>
            <Tag
              className={styles.tag}
              color={TagColors[role]}
            >
              {ConfigConstant.permissionText[getPermission(role, { shareInfo: shareInfo })]}
            </Tag>
          </div>
        </Tooltip>
        } */}
        {/* {!hiddenModule?.favorite && (!editing || (editing && isDatasheet)) &&
        <NodeFavoriteStatus nodeId={nodeId} enabled={favoriteEnabled} />
        } */}
        {isDatasheet &&
          <DescriptionModal
            activeNodeId={nodeId}
            datasheetName={newName || ''}
            showIntroduction
            showIcon={false}
          />
        }
      </div>
    </div>
  );
};
