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

import { Events, IReduxState, Player } from '@apitable/core';
import { useMount } from 'ahooks';
import * as React from 'react';
import { FC } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { DashboardPanel } from '../dashboard_panel';
import { DataSheetPane } from '../datasheet_pane';
import { FormPanel } from '../form_panel';
import { NoPermission } from '../no_permission';
import DemoHome from '../test_page/demo_home/demo_home';
import { Welcome } from '../workspace/welcome';

const WorkspaceRoute: FC<React.PropsWithChildren<unknown>> = () => {
  const activeNodeError = useSelector(state => state.catalogTree.activeNodeError);
  
  const { datasheetId, formId, dashboardId } = useSelector((state: IReduxState) => {
    console.log('statexxxxxxxxxx', state);
    return {
      datasheetId: state.pageParams.datasheetId,
      folderId: state.pageParams.folderId,
      formId: state.pageParams.formId,
      dashboardId: state.pageParams.dashboardId,
      mirrorId: state.pageParams.mirrorId,
    };
  }, shallowEqual);

  useMount(() => {
    Player.doTrigger(Events.questionnaire_shown_after_sign);
    Player.doTrigger(Events.questionnaire_shown);
  });

  const MainComponent = (): React.ReactElement => {
    if (activeNodeError) {
      return <NoPermission />;
    }
    if (formId) {
      return <FormPanel />;
    }
    if (datasheetId) {
      // return <DataSheetPane />;
      return <DemoHome />;
    }
    if (dashboardId) {
      return <DashboardPanel />;
    }
    return <Welcome />;
  };

  return MainComponent();
};
export default WorkspaceRoute;
