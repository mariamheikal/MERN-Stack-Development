import React, { Component } from "react";
import { Link } from "react-router-dom";

import { BrowserRouter as Route } from "react-router-dom";
import NavbarPage from "../components/Navbar";
import MemberSidenav from "../components/MemberSidenav";
class MemberViewAllmembers extends Component {
  state = { list: [], type: "member" };

  componentDidMount() {
    this.getList();
  }
  // Retrieves the list of items from the Express app
  getList = async () => {
    //const coID = this.props.match.params.coID;
    await fetch(`http://localhost:4000/api/member/`)
      .then(res => res.json())
      .then(list => this.setState({ list }));
  };
  render() {
    let sidenav;

    if (this.state.type === "member") {
      sidenav = <MemberSidenav />;
    } else {
      sidenav = <MemberSidenav />;
    }
    const { list } = this.state;
    console.log(this.state.list);

    return (
      <div className="App">
        <Route>
          {" "}
          <div>
            {" "}
            <NavbarPage whichPage="member" /> <MemberSidenav />;
          </div>{" "}
        </Route>
        {list.map(el => (
          <div key={el._id}>
            <h3>{el.coworkingSpaceName}</h3>
            <h3>{el.name}</h3>
            {"Type: "}
            <span>{el.type}</span>
            <Link to={`/viewMembermem/${el._id}/`}>
              <button />
            </Link>
          </div>
        ))}
      </div>
    );
  }
}

export default MemberViewAllmembers;