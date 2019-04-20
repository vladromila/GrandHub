import React, { Component } from 'react';
import { BrowserRouter, Switch, Link } from 'react-router-dom';
import PrivateRoute from './config/PrivateRoute';
import firebase from 'firebase';
import DashBoard from './components/DashBoard/DashBoard';
import LoginPage from './components/Authentication/LoginPage';
import RegisterPage from './components/Authentication/RegisterPage';
import GrandKidProfile from './components/GrandKidProfile/GrandKidProfile';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: 'notVerified',
      albums: []
    }
  }
  checUser(user) {
    if (user) {
      this.setState({ user });
      firebase.database().ref(`/developers/${firebase.auth().currentUser.uid}/albums`)
        .on('value', snapshot => {
          let albums = [];
          if (snapshot.val()) {
            Object.keys(snapshot.val()).forEach(key => {
              albums.push({ ...snapshot.val()[key], uid: key })
            })
          }
          this.setState({ albums })
        })
    }
    else
      this.setState({ user: null })
  }

  componentWillMount() {
    firebase.initializeApp(
      {
        apiKey: "AIzaSyCMYDqlBWI1sGVSAMZzoZZNhqWuFaTI5Fk",
        authDomain: "grandhub-446eb.firebaseapp.com",
        databaseURL: "https://grandhub-446eb.firebaseio.com",
        projectId: "grandhub-446eb",
        storageBucket: "grandhub-446eb.appspot.com",
        messagingSenderId: "706286821597"
      }
    )
    firebase.auth().onAuthStateChanged(user => this.checUser(user))
  }
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <React.Fragment>
            <nav>
              <div className="nav-wrapper teal lighten-2">
                <Link className="brand-logo left" to="/">GrandHub</Link>
                <ul className="right">
                  {this.state.user === 'notVerified' ? null : this.state.user ?
                    <React.Fragment>
                      <li><a
                        onClick={() => {
                          firebase.auth().signOut();
                        }}
                      >Logout</a></li>
                    </React.Fragment>
                    :
                    <React.Fragment>
                      <li><Link to="/register"><i className="material-icons left">person_add</i>Register</Link></li>
                      <li><Link to="/login"><i className="material-icons left">how_to_reg</i>Login</Link></li>
                    </React.Fragment>}
                </ul>
              </div>
            </nav>
          </React.Fragment>
          <Switch>
            <PrivateRoute
              path="/login"
              user={this.state.user}
              component={LoginPage}
              albums={this.state.albums}
              type="auth"
            />
            <PrivateRoute
              path="/register"
              user={this.state.user}
              component={RegisterPage}
              albums={this.state.albums}
              type="auth"
            />
            <PrivateRoute
              path="/grandkid/:handle"
              user={this.state.user}
              component={GrandKidProfile}
              albums={this.state.albums}
              type="dashboard"
            />
            <PrivateRoute
              path="/"
              user={this.state.user}
              component={DashBoard}
              albums={this.state.albums}
              type="dashboard"
            />

          </Switch>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
