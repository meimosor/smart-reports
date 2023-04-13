import { Button, IconButton, Skeleton, ThemeName } from '@apitable/components';
import { Events, IWidgetPanelStatus, Player, ResourceType, Selectors, Strings, t } from '@apitable/core';
import { AddOutlined, CloseOutlined } from '@apitable/icons';
import { useMount } from 'ahooks';
import { ShortcutActionManager, ShortcutActionName } from 'modules/shared/shortcut_key';
import Image from 'next/image';
import { ScreenSize } from 'pc/components/common/component_display';
import { InstallPosition } from 'pc/components/widget/widget_center/enum';
import { useResponsive } from 'pc/hooks';
import { shallowEqual, useSelector } from 'react-redux';
import { useManageWidgetMap } from '../hooks';
import { expandWidgetCenter } from '../widget_center/widget_center';
import styles from './style.module.less';
import { WidgetList } from './widget_list';
import { WidgetPanelHeader } from './widget_panel_header';
import WidgetEmptyLight from 'static/icon/datasheet/widget_empty_light.png';
import WidgetEmptyDark from 'static/icon/datasheet/widget_empty_dark.png';

const EmptyPanel = ({ onClosePanel }: { onClosePanel?: () => void | Promise<void> }) => {
  const linkId = useSelector(Selectors.getLinkId);
  const { screenIsAtMost } = useResponsive();
  const isMobile = screenIsAtMost(ScreenSize.md);
  const addNewPanel = () => {
    expandWidgetCenter(InstallPosition.WidgetPanel);
  };
  useMount(() => {
    Player.doTrigger(Events.datasheet_wigdet_empty_panel_shown);
  });
  const themeName = useSelector(state => state.theme);
  const widgetEmpty = themeName === ThemeName.Light ? WidgetEmptyLight : WidgetEmptyDark;
  return (
    <div className={styles.emptyPanel}>
      {onClosePanel && <IconButton onClick={onClosePanel} className={styles.closeIcon} icon={CloseOutlined} />}
      <span className={styles.ikon}>
        <Image src={widgetEmpty} alt="" width={240} height={180} />
      </span>

      <p className={styles.desc}>{t(isMobile ? Strings.is_empty_widget_panel_mobile : Strings.is_empty_widget_panel_pc)}</p>
      {!isMobile && (
        <Button
          size={'middle'}
          color={'primary'}
          className={styles.buttonWrapper}
          prefixIcon={<AddOutlined size={16} color={'white'} />}
          onClick={addNewPanel}
          disabled={Boolean(linkId)}
        >
          {t(Strings.add_widget)}
        </Button>
      )}
      {/* <p className={styles.docTip}>
        <a href={t(Strings.intro_widget)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
          {t(Strings.intro_widget_tips)}
        </a>
      </p> */}
    </div>
  );
};

export const WidgetPanel = () => {
  const { datasheetId } = useSelector(state => state.pageParams);
  const resourceType = ResourceType.Datasheet;
  const resourceId = datasheetId || '';
  const activeWidgetPanel = useSelector(state => {
    return Selectors.getResourceActiveWidgetPanel(state, resourceId, resourceType);
  });
  const netWorking = useSelector(state => Selectors.getResourceNetworking(state, datasheetId!, ResourceType.Datasheet), shallowEqual);
  const isEmptyPanel = !activeWidgetPanel;
  const isEmptyWidget = !(activeWidgetPanel && activeWidgetPanel.widgets.length);
  const { opening: isPanelOpening } = useSelector(state => {
    return Selectors.getResourceWidgetPanelStatus(state, resourceId, resourceType) || ({} as IWidgetPanelStatus);
  });
  const onClosePanel = async() => {
    await ShortcutActionManager.trigger(ShortcutActionName.ToggleWidgetPanel);
  };

  useManageWidgetMap();

  if (!isPanelOpening) {
    return null;
  }

  if (netWorking?.loading) {
    return (
      <div className={styles.skeletonWrapper}>
        <div className={styles.skeletonHeader}>
          <Skeleton width="40px" height="40px" circle />
          <Skeleton height="22px" />
        </div>
        <Skeleton count={2} height="40px" className={styles.skeletonInput} />
      </div>
    );
  }

  return (
    <div className={styles.widgetPanelContainer}>
      {isEmptyPanel ? (
        <EmptyPanel onClosePanel={onClosePanel} />
      ) : (
        <div className={styles.widgetPanel}>
          <WidgetPanelHeader onClosePanel={onClosePanel} />
          {isEmptyWidget ? <EmptyPanel /> : <WidgetList />}
        </div>
      )}
    </div>
  );
};
