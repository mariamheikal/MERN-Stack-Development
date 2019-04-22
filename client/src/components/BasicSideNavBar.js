// import React from 'react';
import { slide as Menu } from "react-burger-menu";
import Search from "../components/Search";

import SideNav, {
  Nav,
  NavItem,
  NavIcon,
  NavText
} from "@trendmicro/react-sidenav";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";
import SvgIcon from "react-icons-kit";
import { users } from "react-icons-kit/icomoon/users";
import { home } from "react-icons-kit/icomoon/home";
import { clipboard } from "react-icons-kit/icomoon/clipboard";
import { plusSquare } from "react-icons-kit/fa/plusSquare";
import { calendar } from "react-icons-kit/icomoon/calendar";

// export default props => {
// return (
//     <div>

//   <Menu>
//   <Search />
//     <a className="menu-item" href="">
//       News Feed
//     </a>

//     <a className="menu-item" href="/">
//       My profile
//     </a>
//     <a className="menu-item" href="">
//          Change password  </a>

//     <a className="menu-item" href="">
//          Logout  </a>

//   </Menu>
//   </div>
// );
// };

import React, { Component } from "react";

class BasicSideNavBar extends Component {
  state = { type: null, coID: null, data: null };

  componentDidMount() {
    this.getList();
  }
  // Retrieves the list of items from the Express app
  getList = async () => {
    //const coID = this.props.match.params.coID;
    await fetch(`/api/member/getUserData/`)
      .then(res => res.json())
      .then(data => {
        this.setState({ data });
      });

    this.setState({
      type: this.state.data.type,
      coID: this.state.data.id
    });
    // console.log(this.state.data.id);
    // console.log(this.state.data.type); /api/CreateAccount
  };

  logout = async e => {
    e.preventDefault();
    //const coID = this.props.match.params.coID;
    await fetch(`/api/CreateAccount/logout`).then(res => res.json());
  };
  render() {
    // const type = this.state.data.type;
    const coID = this.state.coID;
    // console.log(coID + " " + this.state.type);
    if (this.state.type === "coworkingSpace") {
      return (
        <div>
          <Menu>
            <Search />

            <a className="menu-item" href={`/coworkingSpace/${coID}`}>
              My profile
            </a>
            <a className="menu-item" href="">
              Change password{" "}
            </a>

            <a
              className="menu-item"
              onClick={e => {
                this.logout(e);
                window.location = "/";
              }}
            >
              Logout{" "}
            </a>
          </Menu>
        </div>
      );
    } else if (this.state.type === "partner") {
      return (
        <div>
          <Menu>
            <Search />
            <a className="menu-item" href="">
              Home
            </a>

            <a className="menu-item" href="">
              My profile
            </a>

            <a className="menu-item" href="">
              Create a Task{" "}
            </a>

            <a className="menu-item" href="">
              My Tasks
            </a>

            <a className="menu-item" href="">
              My Room Bookings
            </a>

            <a className="menu-item" href="">
              Book A Room
            </a>

            <a
              className="menu-item"
              onClick={e => {
                this.logout(e);
                window.location = "/";
              }}
            >
              Logout{" "}
            </a>
          </Menu>
        </div>
      );
    } else if (this.state.type === "consultancyAgency") {
      return (
        <div>
          <Menu>
            <Search />
            <a className="menu-item" href={`/ConsultancyAgency`}>
              <SvgIcon size={20} icon={home} />
              {"  "}
              My Profile
            </a>

            <a className="menu-item" href={`/ConsultancyAgency/Partners`}>
              <SvgIcon size={20} icon={users} />
              {"  "}
              My Partners
            </a>

            <a className="menu-item" href={`/ConsultancyAgency/Tasks`}>
              <SvgIcon size={20} icon={clipboard} /> {"  "}
              My Assigned Tasks
            </a>

            <a className="menu-item" href={`/ConsultancyAgency/MyEvents`}>
              <SvgIcon size={20} icon={calendar} />
              {"  "}
              My Events
            </a>

            <a className="menu-item" href={`/ConsultancyAgency/AllTasks`}>
              <SvgIcon size={20} icon={plusSquare} />
              {"  "}
              Apply for a Task
            </a>

            <a
              className="menu-item"
              onClick={e => {
                this.logout(e);
                window.location = "/";
              }}
            >
              Logout{" "}
            </a>
          </Menu>
        </div>
      );
    } else {
      return (
        <Menu>
          <a className="menu-item" href="">
            My profile
          </a>

          <a className="menu-item" href="">
            Change password{" "}
          </a>

          <a
            className="menu-item"
            onClick={e => {
              this.logout(e);
              window.location = "/";
            }}
          >
            Logout{" "}
          </a>
        </Menu>
      );
    }
  }
}

export default BasicSideNavBar;
