import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import styles from './Welcome.less';
import S_Terminal from '@/pages/S_Terminal';
import S_Top from '@/pages/S_Top';
import S_Disk from "@/pages/S_Disk";

const CodePreview = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

const Welcome = () => {
  const intl = useIntl();
  return (
    <PageContainer>
      <Card>
        {/*<Alert*/}
        {/*  message={intl.formatMessage({*/}
        {/*    id: 'pages.welcome.alertMessage',*/}
        {/*    defaultMessage: 'Faster and stronger heavy-duty components have been released.',*/}
        {/*  })}*/}
        {/*  type="success"*/}
        {/*  showIcon*/}
        {/*  banner*/}
        {/*  style={{*/}
        {/*    margin: -12,*/}
        {/*    marginBottom: 24,*/}
        {/*  }}*/}
        {/*/>*/}
        {/*<Typography.Text strong>*/}
        {/*  <FormattedMessage id="pages.welcome.advancedComponent" defaultMessage="Advanced Form" />{' '}*/}
        {/*  <a*/}
        {/*    href="https://procomponents.ant.design/components/table"*/}
        {/*    rel="noopener noreferrer"*/}
        {/*    target="__blank"*/}
        {/*  >*/}
        {/*    <FormattedMessage id="pages.welcome.link" defaultMessage="Welcome" />*/}
        {/*  </a>*/}
        {/*</Typography.Text>*/}
        {/*<CodePreview>yarn add @ant-design/pro-table</CodePreview>*/}
        {/*<Typography.Text*/}
        {/*  strong*/}
        {/*  style={{*/}
        {/*    marginBottom: 12,*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <FormattedMessage id="pages.welcome.advancedLayout" defaultMessage="Advanced layout" />{' '}*/}
        {/*  <a*/}
        {/*    href="https://procomponents.ant.design/components/layout"*/}
        {/*    rel="noopener noreferrer"*/}
        {/*    target="__blank"*/}
        {/*  >*/}
        {/*    <FormattedMessage id="pages.welcome.link" defaultMessage="Welcome" />*/}
        {/*  </a>*/}
        {/*</Typography.Text>*/}
        {/*<CodePreview>yarn add @ant-design/pro-layout</CodePreview>*/}
        <S_Terminal ></S_Terminal>
        <S_Top></S_Top>
        <S_Disk></S_Disk>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
