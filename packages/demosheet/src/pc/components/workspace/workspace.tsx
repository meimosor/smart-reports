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

import { Api, AutoTestID, ConfigConstant, Events, IReduxState, Navigation, Player, StoreActions } from '@apitable/core';
import { useMount } from 'ahooks';
import classNames from 'classnames';
// @ts-ignore
import { destroyVikaby, showVikaby } from 'enterprise';
import { TriggerCommands } from 'modules/shared/apphook/trigger_commands';
import { ShortcutActionManager, ShortcutActionName } from 'modules/shared/shortcut_key';
import { useRouter } from 'next/router';
import { Router } from 'pc/components/route_manager/router';
import WorkspaceRoute from 'pc/components/route_manager/workspace_route';
import { ISideBarContextProps, SideBarClickType, SideBarContext, SideBarType } from 'pc/context';
import { getPageParams, useCatalogTreeRequest, useQuery, useRequest, useResponsive } from 'pc/hooks';
import { store } from 'pc/store';
import { isHiddenIntercom } from 'pc/utils/env';
import { getStorage, setStorage, StorageMethod, StorageName } from 'pc/utils/storage/storage';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { VikaSplitPanel } from '../common';
import { ComponentDisplay, ScreenSize } from '../common/component_display';
import styles from './style.module.less';

// Restore the user's last opened datasheet.
const resumeUserHistory = (path: string) => {
  const state = store.getState();
  const user = state.user.info!;
  const spaceId = state.space.activeId;
  const { datasheetId, folderId, viewId, recordId, formId, widgetId, mirrorId, dashboardId } = getPageParams(path);
  const nodeId = datasheetId || folderId || formId || mirrorId || dashboardId;
  if (spaceId === user.spaceId) {
    if (mirrorId) {
      Router.replace(Navigation.WORKBENCH, {
        params: {
          spaceId: spaceId || user.spaceId,
          nodeId: mirrorId,
          datasheetId: datasheetId || user.activeNodeId,
          viewId: viewId || user.activeViewId,
          recordId,
          widgetId,
        },
      });
      return;
    }
    Router.replace(Navigation.WORKBENCH, {
      params: {
        spaceId: spaceId || user.spaceId,
        nodeId: nodeId || user.activeNodeId,
        viewId: viewId || user.activeViewId,
        recordId,
        widgetId,
      },
    });
  } else {
    Router.replace(Navigation.WORKBENCH, {
      params: {
        spaceId,
        nodeId,
        viewId,
        recordId,
      },
    });
  }
};

export const Workspace: React.FC<React.PropsWithChildren<unknown>> = () => {
  const dispatch = useDispatch();
  const localSize = getStorage(StorageName.SplitPos);
  const defaultSidePanelSize = localSize && localSize !== 280 ? localSize : 335;
  const editNodeId = useSelector((state: IReduxState) => state.catalogTree.editNodeId);
  const favoriteEditNodeId = useSelector((state: IReduxState) => state.catalogTree.favoriteEditNodeId);
  const shareId = useSelector((state: IReduxState) => state.pageParams.shareId);
  const userSpaceId = useSelector((state: IReduxState) => state.user.info!.spaceId);
  const { getFavoriteNodeListReq, getTreeDataReq } = useCatalogTreeRequest();
  const { run: getFavoriteNodeList } = useRequest(getFavoriteNodeListReq, { manual: true });
  const { run: getTreeData } = useRequest(getTreeDataReq, { manual: true });
  const { screenIsAtMost } = useResponsive();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [templeVisible, setTempleVisible] = useState(false);
  const isMobile = screenIsAtMost(ScreenSize.md);
  const query = useQuery();
  const router = useRouter();

  // Directory tree toggle source status, directory tree click status, sidebar switch.
  const [toggleType, setToggleType] = useState<SideBarType>(SideBarType.None);
  const [clickType, setClickType] = useState<SideBarClickType>(SideBarClickType.None);
  const [panelVisible, setPanelVisible] = useState(false);
  const sideBarVisible = false;

  /**
   * Directory Tree Switch Source - Users.
   */
  const handleSetSideBarByUser = (visible: boolean, panel?: boolean) => {
    // To determine the type of directory tree switch,
    // if the right panel is expanded or the right panel is closed and
    // the user closes the directory tree at the same time,
    // it is considered as a user click operation and the expanded and
    // closed panels should not affect the directory tree state.
    const resToggleType = panel || (!panel && sideBarVisible) ? SideBarType.User : SideBarType.UserWithoutPanel;
    setToggleType(resToggleType);
    // If the right panel is not expanded or if the right panel is expanded and
    // the directory tree is also expanded,
    // set the click type of the directory tree switch to be considered a user action.
    if (!panel || (panel && sideBarVisible)) {
      setClickType(SideBarClickType.User);
    }
    setStorage(StorageName.IsPanelClosed, visible, StorageMethod.Set);
    dispatch(StoreActions.setSideBarVisible(visible));
  };

  /**
   * Directory Tree Switch Source - Panel.
   */
  const handleSetSideBarByOther = (visible: boolean) => {
    setStorage(StorageName.IsPanelClosed, visible, StorageMethod.Set);
    dispatch(StoreActions.setSideBarVisible(visible));
  };

  useMount(() => {
    resumeUserHistory(router.asPath);
    dispatch(StoreActions.setTreeLoading(true));
    Player.doTrigger(Events.workbench_shown);
  });

  useMount(() => {
    const notifyId = query.get('notifyId');
    if (notifyId) {
      // From a notification, then mark the notification as read.
      Api.transferNoticeToRead([notifyId]);
    }
  });

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [sideBarVisible]);

  useEffect(() => {
    if (isMobile || shareId || isHiddenIntercom()) {
      destroyVikaby?.();
      return;
    }

    const isVikabyClosed = Boolean(localStorage.getItem('vikaby_closed'));
    !isVikabyClosed && showVikaby?.();
    return () => {
      destroyVikaby?.();
    };
  }, [isMobile, shareId]);

  // Binding/unbinding shortcut keys.
  useEffect(() => {
    const eventBundle = new Map([
      [
        ShortcutActionName.ToggleCatalogPanel,
        () => {
          handleSetSideBarByUser(!sideBarVisible, panelVisible);
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
    if (userSpaceId) {
      dispatch(StoreActions.initCatalogTree());
      getTreeData();
      getFavoriteNodeList();
    }
    // eslint-disable-next-line
  }, [userSpaceId, dispatch]);

  const changeSplitPane = (size: number) => {
    window.dispatchEvent(new Event('resize'));
    setStorage(StorageName.SplitPos, size, StorageMethod.Set);
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (favoriteEditNodeId || editNodeId || !templeVisible || (templeVisible && e.clientX < defaultSidePanelSize)) {
        return;
      }
      if (menuRef.current && menuRef.current.contains(e.target as HTMLElement)) {
        return;
      }
      setTempleVisible(false);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [templeVisible, defaultSidePanelSize, menuRef, editNodeId, favoriteEditNodeId]);

  useMount(async() => {
    const wizardId = ConfigConstant.WizardIdConstant.AGREE_TERMS_OF_SERVICE;
    await TriggerCommands.set_wizard_completed?.({
      wizardId,
    });
    localStorage.removeItem(`${wizardId}`);
  });

  const children = <WorkspaceRoute />;
  const sideContextValue: ISideBarContextProps = {
    toggleType,
    clickType,
    onSetClickType: setClickType,
    onSetToggleType: setToggleType,
    onSetPanelVisible: setPanelVisible,
    onSetSideBarVisibleByUser: handleSetSideBarByUser,
    onSetSideBarVisibleByOhter: handleSetSideBarByOther,
  };

  return (
    <div
      id={AutoTestID.WORKBENCH_PAGE}
      className={classNames({
        [styles.dataspace]: true,
        [styles.hiddenCatalog]: !sideBarVisible && !isMobile,
      })}
    >
      <ComponentDisplay minWidthCompatible={ScreenSize.md}>
        <SideBarContext.Provider value={sideContextValue}>
          {/* TODO: `SplitPane` directly set `pane1Style` add animation will lead to the problem
           that can not be dragged, the next version to solve. 0.4 temporarily do not add animation */}
          <VikaSplitPanel
            panelLeft={
              <div style={{ width: sideBarVisible ? 0 : 0 }} className={styles.splitLeft} data-test-id='workspace-sidebar' />
            }
            panelRight={<div className={styles.splitRight}>{children}</div>}
            split='vertical'
            minSize={335}
            defaultSize={0}
            maxSize={640}
            style={{ overflow: 'none' }}
            pane2Style={{ overflow: 'hidden' }}
            size={!sideBarVisible ? 0 : defaultSidePanelSize}
            onChange={changeSplitPane}
            allowResize={sideBarVisible}
          />
        </SideBarContext.Provider>
      </ComponentDisplay>

      <ComponentDisplay maxWidthCompatible={ScreenSize.md}>
        <div className={styles.splitRight} style={{ flexDirection: 'column' }}>
          {children}
        </div>
      </ComponentDisplay>
    </div>
  );
};
