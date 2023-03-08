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

import { Skeleton, ThemeProvider, Typography, useThemeColors } from '@apitable/components';
import { IWidgetPackage, Selectors, Strings, t, WidgetApi, WidgetReleaseType } from '@apitable/core';
import { TransferOutlined, UnpublishOutlined } from '@apitable/icons';
import classNames from 'classnames';
import { Message } from 'pc/components/common';
import { Modal } from 'pc/components/common/modal/modal/modal';
import { InstallPosition } from 'pc/components/widget/widget_center/enum';
import { WidgetPackageList } from 'pc/components/widget/widget_center/widget_package_list';
import { useRequest } from 'pc/hooks';
import { store } from 'pc/store';
import * as React from 'react';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';

import { ContextMenu, IContextMenuMethods } from './context_menu';
import styles from './style.module.less';

interface IWidgetCenterModalProps {
  onModalClose(installedWidgetId?: string): void;
  installPosition: InstallPosition;
}

export const WidgetCenterModal: React.FC<React.PropsWithChildren<IWidgetCenterModalProps>> = (props) => {
  const colors = useThemeColors();
  const { onModalClose, installPosition } = props;
  const [tabActiveKey] = useState<WidgetReleaseType>(WidgetReleaseType.Global);
  const [loading, setLoading] = useState<boolean>();
  const { run: unpublishWidget } = useRequest(WidgetApi.unpublishWidget, { manual: true });
  const curOperationProps = useRef<any>();
  const contextMenuRef = useRef<IContextMenuMethods>(null);
  const [, setSelectMemberModal] = useState(false);
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
  const needPlaceholder = (packageListMap?.[WidgetReleaseType.Global]?.length ?? 0) % 2 !== 0;

  useEffect(() => {
    fetchPackageList(tabActiveKey);
  }, [tabActiveKey, fetchPackageList]);

  const Title = () => {
    return <div className={styles.modalHeader}>
      <Typography variant={'h4'} component={'span'} ellipsis style={{ marginRight: '4px' }}>部件库（插件中心）</Typography>
    </div>;
  };

  const menuData = [
    {
      icon: <TransferOutlined color={colors.thirdLevelText} />,
      name: t(Strings.widget_center_menu_transfer),
      onClick: (props: any) => {
        curOperationProps.current = props;
        setSelectMemberModal(true);
      },
    },
    {
      icon: <UnpublishOutlined color={colors.thirdLevelText} />,
      name: t(Strings.widget_center_menu_unpublish),
      onClick: (props: any) => {
        curOperationProps.current = props;
        Modal.confirm({
          type: 'danger',
          title: t(Strings.warning),
          content: t(Strings.widget_unpublish_modal_content),
          onOk: () => unpublishWidget(props.widgetPackageId).then(() => {
            fetchPackageList(WidgetReleaseType.Space, true);
            Message.success({ content: `${t(Strings.widget_center_menu_unpublish)}${t(Strings.success)}` });
          }),
        });
      },
    },
  ];

  const showMenu = useCallback((e: React.MouseEvent, props: any) => {
    contextMenuRef && contextMenuRef.current?.show(e, props);
    e.nativeEvent.stopImmediatePropagation();
  }, []);

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
          </div> : <WidgetPackageList
            needPlaceholder={needPlaceholder}
            installPosition={installPosition}
            data={packageListMap[WidgetReleaseType.Global] ?? []}
            onModalClose={onModalClose}
            showMenu={showMenu}
          />
        }
      </Scrollbars>
    </div>
    <ContextMenu ref={contextMenuRef} menuData={menuData} />
  </Modal>;
};

const WidgetCenterModalWithTheme: React.FC<React.PropsWithChildren<IWidgetCenterModalProps>> = (props) => {
  const cacheTheme = useSelector(Selectors.getTheme);
  return (
    <ThemeProvider theme={cacheTheme}>
      <WidgetCenterModal
        {...props}
      />
    </ThemeProvider>
  );
};

export const expandWidgetCenter = (
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
      <WidgetCenterModalWithTheme
        onModalClose={onModalClose}
        installPosition={installPosition}
      />
    </Provider>
  ));
};

