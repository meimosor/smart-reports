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

import { useContextMenu } from '@apitable/components';
import {
  ConfigConstant, IReduxState, IRightClickInfo, Selectors, shallowEqual, StoreActions, Strings, t,
} from '@apitable/core';
import { ShortcutActionManager, ShortcutActionName } from 'modules/shared/shortcut_key';
import { Modal } from 'pc/components/common';
import { SearchPanel, SubColumnType } from 'pc/components/datasheet_search_panel';
import { ShareModal as FormShare } from 'pc/components/form_panel/form_tab/tool_bar/share_modal';
import { useCatalogTreeRequest, useRequest, useSearchPanel } from 'pc/hooks';
import { useAppDispatch } from 'pc/hooks/use_app_dispatch';
import * as React from 'react';
import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './style.module.less';
import { WorkbenchSideContext } from './workbench_side_context';

export interface IDatasheetPanelInfo {
  folderId: string;
  datasheetId?: string;
}

export const WorkbenchSide: FC<React.PropsWithChildren<unknown>> = () => {
  const [rightClickInfo, setRightClickInfo] = useState<IRightClickInfo | null>(null);
  const { onSetContextMenu } = useContextMenu();
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const { panelVisible, panelInfo, onChange, setPanelVisible } = useSearchPanel();
  const {
    treeNodesMap,
    rootId,
    activeNodeId,
    shareModalNodeId,
    loading,
    err } = useSelector((state: IReduxState) => {
    return {
      spaceId: state.space.activeId,
      treeNodesMap: state.catalogTree.treeNodesMap,
      rootId: state.catalogTree.rootId,
      activeNodeId: Selectors.getNodeId(state),
      permissionModalNodeId: state.catalogTree.permissionModalNodeId,
      shareModalNodeId: state.catalogTree.shareModalNodeId,
      saveAsTemplateModalNodeId: state.catalogTree.saveAsTemplateModalNodeId,
      importModalNodeId: state.catalogTree.importModalNodeId,
      loading: state.catalogTree.loading,
      err: state.catalogTree.err,
      moveToNodeIds: state.catalogTree.moveToNodeIds
    };
  }, shallowEqual);

  const isFormShare = /fom\w+/.test(shareModalNodeId);
  const activedNodeId = useSelector(state => Selectors.getNodeId(state));
  const { getPositionNodeReq } = useCatalogTreeRequest();
  const { run: getPositionNode } = useRequest(getPositionNodeReq, {
    manual: true,
  });
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    const eventBundle = new Map([
      [
        ShortcutActionName.Permission,
        () => {
          activeNodeId && treeNodesMap[activeNodeId] && dispatch(StoreActions.updatePermissionModalNodeId(activeNodeId));
        },
      ],
    ]);

    eventBundle.forEach((cb, key) => {
      ShortcutActionManager.bind(key, cb);
    });

    return () => {
      eventBundle.forEach((_cb, key) => {
        ShortcutActionManager.unbind(key);
      });
    };
  });

  useEffect(() => {
    const handleClose = () => {
      dispatch(StoreActions.setErr(''));
    };
    if (err) {
      Modal.error({
        title: t(Strings.kindly_reminder),
        content: err,
        okText: t(Strings.refresh_manually),
        onCancel: handleClose,
        onOk: handleClose,
      });
    }
    // eslint-disable-next-line
  }, [err, dispatch]);

  useEffect(() => {
    if (!activeNodeId || !rootId) {
      return;
    }
    const activeNode = treeNodesMap[activeNodeId];
    if (activeNode && treeNodesMap[activeNode.parentId]) {
      const parentNodeId = activeNode.parentId;
      if (treeNodesMap[parentNodeId]?.children.length) {
        dispatch(StoreActions.collectionNodeAndExpand(activeNodeId));
        return;
      }
    }
    getPositionNode(activeNodeId);
    // eslint-disable-next-line
  }, [activeNodeId, rootId]);

  useEffect(() => {
    const defaultActiveKeyString = localStorage.getItem('vika_workbench_active_key');
    const defaultActiveKey = defaultActiveKeyString ? JSON.parse(defaultActiveKeyString) : [ConfigConstant.Modules.CATALOG];
    setActiveKey(defaultActiveKey);
  }, [activeKey]);

  useEffect(() => {
    if (activedNodeId && !treeNodesMap[activedNodeId] && !loading) {
      dispatch(StoreActions.getNodeInfo(activedNodeId));
    }
    // eslint-disable-next-line
  }, [loading, activeNodeId]);

  const providerValue = useMemo(
    () => ({
      rightClickInfo,
      setRightClickInfo,
      onSetContextMenu,
      // eslint-disable-next-line
    }),
    [rightClickInfo, onSetContextMenu],
  );

  return (
    <WorkbenchSideContext.Provider value={providerValue}>
      <div className={styles.workbenchSide}>
        {panelVisible && (
          <SearchPanel
            folderId={panelInfo!.folderId}
            subColumnType={SubColumnType.View}
            activeDatasheetId={panelInfo?.datasheetId || ''}
            setSearchPanelVisible={setPanelVisible}
            onChange={onChange}
          />
        )}
        {isFormShare && (
          <FormShare
            formId={shareModalNodeId}
            visible={Boolean(shareModalNodeId)}
            onClose={() => dispatch(StoreActions.updateShareModalNodeId(''))}
          />
        )}
      </div>
    </WorkbenchSideContext.Provider>
  );
};
