import React, { Component } from 'react'
import firebase from 'firebase';
import './GrandKidProfile.css';
import { Tab, Tabs, Modal } from 'react-materialize'

export default class GrandKidProfile extends Component {
    constructor() {
        super();
        this.state = {
            user: {},
            repositories: [],
            selectedTab: "Repositories",
            events: []
        }
    }
    componentWillMount() {
        firebase.database().ref(`${firebase.auth().currentUser.uid}/grandKids/${this.props.param}`)
            .on("value", (snapshot) => {
                this.setState({ user: snapshot.val() });
                fetch(`https://api.github.com/users/${snapshot.val().login}/repos`)
                    .then(res => res.json())
                    .then((res) => {
                        this.setState({ repositories: res })
                    })
                fetch(`https://api.github.com/users/${snapshot.val().login}/events`)
                    .then(res => res.json())
                    .then((res) => {
                        this.setState({ events: res })
                    })
            })
    }
    render() {
        return (
            <div className="row">
                <div className="col s12 m3 l4 xl4 grandkid-profile">
                    <div className="profile">
                        <img src={this.state.user.avatar_url} className="repsonsive-img circle" />
                        <h5 className="center-align">{this.state.user.login}</h5>
                        <div className="row">
                            <div className="col s12"><button className="btn red">Remove</button></div>
                        </div>
                    </div>
                </div>
                <div className="col s12 m9 l8 xl8 grandkid-repos">
                    <Tabs className="tab-demo z-depth-1" onChange={(title, t2) => {
                        console.log(t2);
                    }}>
                        <Tab title="Repositories" onClick={() => {
                            console.log("da");
                        }} active={this.state.selectedTab == "Repositories"}>
                            <div className="row profile-repo-list">
                                {this.state.repositories.map((repo, i) => {
                                    return <div className="col s12 m6">
                                        <div className="card blue-grey darken-1">
                                            <div className="card-content white-text">
                                                <span className="card-title">{repo.name}</span>
                                            </div>
                                            <div className="card-action">
                                                <a href={repo.html_url}>View On Github</a>
                                            </div>
                                        </div>
                                    </div>
                                })}
                            </div>
                        </Tab>
                        <Tab title="Activities" active={this.state.selectedTab == "Activities"}>
                            <ul class="collection">
                                {this.state.events.map((event, i) => {
                                    if (event.payload.commits)
                                        return <Modal trigger={<li class="collection-item">
                                            <div><strong>{this.state.user.login}</strong> {event.type == "CreateEvent" ? `created a new ${event.payload.ref_type} (${event.repo.name})` : event.type == "PushEvent" ? `pushed a new commit (${event.repo.name})` : null}<a class="secondary-content"><i class="material-icons">{event.type === "CreateEvent" ? "add_box" : event.type === "PushEvent" ? "vertical_align_top" : null}</i></a></div>
                                        </li>}>
                                            <h1>Commits</h1>
                                            <ul class="collection">
                                                {event.payload.commits.map((commit, i) => {
                                                    return <li class="collection-item">
                                                        <a href={`https://github.com/${event.repo.name}/commits/${event.payload.head}`}>
                                                            <div>Message: <strong>{commit.message}</strong></div></a>
                                                    </li>
                                                })}
                                            </ul>
                                        </Modal>
                                    else
                                        if (event.type !== "WatchEvent" && event.type !== "PullRequestEvent")
                                            return <li class="collection-item">
                                                <div><strong>{this.state.user.login}</strong> {event.type == "CreateEvent" ? `created a new ${event.payload.ref_type} (${event.repo.name})` : event.type == "PushEvent" ? `pushed a new commit (${event.repo.name})` : event.type == "IssuesEvent" ? `${event.payload.action} an issue (${event.repo.name})` : event.type === "IssueCommentEvent" ? `${event.payload.action} a comment (${event.repo.name})` : console.log(event)}<a class="secondary-content"><i class="material-icons">{event.type === "CreateEvent" ? "add_box" : event.type === "PushEvent" ? "vertical_align_top" : event.payload.action ? event.payload.action === "created" ? "add_box" : event.payload.action === "closed" ? "close" : event.payload.action === "opened" ? "bug_report" : null : null}</i></a></div>
                                            </li>
                                })}

                            </ul>
                        </Tab>
                        <Tab title="Achievements">
                                <h2 class="flow-text">Achievments</h2>
                                <div class="row achievments center-align">
                                    {this.state.user ? this.state.user.achievements ? Object.keys(this.state.user.achievements).map((achievement, i) => {
                                        if (this.state.user.achievements[achievement] === true)
                                            return <div class="badge">
                                                <img src={require(`./achieved/${achievement}.svg`)} />
                                            </div>
                                    }) : null : null}
                                </div>
                                <hr />
                                <h2 class="flow-text">Locked</h2>
                                <div class="row achievments center-align">
                                {this.state.user ? this.state.user.achievements ? Object.keys(this.state.user.achievements).map((achievement, i) => {
                                        if (this.state.user.achievements[achievement] === false)
                                            return <div class="badge">
                                                <img src={require(`./locked/${achievement}.svg`)} />
                                            </div>
                                    }) : null : null}
                                </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        )
    }
}
