import React, {Component} from 'react'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  NavigatorIOS,
  ListView,
  Alert,
  AsyncStorage,
  MapView,
  Image
} from 'react-native'
import SocketIOClient from 'socket.io-client';

// This is the root view
var Connect4 = React.createClass({
  render() {
    return (
      <NavigatorIOS
      initialRoute={{
        component: FrontPage,
        title: "Xin Chào!"
      }}
      style={{flex: 1}}
      />
    );
  }
});

var Interface= React.createClass({
  getInitialState() {
    this.setState({
      socket: this.props.socket
    });
    // const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    //
    // fetch('https://hohoho-backend.herokuapp.com/messages', {
    //   method: 'GET',
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    // })
    // .then((response) => response.json())
    // .then((responseJson) => {
    //   console.log(responseJson)
    //   this.setState({
    //     dataSource: ds.cloneWithRows(responseJson.messages)
    //   })
    // })
    return{
      initialRow: [1, 2, 3, 4, 5, 6, 7],
      dataSource: [["0","0","0","0","0","0","0"],
      ["0","0","0","0","0","0","0"],
      ["0","0","0","0","0","0","0"],
      ["0","0","0","0","0","0","0"],
      ["0","0","0","0","0","0","0"],
      ["0","0","0","0","0","0","0"],
      ["0","0","0","0","0","0","0"]]
    }
  },
  press(row){
    alert(row);
  },
  render(){
    return (

      <View style={styles.container}>
      <Image style={styles.backgroundImage} source={{uri: 'https://s-media-cache-ak0.pinimg.com/originals/ac/99/13/ac991305df5fb4c1cdd53bf7f5535a4e.gif'}}/>
      <Text style={styles.textBig}> Current Turn:</Text>

      <View style={{flexDirection: "row"}}>
        {this.state.initialRow.map((row)=>
          <TouchableOpacity onPress={this.press.bind(this, row)}>
            <Text style={styles.roundbutton}>{row}</Text>
          </TouchableOpacity>
        )}
      </View>

      {this.state.dataSource.map((row)=>
      <Text style={styles.grid}>{row.map((item) =>
      <Text>{item}</Text>)}
      </Text>)}
      </View>

      // <Text style={styles.textBig}> Current Turn:</Text>
      // {this.state.dataSource.map((row)=>
      // <Text>{row}</Text>)

      // <View style={styles.container}>
      // <Text style={styles.textBig}>Login to the game, playa!</Text>
      // <TouchableOpacity onPress={this.login} style={[styles.button, styles.buttonRed]}>
      // <Text style={styles.buttonLabel}>Tap to Login</Text>
      // </TouchableOpacity>
      // <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={this.register}>
      // <Text style={styles.buttonLabel}>Tap to Register</Text>
      // </TouchableOpacity>
      // </View>

    )
  }
})


var Games = React.createClass({
  getInitialState() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    fetch('http://localhost:3000/users', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json"
      },
      // body: JSON.stringify({
      //   username: this.state.username,
      //   password: this.state.password,
      // })
    })
    .then((response) => {

      return response.json()
    })
    .then((responseJson) => {

      this.setState({
        dataSource: ds.cloneWithRows(responseJson.users)
      })
    })
    .catch((err) => {

      console.log('error', err);
    });
    return{
      dataSource: ds.cloneWithRows([]),
    }
  },
  componentDidMount(){
    var count = 0;
    this.setState({
      socket: this.props.socket
    }, () => { //callback when state is set and socket is ready to be used, set up listeners here
      var self = this;

      this.state.socket.on('newUserAdded', function(data){
        count++;
        if (count === 2){
          //start game
          self.state.socket.emit('startGame', {});
        }
      });
      this.state.socket.on('startGame', function(data){
        gameStarted();
      });
      this.state.socket.on('start', function(data){
        gameStarted();
      });

      var gameStarted = () => {
        //go to interface page here
      }

    })
  },
  press(username, id){
    var currentUsername;
    var currentId;

    AsyncStorage.getItem('user')
    .then(result => {
      var parsedResult = JSON.parse(result);
      console.log(parsedResult.username, parsedResult.id);
      currentUsername = parsedResult.username;
      currentId = parsedResult.id;

      this.state.socket.emit('addPlayer', {
        username: parsedResult.username,
        id: parsedResult.id
      });
      this.state.socket.emit('addPlayer', {
        username: username,
        id: id
      }); //add both players, when both players are added start the game


    })
    .catch(err => console.log(err));
  },

  render(){
    return (
      <View style={styles.container}>
        <ListView
        dataSource={this.state.dataSource}
        renderRow={(rowData) =>

          <View style={styles.container}>
            <TouchableOpacity onPress={this.press.bind(this, rowData.username, rowData._id)}>
              <Text>{rowData.username}</Text>
            </TouchableOpacity>
          </View>}
        />

      </View>
    )
  },
})


var Register = React.createClass({

  getInitialState () {
    return {
      username: '',
      password: ''
    }
  },

  press(){

    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.success === true){
        console.log('Success!');
      }

      this.props.navigator.pop()
    })
    /* do something with responseJson and go back to the Login view but
    * make sure to check for responseJson.success! */
    .catch((err) => {
      console.log('urr boooooi', err);
    });
  },

  render() {
    return (
      <View style={styles.container}>
      <Text style={styles.textBig}>Register</Text>
      <TextInput
      style={{height: 40}}
      placeholder="Enter your username"
      onChangeText={(text1) => this.setState({username: text1})}/>

      <TextInput secureTextEntry={true}
      style={{height: 40}}
      placeholder="Enter your password"
      onChangeText={(text2) => this.setState({password: text2})}/>

      <TouchableOpacity onPress={this.press} style={[styles.button, styles.buttonPink]}>
      <Text>Register ho!</Text>
      </TouchableOpacity>
      </View>
    );
  }
});


var Login = React.createClass({
  getInitialState () {
    return {
      username: '',
      password: '',
      socket: this.props.socket
    }
  },
  interface(){
    this.props.navigator.push({
      component: Interface,
      title: "Game On"
    })
  },

  press(username,password){
    // var self = this;

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {

      this.props.navigator.push({
        component: Games,
        title: "User List",
        passProps: {
          username: this.state.username,
          password: this.state.password,
          id: responseJson.user._id,
          socket: this.state.socket
        },
        rightButtonTitle: 'Interface',
        onRightButtonPress: this.interface,
        passProps: {
          socket: this.state.socket
        }
      })

      AsyncStorage.setItem('user', JSON.stringify({
        username: this.state.username,
        password: this.state.password,
        id: responseJson.user._id
      }));


    })
    /* do something with responseJson and go back to the Login view but
    * make sure to check for responseJson.success! */
    .catch((err) => {
      alert(err);
    });
  },

  render() {
    return (
      <View style={styles.container}>
      <Text style={styles.textBig}>Log In</Text>
      <TextInput
      style={{height: 40}}
      placeholder="Login Username"
      onChangeText={(text1) => this.setState({username: text1})}/>

      <TextInput secureTextEntry={true}
      style={{height: 40}}
      placeholder="Login Password"
      onChangeText={(text2) => this.setState({password: text2})}/>

      <TouchableOpacity onPress={this.press} style={[styles.button, styles.buttonYellow]}>
      <Text>Login ho!</Text>
      </TouchableOpacity>
      </View>
    );
  }

});


var FrontPage = React.createClass({

  getInitialState: function() {
  return {
    socket: SocketIOClient('http://localhost:3000')
  }
},

  componentDidMount(){

    AsyncStorage.getItem('user')
    .then(result => {
      var parsedResult = JSON.parse(result);
      var username = parsedResult.username;
      var password = parsedResult.password;
      console.log(result, username, password);
      if (username && password) {
        this.props.navigator.push({
          component: Games,
          title: "Games",
          passProps: {
            username: username,
            password: password,
            socket: this.state.socket
        },
          rightButtonTitle: 'Interface',
          onRightButtonPress: this.interface
        });
      }
    })
    .catch(err => console.log(err))
  },

  interface(){
    this.props.navigator.push({
      component: Interface,
      title: "Game in session",
      passProps: {
        socket: this.state.socket
      }
    });
  },

  login() {
    this.props.navigator.push({
      component: Login,
      title: "Login",
      passProps: {
        socket: this.state.socket
      }
    });
  },

  register() {
    this.props.navigator.push({
      component: Register,
      title: "Register",
      passProps: {
        socket: this.state.socket
      }
    });
  },

  render() {
    return (
      <View style={styles.container}>
      <Image style={styles.backgroundImage} source={{uri: 'https://data.whicdn.com/images/35234739/original.gif'}}/>
      <Text style={styles.textOpacity}>Time to play the GAME</Text>
      <TouchableOpacity onPress={this.login} style={[styles.button, styles.buttonRed]}>
      <Text style={styles.buttonLabel}>Tap to Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonGreen]} onPress={this.register}>
      <Text style={styles.buttonLabel}>Tap to Register</Text>

      </TouchableOpacity>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  textOpacity:{
    opacity: 0.8,
    fontSize: 36,
    textAlign: 'center',
    margin: 10,
    // backgroundColor: 'transparent',
    // color: 'white'
  },

  backgroundImage:{
    position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        resizeMode: 'stretch',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  containerFull: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10,
    opacity: 0.85
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonRed: {
    backgroundColor: '#FF585B',
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonGreen: {
    backgroundColor: '#2ECC40'
  },
  buttonPink:{
    backgroundColor: 'pink'
  },
  buttonYellow:{
    backgroundColor: 'yellow'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  },

grid:{
  // flex:1,
  // width:1,
  // height:1,
  // backgroundColor: 'yellow',
  borderWidth:1,
  borderColor: '#000',
  fontSize: 40,
  opacity: 0.75
},

roundbutton:{
    backgroundColor: "transparent",
    borderColor: '#000',
    fontSize: 40,
    opacity: 0.75
},

  });






AppRegistry.registerComponent('Connect4', () => Connect4 );
