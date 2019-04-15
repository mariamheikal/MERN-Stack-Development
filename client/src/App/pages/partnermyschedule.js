import React, { Component } from "react";
import { ListGroup } from "react-bootstrap";
import PartnerNavbar from "../components/PartnerNavbar";
import PartnerSidenav from "../components/PartnerSidenav";

class partnermyschedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      descript: []
    };
  }

  componentWillMount() {
    this.getDescription();
  }

  getDescription = async () => {
    const id = this.props.match.params.id;
    const id2 = this.props.match.params.id2;
    await fetch(`http://localhost:4000/api/partner/cospace/rooms/${id}/${id2}`)
      .then(res => res.json())
      .then(descript => this.setState({ descript }));
  };

  render() {
    let descript = this.state.descript || {};

    return (
      <div className="App">
        <PartnerNavbar />
        <PartnerSidenav />
        <br />
        <h1>The Room's schedule </h1>
        {descript.map(el => {
          return (
            <ListGroup>
              <div key={el.roomID}>
                <span>
                  <ListGroup.Item variant="info">
                    Reserved: {JSON.stringify(el.reserved)}
                  </ListGroup.Item>
                </span>
                <span>
                  <ListGroup.Item variant="info">
                    Date: {el.Date}
                  </ListGroup.Item>
                </span>
                <span>
                  <ListGroup.Item variant="info">
                    time: {el.time}
                  </ListGroup.Item>
                </span>
                <span>
                  <ListGroup.Item variant="info">
                    schedule Number: {el.scheduleNumber}
                  </ListGroup.Item>
                </span>

                <br />
              </div>
            </ListGroup>
          );
        })}
        <div
          class="alert alert-secondary"
          role="alert"
          style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        >
          Copyright © 2019 Lirten Inc. All Rights Reserved.{" "}
        </div>
      </div>
    );
  }
}

export default partnermyschedule;
