import React from 'react';
// -----------  stomp start -------------
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
// -----------  stomp end -------------
// -----------  xterm start -------------
import { Terminal } from 'xterm';
// https://github.com/xtermjs/xterm.js/tree/master/addons/xterm-addon-fit
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
// -----------  xterm end -------------
import '../../assets/S_Terminal/css/common.css';

export default class S_Terminal extends React.Component {
  constructor(props) {
    super(props);
    this.host = '47.97.255.245'; // shell主机地址
    this.port = '22'; // shell端口号默认22
    this.password = 'Ovopark#2021'; // shell 密码
    this.username = 'root'; //shell登录人
    this.logingUserName = 'XiuEr'; // 当前网页登录人
    this.token = '8c21576b52b845478b4bd159ee217b75' + new Date().getTime().toString();
    localStorage.setItem('shell_token', this.token);
    this.SOCKET_ENDPOINT = 'http://172.16.3.245:28849/mydlq?authenticator=' + this.token; // 这边的地址不可以填写域名,请填写ip
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
    };
  }
  componentDidMount() {
    // 1. 创建 xterm 对象
    let term = new Terminal({
      // 主题配置
      cursorBlink: true,
      theme: {
        foreground: localStorage.getItem('font'), // 字体
        background: localStorage.getItem('background'), // 背景色
        fontSize: localStorage.getItem('fontSize'),
        cursor: 'help', // 设置光标
        fastScrollModifier: 'ctrl',
      }
    });
    // 3. 创建 STOMP 对象
    const sock = new SockJS(this.SOCKET_ENDPOINT);
    // 4. 配置 STOMP 客户端
    const stompClient = Stomp.over(sock);
    // 5. 可以将终端的尺寸与包含元素相匹配
    const fitPlugin = new FitAddon();
    term.loadAddon(fitPlugin);
    // 6. 打开 Term 窗口
    term.open(document.getElementById('S_terminal'), true);
    fitPlugin.fit();
    // term 调整大小
    term.onResize(({ cols, rows }) => {
      console.log("onResize",cols, rows);
      stompClient.send(this.SEND_ENDPOINT, { authenticator: this.token }, 'stty rows '+rows+" columns "+cols +"\r"); // 回车
    });

    window.onresize = () => {
      const columns = term.cols
      const rows = term.rows
      console.log("发送后端 stty",columns,rows)
      // stompClient.send(this.SEND_ENDPOINT, { authenticator: this.token }, 'stty rows '+rows+" columns "+columns +"\r"); // 回车
      fitPlugin.fit()
    };
    // 5. STOPM连接 与 SSH服务端建立连接
    stompClient.connect(
      this.stompHeaders,
      (frame) => {
        // 成功连接
        // 连接成功时（服务器响应 CONNECTED 帧）的回调方法
        let temporaryUser = frame.headers['user-name'];
        console.log('【已连接】获取临时身份 --- > ' + temporaryUser);
        this.setState(
          {
            temporaryUser: temporaryUser,
          },
          () => {
            // setTimeout(() => {
            //   this.fileListData();
            // }, 1000)
          },
        );
        term.write(
          'WellCome to Avengers ... host : ' +
          this.host +
          ' 😊    🌟  🌟  🌟  明天会更美好! 🌟  🌟  🌟\n \n \r',
        );
        console.log(this.SUBSCRIBE_PREFIX);
        const subscribe = stompClient.subscribe(this.SUBSCRIBE_PREFIX, (response) => {
          console.log('订阅成功! 返回值 = ' + response.body);
          try {
            if (response.body !== 'cd ~ && script -q -a'){
              if(response.body.indexOf("stty")<0){
                term.write(response.body);
              }else{
                term.writeln("The window size has been adjusted to optimumn")
              }
            }
          } catch (e) {
            console.log(e);
            console.log('特殊字符解码失败!');
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
          stompClient.send(this.SEND_ENDPOINT, { authenticator: this.token }, 'stty rows 24  columns 135 \r'); // 回车
        }, 2000);
      },
      (error) => {
        this.errorCallBack(term, error);
      },
    );

    // 6. 监听STOMP 消息通道
    let IllegalCharacter = ['mkfs', 'reboot', 'shutdown', 'init', 'rm', '-rf']; // 定义非法字符
    let orderIllegal = ''; // 记录非法字符
    term.onData((data) => {
      orderIllegal = orderIllegal + data; // 记录
      console.log('记录值 --> ' + orderIllegal);
      IllegalCharacter.forEach((item) => {
        if (orderIllegal.indexOf(item) != -1) {
          term.write(data + '包含非法字符请重新输入...');
          stompClient.send(this.SEND_ENDPOINT, { authenticator: this.token }, '\u0003');
          return (orderIllegal = ''); //清零
        }
      });
      stompClient.send(this.SEND_ENDPOINT, { authenticator: this.token }, data); // 发送消息
    });
  }

  render() {
    return <div id={'S_terminal'} className={'S_Terminal_container'}></div>;
  }

  /**
   * STOMP 错误回调
   * @param term
   * @param error
   */
  errorCallBack(term, error) {
    // 连接失败时（服务器响应 ERROR 帧）的回调方法
    let myError = new Array(
      ' *\n\r',
      ' *                     .::::. 🌹\n\r',
      ' *                  .::::::::.                                        🎫   Xiu Er\n\r',
      ' *                 :::::::::::\n \r',
      " *             ..:::::::::::'                                         📧   13813641925@163.com\n\r",
      " *           '::::::::::::'\n\r",
      ' *             .::::::::::                                            🐛   www.qiusunzuo.com\n\r',
      " *        '::::::::::::::..\n\r",
      ' *             ..::::::::::::.                                        🌟   http://github.com/erdengzhazha\n\r',
      ' *           ``::::::::::::::::\n\r',
      " *            ::::``:::::::::'        .:::.                           😄   Power By SpringBoot (v2.3.2)\n\r",
      " *           ::::'   ':::::'       .::::::::.\n\r",
      " *         .::::'      ::::     .:::::::'::::.\n\r",
      " *        .:::'       :::::  .:::::::::' ':::::.\n\r",
      " *       .::'        :::::.:::::::::'      ':::::.\n\r",
      " *      .::'         ::::::::::::::'         ``::::.\n\r",
      " *  ...:::           ::::::::::::'              ``::.\n\r",
      " * ```` ':.          ':::::::::'                  ::::..\n\r",
      " *                    '.:::::'                    ':'````..\n\r",
      ' *  ',
    );
    for (let i = 0; i < myError.length; i++) {
      term.write(myError[i]);
    }
    term.write('The cause of Err --> ' + error);
  }
}
