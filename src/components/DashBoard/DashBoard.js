import React, { Component } from 'react'
import { Input, Row, Col, Modal, Icon, Button } from 'react-materialize'
import './DashBoard.css'
import GhLogo from "./GitHub-Mark.png";
import firebase from 'firebase';
import { Link } from 'react-router-dom';

export default class DashBoard extends Component {

    constructor() {
        super();
        this.state = {
            fetchedGrandKids: [],
            addGrandKidModalVisible: false,
            grandKids: {},
            toDeleteGrandKidModalVisible: false,
            toDeleteKey: ""
        }
        this.searchTimeout = 0;
    }
    componentWillMount() {
        firebase.database().ref(`/${firebase.auth().currentUser.uid}/grandKids`)
            .on("value", (snapshot) => {
                this.setState({ grandKids: snapshot.val() });
            })
    }

    searchForUsers(value) {
        fetch(`https://api.github.com/search/users?q=${value}`)
            .then(res => res.json())
            .then(res => {
                let fetchedGrandKids = [];
                for (let i = 0; i <= 5; i++) {
                    if (res.items)
                        if (res.items[i])
                            fetchedGrandKids.push(res.items[i]);
                }
                this.setState({ fetchedGrandKids })
            })
    }

    inputChange(e) {
        clearTimeout(this.searchTimeout);
        let value = e.target.value;
        if (value === "")
            this.setState({ fetchedGrandKids: [] })
        else
            this.searchTimeout = setTimeout(() => {
                this.searchForUsers(value);
            }, 1000)
    }
    render() {
        return (
            <div>
                <Row>
                    <Col s={12} m={6} l={4} xl={4}>
                        <div className="card teal lighten 2 add-github"
                            onClick={() => {
                                this.setState({ addGrandKidModalVisible: true })
                            }}
                        >
                            <div className="card-image">
                                <img src={GhLogo} className="responsive-img" />
                                <a className="btn-floating halfway-fab waves-effect waves-light red"><i
                                    className="material-icons">add</i></a>
                            </div>
                            <div className="card-action">
                                <a onClick={() => {
                                    this.setState({ addGrandKidModalVisible: true })
                                }}>Add a grandkid</a>
                            </div>
                        </div>
                    </Col>
                    {this.state.grandKids ? Object.keys(this.state.grandKids).map((key, i) => {
                        return <Col s={12} m={6} l={4} xl={4} key={i}>
                            <div className="card teal lighten 2 add-github grandkid-item" >
                                <div className="card-image">
                                    <img src={this.state.grandKids[key].avatar_url} className="responsive-img" />
                                    <span className="card-title">{this.state.grandKids[key].login}</span>
                                </div>
                                <div className="card-action">
                                    <Link to={`/grandkid/${key}`}>Visit</Link>
                                    <a onClick={() => {
                                        this.setState({ toDeleteGrandKidModalVisible: true, toDeleteKey: key })
                                    }}>Delete</a>
                                </div>
                            </div>
                        </Col>
                    }) : null}
                </Row>
                <Modal
                    open={this.state.addGrandKidModalVisible}
                    modalOptions={{ dismissible: false }}
                    actions={
                        <Button modal="close" className="red darken-2" onClick={() => {
                            this.setState({ addGrandKidModalVisible: false })
                        }}><Icon left>close</Icon>Close</Button>
                    }
                >
                    <Row md={12}>
                        <div className="input-field col s12">
                            <input id="album_name" type="text" onChange={(e) => {
                                this.inputChange(e);
                            }} />
                            <label htmlFor="album_name">Search for a grandchild</label>
                        </div>
                    </Row>
                    <Row>
                        {this.state.fetchedGrandKids.map((kid, i) => {
                            return <div className="col s12 m6 grandkid-item" key={i}>
                                <div className="card">
                                    <div className="card-image">
                                        <img src={kid.avatar_url} className="responsive-img" />
                                        <span className="card-title">{kid.login}</span>
                                        <a className="btn-floating halfway-fab waves-effect waves-light red"
                                            onClick={() => {
                                                fetch("http://localhost:5551/addGrandKid", {
                                                    method: "POST",
                                                    mode: "cors",
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Origin': '*',
                                                        'Access-Control-Allow-Headers': '*',
                                                        'Access-Control-Allow-Origin': '*',
                                                    },
                                                    body: JSON.stringify({ login: kid.login, uid: firebase.auth().currentUser.uid })
                                                })
                                                    .then((res) => {
                                                        this.setState({ addGrandKidModalVisible: false })
                                                    })
                                            }}
                                        ><i className="material-icons">add</i></a>
                                    </div>
                                    <div className="card-action">
                                        <a href={kid.html_url}>Go to profile</a>
                                    </div>
                                </div>
                            </div>
                        })}
                    </Row>
                </Modal>
                <Modal
                    modalOptions={{ dismissible: false }}
                    open={this.state.toDeleteGrandKidModalVisible}
                    actions={
                        <Button modal="close" className="red darken-2" onClick={() => {
                            this.setState({ toDeleteGrandKidModalVisible: false })
                        }}><Icon left>close</Icon>Close</Button>
                    }
                >
                    <div className="container">
                        <h1>Are you sure you want to delete this grandkid?</h1>
                        <Button
                            onClick={() => {
                                firebase.database().ref(`/${firebase.auth().currentUser.uid}/grandKids/${this.state.toDeleteKey}`)
                                    .remove()
                                    .then(() => { this.setState({ toDeleteGrandKidModalVisible: false }) })
                            }}
                        >
                            <Icon left>delete</Icon>Delete
                        </Button>
                    </div>
                </Modal>
            </div>
        )
    }
}
