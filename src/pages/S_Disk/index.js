// Top 图
import React from 'react';
import '../../assets/S_Top/css/common.css';
// -----------  stomp start -------------
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
// -----------  stomp end -------------

// ----------- antd start -------------
import { Table, Button, Space } from 'antd';

export  default class S_Disk extends React.Component{

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
    }
    this.timeout1 = null
    this.timeout2 = null
    this.state = {
      text: [],
      diskList:[]
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
          // 1. 处理数据分割
          // 1.1 按照 [K 分割 为一个数组
          try {
            if (response.body !== 'cd ~ && script -q -a') {
              let tmpbody=''
              if(body.indexOf('#')<1){// 去除 # 信息
                if(body.indexOf('df')<1&&body.indexOf('-h')<1) {//去除df -h
                  // 去除所有特殊字符
                  tmpbody = body.replace("\r", "")
                    .replace("\n", "")
                    .replace("\u000f", "")
                    .replace("\u001b", "")
                    .replace(/\[\d{0,}m/g, "")
                    .replace(/\[\d{0,}K/g, "")
                    .replace("\x1B", "")
                    .replace("\x0F", "")
                    .replace("\r\n", "")
                  let split = tmpbody.split("/")
                  split.forEach((item,index)=>{
                    if(item.indexOf("vd")>0){
                      let elementArray = item.split(" ").filter(e=>{
                        if(e==''){
                          return false
                        }else{
                          return true
                        }
                      })
                      let tmpSplit3 = "/"+split[index+1].replace("[01;31m","").replace("/","")
                      // debugger
                      let object = {
                        type : elementArray[0],
                        Capacity : elementArray[1],
                        Used : elementArray[2],
                        Available : elementArray[3],
                        UsedPerson : elementArray[4],
                        MountPoint : tmpSplit3
                      }
                      let j=0
                      containerResult.forEach((item,index)=>{
                        if(item.type==object.type){
                          debugger
                          containerResult[index] = object
                          j++
                        }
                      })
                      if(j==0){ //没有找到同类
                        containerResult[i++]=object
                      }

                    }
                  })

                }
              }

              this.setState({
                diskList:containerResult
                }
              )
            }
          } catch (e) {
            console.log('特殊字符解码失败!', e);
          }

        })

        this.timeout1 = setInterval(() => {
          // stompClient.send(this.SEND_ENDPOINT, {authenticator: this.token}, '/sbin/ifconfig eth0 | grep bytes \r'); // eth0的网络
          stompClient.send(this.SEND_ENDPOINT, {authenticator: this.token}, "df -h 2>/dev/null|grep -E '^/dev/' \r"); // 发送磁盘信息

        }, 2000);
      },
      (error) => {
        console.error('连接错误!');
      },
    );
  }
  componentWillUnmount() {
    // 请注意Un"m"ount的m是小写

    // 如果存在this.timer，则使用clearTimeout清空。
    // 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear
    this.timeout1 && clearInterval(this.timeout1);
  }


  render() {
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      {
        title: '名称',
        dataIndex: 'type',
        key: 'type',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'type' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: '容量',
        dataIndex: 'Capacity',
        key: 'Capacity',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'Capacity' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: '已用',
        dataIndex: 'Used',
        key: 'Used',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'Used' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: '可用',
        dataIndex: 'Available',
        key: 'Available',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'Available' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: '已用%',
        dataIndex: 'UsedPerson',
        key: 'UsedPerson',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'UsedPerson' && sortedInfo.order,
        ellipsis: true
      },
      {
        title: '挂载点',
        dataIndex: 'MountPoint',
        key: 'MountPoint',
        sorter: (a, b) => a.age - b.age,
        sortOrder: sortedInfo.columnKey === 'MountPoint' && sortedInfo.order,
        ellipsis: true
      }
    ];
    return (
      <>
        <Table
          columns={columns}
          dataSource={this.state.diskList}
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
