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

import { Events, IReduxState, NAV_ID, Player, Strings, t } from '@apitable/core';
import { WorkbenchOutlined } from '@apitable/icons';
import { useToggle } from 'ahooks';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Tooltip } from 'pc/components/common';
// @ts-ignore
import { isSocialWecom } from 'enterprise';
import { useResponsive } from 'pc/hooks';
import { isHiddenIntercom } from 'pc/utils/env';
import * as React from 'react';
import { FC, useEffect, useRef, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { ScreenSize } from '../common/component_display';
import { NavigationContext } from './navigation_context';
import styles from './style.module.less';
import { UpgradeBtn } from './upgrade_btn';
import { useIntercom } from 'react-use-intercom';
enum NavKey {
  SpaceManagement = 'management',
  Org = 'org',
  Workbench = 'workbench',
  Template = 'template',
}

export const Navigation: FC<React.PropsWithChildren<unknown>> = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [notice, { set: setNotice }] = useToggle(false);
  const { user, space } = useSelector(
    (state: IReduxState) => ({
      user: state.user.info,
      space: state.space.curSpaceInfo,
      unReadCount: state.notification.unReadCount,
      newNoticeListFromWs: state.notification.newNoticeListFromWs,
      spaceInfo: state.space.curSpaceInfo,
    }),
    shallowEqual,
  );
  // const location = useLocation();
  const router = useRouter();
  const search = location.search;
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const [clickCount, setClickCount] = useState(0);
  const { update: updateIntercom } = useIntercom();
  // Check if there is a system banner notification to be displayed

  const lastTime = useRef(Date.now());

  const throttleClickCount = () => {
    const now = Date.now();
    if (now - lastTime.current < 1000) {
      setClickCount(clickCount + 1);
    }
    lastTime.current = now;
  };

  const hiddenUserMenu = () => {
    throttleClickCount();
    showUserMenu && setShowUserMenu(false);
    notice && setNotice(false);
    showHelpCenter && setShowHelpCenter(false);
  };

  const navList = Player.applyFilters(Events.get_nav_list, [
    {
      routeAddress: '/workbench' + search,
      icon: WorkbenchOutlined,
      text: t(Strings.nav_workbench),
      key: NavKey.Workbench,
      domId: NAV_ID.ICON_WORKBENCH,
    },
  ]);

  useEffect(() => {
    if(!isHiddenIntercom() || isMobile) {
      return;
    }
    updateIntercom({ hideDefaultLauncher: !router.pathname.includes('workbench') });
  }, [router.pathname, isMobile, updateIntercom]);

  const templateActive = window.location.pathname.includes('template');

  const isWecomSpace = isSocialWecom?.(space);

  const handleClickUpgradeBtn = () => {
    // Dingtalk: Click the upgrade button on the left side.
    // Upgrade pop-up window pops up (different pop-up components used for mobile and PC).
    // Click on the pop-up to jump to the app details page (let the user go to pay)
  };

  if (!user) {
    return <></>;
  }
  return (
    <NavigationContext.Provider value={
      {
        openCreateSpaceModal: () => {console.log(666);
        },
      }
    }>
      <div className={classNames(styles.navigation, templateActive && styles.templateActived, notice && styles.noticeOpend)}>
        <div className={styles.navWrapper} onClick={hiddenUserMenu}>
          {navList.map((item: any) => {
            let NavIcon = item.icon;
            if (typeof item.icon === 'string') {
              NavIcon = WorkbenchOutlined;
            }
            const isActive = router.pathname.split('/')[1] === item.key;
            const NavItem = (): React.ReactElement => (
              <Link href={item.routeAddress}>
                <a
                  id={item.domId}
                  className={classNames(styles.navItem, {
                    [styles.navActiveItem]: isActive,
                    [styles.templateActiveItem]: router.pathname.includes('template') && item.routeAddress.includes('template'),
                  })}
                >
                  <NavIcon className={styles.navIcon} />
                </a>
                {/* {item.icon} */}
              </Link>
            );

            return (
              <div key={item.key}>
                <Tooltip title={item.text} placement="right">
                  <span>{NavItem()}</span>
                </Tooltip>
              </div>
            );
          })}
          {(isWecomSpace) && <UpgradeBtn onClick={() => handleClickUpgradeBtn()} />}
        </div>
      </div>
    </NavigationContext.Provider>
  );
};
