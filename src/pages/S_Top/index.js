// Top 图
import React from 'react';
import '../../assets/S_Top/css/common.css';
// -----------  stomp start -------------
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
// -----------  stomp end -------------

// ----------- antd start -------------
import { Table, Button, Space } from 'antd';
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
      text: [''],
      TopLoadAverage:{
        param1: '',
        param2: '',
        param3: ''
      },
      TopTime:'', //目前时间
      TopUp:'', //上线时间
      TopMem:{
        total:'',
        free:'',
        used:'',
        buffOrcache:''
      },
      Swap:{
        total:'',
        free:'',
        used:'',
        availMem:''
      },
      TopProcess:[],
      filteredInfo: null,
      sortedInfo: null,
    }

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
        let containerResult = [];
        let i = 0;
        let subscribe = stompClient.subscribe(this.SUBSCRIBE_PREFIX, (response) => {
          let body = response.body;
          console.log('订阅成功! 返回值 = ' + body);
          // 1. 处理数据分割
          // 1.1 按照 [K 分割 为一个数组
          let split1 = body.split("[K");
          if(split1.length > 10) { //合规的数据
            // 1.2    0～4组成一个 数组
            let firstHalf = [split1[0], split1[1], split1[2], split1[3], split1[4]]
            // 1.2.1  将数组分割 为一个 对象数组
            let firstHalfObject = []
            let firstHalfObjectIndex = 0
            for (let i = 0; i < firstHalf.length; i++) {
              let elements = firstHalf[i].split(" ").filter(item=>{
                if(item != ''){
                  return item
                }
              })
              if(elements.length>2){
                firstHalfObject[firstHalfObjectIndex++] = elements
              }
            }
            console.log("firstHalfObject", firstHalfObject)
            let firstHalfObject0 = firstHalfObject[0];
            // cpu平均负载
            let tmpTopLoadAverage = this.state.TopLoadAverage
            tmpTopLoadAverage.param1 = firstHalfObject0[11]
            tmpTopLoadAverage.param2 = firstHalfObject0[12]
            tmpTopLoadAverage.param3 = firstHalfObject0[13]
            let firstHalfObject1 = firstHalfObject[1];
            let firstHalfObject2 = firstHalfObject[2];
            let firstHalfObject3 = firstHalfObject[3];
            let firstHalfObject4 = firstHalfObject[4];
            let topMem = this.state.TopMem
            topMem.total = firstHalfObject3[3]
            topMem.free = firstHalfObject3[5]
            topMem.used = firstHalfObject3[7]
            topMem.buffOrcache = firstHalfObject3[9]
            let topSwap = this.state.Swap
            try {
              topSwap.total = firstHalfObject4[2]
              topSwap.free = firstHalfObject4[4]
              topSwap.used = firstHalfObject4[6]
              topSwap.availMem = firstHalfObject4[8]
            }catch (e) {
              console.error(firstHalfObject4)
            }

            this.setState({
              TopLoadAverage:tmpTopLoadAverage,
              TopTime:firstHalfObject0[2],
              TopUp:firstHalfObject0[4]
            })
            // 1.3 6~结束组成一个数组
            let secondHalf = []
            let j = 0
            for (let i = 6; i < split1.length; i++) {
              secondHalf[j++] = split1[i]
            }

            let secondHalfObject = []
            let secondHalfObjectIndex = 0
            // 1.3.1  将数组分割为 一个对象数组
            secondHalf.forEach((item,index)=>{
              let elements = item.split(" ").filter(e=>{
                let flag = true
                if(e == ''||e == "\r\n\u001b[m\u000f"||e == "\r\n\u001b[7m"||e=="\u001b[m\u000f\u001b"
                ||e=="\r\n\x1B[m\x0F\x1B[1m"
                ){
                  flag = false
                }
                if(flag){
                  return e
                }
              })
              if(elements.length>2){
                secondHalfObject[secondHalfObjectIndex++] = elements
              }
            })
            let tmpTopProcess = this.state.TopProcess;
            secondHalfObject.forEach((item,index) =>{
              let Process ={
                PID: '',
                USER: '',
                PR: '',
                NI: '',
                VIRT: '',
                RES: '',
                SHR: '',
                S: '',
                CPUProp: '',
                MEMProp: '',
                TIME: '',
                COMMAND: ''
              }
              let itemElement = item[0];
              itemElement=itemElement
                .replace("\r","")
                .replace("\n","")
                .replace("\u000f","")
                .replace("\u001b","")
                .replace(/\[\d{0,}m/g,"")
              Process.PID = itemElement
              Process.USER = item[1]
              Process.PR =item[2]
              Process.NI =item[3]
              Process.VIRT = item[4]
              Process.RES = item[5]
              Process.SHR = item[6]
              Process.S =item[7]
              Process.CPUProp =item[8]
              Process.MEMProp =item[9]
              Process.TIME = item[10]
              Process.COMMAND =item[11]
              tmpTopProcess[index] = Process
            })
            // 将数据塞入状态对象
            this.setState({
              TopProcess:tmpTopProcess
            })

            containerResult[0] = response.body;

            this.setState({
              text: containerResult,
            });
            try {
              if (response.body !== 'cd ~ && script -q -a') {
                console.log('录像 true');
              }
            } catch (e) {
              console.log('特殊字符解码失败!', e);
            }
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
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: 'PID',
        dataIndex: 'PID',
        key: 'PID',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'PID' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'USER',
        dataIndex: 'USER',
        key: 'USER',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'USER' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'PR',
        dataIndex: 'PR',
        key: 'PR',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'PR' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'NI',
        dataIndex: 'NI',
        key: 'NI',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'NI' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'VIRT',
        dataIndex: 'VIRT',
        key: 'VIRT',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'VIRT' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'RES',
        dataIndex: 'RES',
        key: 'RES',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'RES' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'SHR',
        dataIndex: 'SHR',
        key: 'SHR',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'SHR' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'S',
        dataIndex: 'S',
        key: 'S',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'S' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: '%CPU',
        dataIndex: 'CPUProp',
        key: 'CPUProp',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === '%CPU' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: '%MEM',
        dataIndex: 'MEMProp',
        key: 'MEMProp',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === '%MEM' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'TIME+',
        dataIndex: 'TIME',
        key: 'TIME',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'TIME+' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: 'COMMAND',
        dataIndex: 'COMMAND',
        key: 'COMMAND',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'COMMAND' && sortedInfo.order,
        ellipsis: true
      }
    ];
    return (
      <>
        <p>现在时间：{this.state.TopTime}</p>
        <p>System Up: {this.state.TopUp} days</p>
        <p>CPU平均负载:{this.state.TopLoadAverage.param1} {this.state.TopLoadAverage.param2} {this.state.TopLoadAverage.param3}</p>
        <p>Mem</p>
        <p>total:{this.state.TopMem.total}  free:{this.state.TopMem.free}  used:{this.state.TopMem.used}  buff/cache:{this.state.TopMem.buffOrcache} </p>
        <p>Swap </p>
        <p>total: {this.state.Swap.total} free:{this.state.Swap.free} used:{this.state.Swap.used}  avail/mem:{this.state.Swap.availMem} </p>
        <Space style={{ marginBottom: 16 }}>
          <Button onClick={this.setAgeSort}>Sort age</Button>
          <Button onClick={this.clearFilters}>Clear filters</Button>
          <Button onClick={this.clearAll}>Clear filters and sorters</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={this.state.TopProcess}
          onChange={this.handleChange}
          pagination={false}
        />
      </>
    );
  }


  handleChange = (pagination, filters, sorter) => {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  };

  clearFilters = () => {
    this.setState({ filteredInfo: null });
  };

  clearAll = () => {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  };

  setAgeSort = () => {
    this.setState({
      sortedInfo: {
        order: 'descend',
        columnKey: 'age',
      },
    });
  };
}
