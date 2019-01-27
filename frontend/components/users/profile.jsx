import React, {Component} from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

class Profile extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { user } = this.props;
    return (
      <section className="content-container--interior-page flex-container">
        <h2>{user.username} Profile</h2>
      </section>
    )
  }
}

const msp = (state, props) => ({
  user: state.entities.users[props.userId]
})

const mdp = dispatch => ({
  
})

export default connect(msp,mdp)(Profile);