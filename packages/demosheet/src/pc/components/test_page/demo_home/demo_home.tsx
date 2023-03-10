import { WidgetPanel } from 'pc/components/widget';
import { FC } from 'react';
import styles from './style.module.less';

export enum InstallPosition {
  WidgetPanel,
  Dashboard
}
const DemoHome: FC<React.PropsWithChildren<unknown>> = () => {
  return (
    <div className={styles.widgetPanelRight}>
      <div style={{ width: '100%', height: '100%' }}>
        <WidgetPanel />
      </div>
    </div>
  );
};

export default DemoHome;
