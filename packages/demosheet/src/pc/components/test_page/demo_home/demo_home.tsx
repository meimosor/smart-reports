import { Events, Player, PREVIEW_DATASHEET_ID, Selectors, StoreActions } from '@apitable/core';
import { useMountWidgetPanelShortKeys } from 'pc/components/widget/hooks';
import { useAppDispatch } from 'pc/hooks/use_app_dispatch';
import React from 'react';
import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { DemoWidgetPanel } from '../demo_widget_panel/demo_widget_panel';
import styles from './style.module.less';

export enum InstallPosition {
  WidgetPanel,
  Dashboard
}

const DataSheetPaneBase: FC<React.PropsWithChildren<{ panelLeft?: JSX.Element }>> = () => {
  const loading = useSelector(state => {
    const datasheet = Selectors.getDatasheet(state);
    return Boolean(!datasheet || datasheet.isPartOfData || datasheet.sourceId);
  });
  const activeDatasheetId = useSelector(Selectors.getActiveDatasheetId);
  const dispatch = useAppDispatch();

  useMountWidgetPanelShortKeys();

  useEffect(() => {
    dispatch(StoreActions.resetDatasheet(PREVIEW_DATASHEET_ID));
  }, [activeDatasheetId, dispatch]);

  useEffect(() => {
    if (loading) {
      return;
    }
    Player.doTrigger(Events.datasheet_shown);
  }, [loading]);

  return (
    <div className={styles.widgetPanelRight}>
      <div style={{ width: '100%', height: '100%' }}>
        <DemoWidgetPanel />
      </div>
    </div>
  );
};

export const DemoHome = React.memo(DataSheetPaneBase);
