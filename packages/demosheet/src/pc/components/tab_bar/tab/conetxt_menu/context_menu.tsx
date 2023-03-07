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
  Api, ConfigConstant, DATASHEET_ID, IPermissions,
  IViewProperty, StoreActions, Strings, t,
} from '@apitable/core';
import { ContextMenu as ContextMenuList, IContextMenuClickState, Switch } from '@apitable/components';
import { AutosaveOutlined } from '@apitable/icons';
import { Modal } from 'pc/components/common';
import { confirmViewAutoSave } from 'pc/components/tab_bar/view_sync_switch/popup_content';
import { useViewAction } from 'pc/components/tool_bar/view_switcher/action';
import { changeView } from 'pc/hooks';
import { flatContextData } from 'pc/utils';
import * as React from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

interface IContextMenuProps {
  activeViewId: string | undefined;
  activeNodeId: string | undefined;
  folderId: string | undefined;
  viewList: IViewProperty[];
  permissions: IPermissions;
  contextMenu: IContextMenuClickState;
  setEditIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export const ContextMenu: React.FC<React.PropsWithChildren<IContextMenuProps>> = props => {
  const {
    activeViewId,
    viewList,
    // formList,
    activeNodeId,
    permissions,
    setEditIndex,
    contextMenu,
  } = props;
  const [showDeleteTip, setShowDeleteTip] = useState(false);
  const shareId = useSelector(state => state.pageParams.shareId);
  const { manageable: viewSyncManageable } = permissions;
  const view = viewList.find((item) => item.id === activeViewId);
  const { deleteView } = useViewAction();
  const spaceManualSaveViewIsOpen = useSelector(state => {
    return state.labs.includes('view_manual_save');
  });

  const confirmDelete = (currentViewId: string) => {
    if (currentViewId === activeViewId) {
      // If the deleted view is the currently displayed view, switch the active view to another view in the view list
      if (viewList.findIndex(item => item.id === currentViewId) === 0) {
        changeView(viewList[1]['id']);
      } else {
        changeView(viewList[0]['id']);
      }
    }
    deleteView(currentViewId);
  };

  const handleRenameItem = (args: any) => {
    const { props: { tabIndex }} = args;
    setEditIndex(tabIndex);
    return;
  };

  const handleForDeleteView = async(args: any) => {
    const { props: { tabIndex }} = args;
    let content = t(Strings.del_view_content, {
      view_name: viewList[tabIndex].name,
    });
    const [formList, { data: { data: mirrorList }}] = await Promise.all([
      StoreActions.fetchForeignFormList(activeNodeId!, activeViewId!),
      Api.getRelateNodeByDstId(activeNodeId!, activeViewId!, ConfigConstant.NodeType.MIRROR),
    ]);

    if (formList?.length > 0) {
      content = t(Strings.notes_delete_the_view_linked_to_form, {
        view_name: viewList[tabIndex].name,
      });
    }

    if (mirrorList?.length > 0) {
      content = t(Strings.notes_delete_the_view_linked_to_mirror, {
        view_name: viewList[tabIndex].name,
      });
    }

    Modal.confirm({
      title: t(Strings.delete_view),
      content: content,
      onOk: () => {
        confirmDelete(viewList[tabIndex].id);
      },
      type: 'danger',
    });
  };

  const contextMenuList = [
    [
      {
        text: t(Strings.rename_view),
        onClick: handleRenameItem,
        hidden: !permissions.viewRenamable,
        'data-sensors-click': true,
        id: DATASHEET_ID.VIEW_OPERATION_ITEM_RENAME,
      },
    ],
    [
      {
        icon: <AutosaveOutlined />,
        text: t(Strings.auto_save_view_property) + ' ',
        shortcutKey: <Switch size={'small'} />,
        onClick: () => { confirmViewAutoSave(false, activeNodeId!, activeViewId!, shareId); },
        hidden: Boolean(view?.autoSave) || !spaceManualSaveViewIsOpen || !viewSyncManageable,
        'data-sensors-click': true,
        id: DATASHEET_ID.VIEW_OPERATION_ITEM_CHANGE_AUTO_SAVE,
      },
      {
        icon: <AutosaveOutlined />,
        text: t(Strings.auto_save_view_property),
        shortcutKey: <Switch size={'small'} checked />,
        onClick: () => { confirmViewAutoSave(true, activeNodeId!, activeViewId!, shareId); },
        hidden: !view?.autoSave || !spaceManualSaveViewIsOpen || !viewSyncManageable,
        'data-sensors-click': true,
        id: DATASHEET_ID.VIEW_OPERATION_ITEM_CHANGE_AUTO_SAVE_CHECK,
      }
    ],
    [
      {
        text: t(Strings.delete_view),
        onClick: handleForDeleteView,
        hidden: !permissions.viewRemovable,
        'data-sensors-click': true,
        id: DATASHEET_ID.VIEW_OPERATION_ITEM_DELETE,
        disabled: (arg: any) => {
          const { props: { tabIndex }} = arg;
          const view = viewList[tabIndex];
          setShowDeleteTip(Boolean(view.lockInfo));
          return Boolean(view.lockInfo);
        },
        disabledTip: showDeleteTip ? t(Strings.view_has_locked_not_deletes) : undefined
      },
    ],
  ];

  if (viewList.length === 1) {
    contextMenuList.pop();
  }

  const contextMenuData = flatContextData(contextMenuList);

  return (
    <ContextMenuList contextMenu={contextMenu} overlay={contextMenuData} />
  );
};
