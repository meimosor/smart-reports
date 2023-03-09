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

import { Button, useThemeColors } from '@apitable/components';
import { ResourceType, Selectors } from '@apitable/core';
import { WorkbenchOutlined } from '@apitable/icons';
import { ShortcutActionManager, ShortcutActionName } from 'modules/shared/shortcut_key';
import { SideBarClickType, useSideBar } from 'pc/context';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import styles from './style.module.less';
import { WidgetPanel } from '../../widget';
export enum InstallPosition {
  WidgetPanel,
  Dashboard
}
const DemoHome: FC<React.PropsWithChildren<unknown>> = () => {
  const colors = useThemeColors();
  const { onSetClickType } = useSideBar();
  
  const isWidgetPanel = useSelector(state => {

    const datasheet = Selectors.getDatasheet(state);
    console.log('datasheet', datasheet);

    const { datasheetId } = state.pageParams;
    const resourceType = ResourceType.Datasheet;
    const resourceId = datasheetId || '';

    console.log('++++++++++++++++++++++++state+++++++++++++++++++++++');
    console.log(state, resourceId, resourceType);
    console.log('++++++++++++++++++++++++state+++++++++++++++++++++++');
    
    return Selectors.getResourceWidgetPanelStatus(state, resourceId, resourceType)?.opening;
  });

  const widgetCount = useSelector(state => {
    const { datasheetId } = state.pageParams;
    const resourceId = datasheetId;
    const resourceType = ResourceType.Datasheet;

    if (!resourceId) {
      return 0;
    }

    const widgetPanel = Selectors.getResourceWidgetPanels(state, resourceId, resourceType);
    if (!widgetPanel) {
      return 0;
    }

    return widgetPanel.reduce((total, item) => total + item.widgets.length, 0);
  });

  // Mutually exclusive with the right-hand area.
  const handleToggleRightBar = async(toggleKey: ShortcutActionName) => {
    // Close sidebar.
    console.log('共同多少个组件？：：：', widgetCount);
      
    const panelMap = {
      [ShortcutActionName.ToggleWidgetPanel]: isWidgetPanel,
    };
    for (const key in panelMap) {
      if (panelMap[key] && key !== toggleKey) {
        await ShortcutActionManager.trigger(key as ShortcutActionName);
      }
    }
  
    onSetClickType && onSetClickType(SideBarClickType.ToolBar);
    await ShortcutActionManager.trigger(toggleKey);
  };

  return (
    <div className={styles.noMatch}>
      <div className={styles.wrapper}>
        <div style={{ width: 140 }}>
          <Button
            variant='fill'
            color='primary'
            prefixIcon={<WorkbenchOutlined size={15} color={colors.black[50]} />}
            onClick={() => handleToggleRightBar(ShortcutActionName.ToggleWidgetPanel)}
            block
          >
            设计图表
          </Button>
          <div style={{ width: '100%', height: '100%' }}>
            <WidgetPanel />
            {/* {isRobotPanelOpen && <RobotPanel />} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoHome;
