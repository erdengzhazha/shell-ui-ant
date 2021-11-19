// Top 图
import React from 'react';
import '../../assets/S_Top/css/common.css';
// -----------  stomp start -------------
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
// -----------  stomp end -------------

export default class S_Top extends React.Component {
  constructor(props) {
    super(props);
    this.host = '47.96.11.161'; // shell主机地址
    this.port = '22'; // shell端口号默认22
    this.password = 'Ovopark#2020'; // shell 密码
    this.username = 'root'; //shell登录人
    this.logingUserName = 'XiuEr'; // 当前网页登录人
    this.token = '8c21576b52b845478b4bd159ee217b75' + new Date().getTime().toString();
    localStorage.setItem('shell_token', this.token);
    this.SOCKET_ENDPOINT = 'http://localhost:28849/mydlq?authenticator=' + this.token; // 这边的地址不可以填写域名,请填写ip
    this.SUBSCRIBE_PREFIX = '/user/topic';
    this.SUBSCRIBE = '/user/topic';
    this.SEND_ENDPOINT = '/app/test';
    this.temporaryUser = '';
    this.newTabIndex = 0;
    // STOMP 相关参数
    this.stompHeaders = {
      host: this.host,
      login: this.username,
      passcode: this.password,
      authenticator: this.token,
    };
    this.state = {
      visible: false,
      settingVisible: false,
      terminalHeight: 100,
      fileList: [], // 文件浏览列表
      activeKey: '1',
      color: '#000',
      bgColor: '推荐皮肤',
      isColor: true,
      panes: [
        {
          title: this.host,
          content: this.password,
          key: '1',
        },
      ],
      isFile: false,
      flag: 'bg',
      // 皮肤
      skin: '#000',
      // 列表
      skinList: [
        {
          name: '红',
          color: 'red',
          id: 1,
        },
        {
          name: '蓝',
          color: 'blue',
          id: 2,
        },
        {
          name: '绿',
          color: 'green',
          id: 3,
        },
        {
          name: '黑',
          color: '#000',
          id: 4,
        },
        {
          name: '紫',
          color: 'pink',
          id: 5,
        },
      ],
      text: [''],
      text2: ['1', '2', '3'],
    };
  }

  componentDidMount() {
    // 3. 创建 STOMP 对象
    let sock = new SockJS(this.SOCKET_ENDPOINT);
    // 4. 配置 STOMP 客户端
    let stompClient = Stomp.over(sock);

    // 5. STOPM连接 与 SSH服务端建立连接
    stompClient.connect(
      this.stompHeaders,
      (frame) => {
        // 成功连接
        // 连接成功时（服务器响应 CONNECTED 帧）的回调方法
        let temporaryUser = frame.headers['user-name'];
        console.log('【已连接】获取临时身份 --- > ' + temporaryUser);
        this.setState({
          temporaryUser: temporaryUser,
        });
        console.log(this.SUBSCRIBE_PREFIX);
        // 订阅消息
        let a = [];
        let i = 0;
        const subscribe = stompClient.subscribe(this.SUBSCRIBE_PREFIX, (response) => {
          console.log('订阅成功! 返回值 = ' + response.body);
          if (!(response.body == '')) {
            a[i++] = response.body;
          }
          this.setState({
            text: a,
          });
          try {
            if (response.body !== 'cd ~ && script -q -a') {
              console.log('true');
            }
          } catch (e) {
            console.log('特殊字符解码失败!', e);
          }
        });
        // 退订的方法
        setTimeout(() => {
          // 发送shell 录制的命令
          stompClient.send(
            this.SEND_ENDPOINT,
            { authenticator: this.token },
            'cd ~ && script -q -a',
          ); // 发送录制
        }, 1000);
        setTimeout(() => {
          stompClient.send(this.SEND_ENDPOINT, { authenticator: this.token }, '\r'); // 回车
        }, 1500);
        setTimeout(() => {
          stompClient.send(this.SEND_ENDPOINT, { authenticator: this.token }, 'top \r'); // 发送Top
        }, 2000);
      },
      (error) => {
        console.error('连接错误!');
      },
    );
  }

  render() {
    return (
      // <tbody>
      //   <table
      //     border={"1px solid black"}
      //     // className={"S_Top_container"}
      //     // style={{borderCollapse:"collapse" ,border:}}
      //   >
      //     <tr>
      //       <td>内存</td>
      //       <td>CPU</td>
      //       <td>命令</td>
      //     </tr>
      //     <tr>
      //       <td>1</td>
      //       <td>2</td>
      //       <td>3</td>
      //     </tr>
      //   </table>
      // </tbody>

      <ul>
        <h2>打印第二</h2>
        {this.state.text[2]}
        <h2>打印第二结束</h2>
        {this.state.text.map((item, index) => (
          <div key={index}>
            <li>{item}</li>
            <hr />
          </div>
        ))}
      </ul>
    );
  }
}
