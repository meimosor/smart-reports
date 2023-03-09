import { Skeleton, ThemeProvider, Typography } from '@apitable/components';
import { IWidgetPackage, Selectors, WidgetApi, WidgetReleaseType } from '@apitable/core';
import classNames from 'classnames';
import { Modal } from 'pc/components/common/modal/modal/modal';
import { InstallPosition } from 'pc/components/widget/widget_center/enum';
import { WidgetPanel } from 'pc/components/widget/widget_panel';
import { store } from 'pc/store';
import * as React from 'react';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';

import styles from '../style.module.less';

interface IWidgetCenterModalProps {
  onModalClose(installedWidgetId?: string): void;
  installPosition: InstallPosition;
}

export const FormWidgetModal: React.FC<React.PropsWithChildren<IWidgetCenterModalProps>> = (props) => {
  const { onModalClose } = props;
  const [tabActiveKey] = useState<WidgetReleaseType>(WidgetReleaseType.Global);
  const [loading, setLoading] = useState<boolean>();
  const listStatus = useRef<WidgetReleaseType[]>([]);
  const [packageListMap, setPackageListMap] = useState<{ [key in WidgetReleaseType]?: IWidgetPackage[] }>({});
  const fetchPackageList = useCallback(async(type: WidgetReleaseType = WidgetReleaseType.Global, refresh?: boolean) => {
    if (!refresh && packageListMap?.[type]) {
      return;
    }
    setLoading(true);
    const res = await WidgetApi.getWidgetCenterList(type);
    setLoading(false);
    const { data, success } = res.data;
    if (success) {
      setPackageListMap({ ...packageListMap, [type]: data });
    }
    listStatus.current = [...listStatus.current, type];
  }, [packageListMap]);

  useEffect(() => {
    fetchPackageList(tabActiveKey);
  }, [tabActiveKey, fetchPackageList]);

  const Title = () => {
    return <div className={styles.modalHeader}>
      <Typography variant={'h4'} component={'span'} ellipsis style={{ marginRight: '4px' }}>部件库（插件中心）</Typography>
    </div>;
  };

  const renderThumb = ({ style, ...props }: {
    style: CSSProperties
  }) => {
    const thumbStyle = {
      right: 4,
      borderRadius: 'inherit',
      backgroundColor: 'rgba(0,0,0,0.2)',
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };
  return <Modal
    title={<Title />}
    className={classNames(
      styles.widgetCenterWrap,
    )}
    visible
    width={'896px'}
    footer={null}
    destroyOnClose
    bodyStyle={{ padding: 10 }}
    onCancel={() => onModalClose()}
    centered
  >
    <div className={styles.widgetCenterModal}>
      <Scrollbars renderThumbVertical={renderThumb} style={{ width: '100%', height: '100%' }}>
        {
          loading ? <div className={styles.skeletonWrap}>
            <Skeleton count={1} width='38%' />
            <Skeleton count={2} />
            <Skeleton count={1} width='61%' />
          </div> : <WidgetPanel />
        }
      </Scrollbars>
    </div>
  </Modal>;
};

const FormWidgetModalWithTheme: React.FC<React.PropsWithChildren<IWidgetCenterModalProps>> = (props) => {
  const cacheTheme = useSelector(Selectors.getTheme);
  return (
    <ThemeProvider theme={cacheTheme}>
      <FormWidgetModal
        {...props}
      />
    </ThemeProvider>
  );
};

export const expandFormWidgetList = (
  installPosition: InstallPosition,
  option: {
    closeModalCb?(): void;
    installedWidgetHandle?(widgetId: string): void
  } = {},
) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const { closeModalCb, installedWidgetHandle } = option;
  const root = createRoot(container);
  const onModalClose = (installedWidgetId?: string) => {
    root.unmount();
    container.parentElement!.removeChild(container);
    closeModalCb?.();
    installedWidgetId && installedWidgetHandle && installedWidgetHandle(installedWidgetId);
  };

  root.render((
    <Provider store={store}>
      <FormWidgetModalWithTheme
        onModalClose={onModalClose}
        installPosition={installPosition}
      />
    </Provider>
  ));
};

