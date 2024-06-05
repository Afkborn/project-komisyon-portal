import React from "react";
import {
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  Badge,
} from "reactstrap";

export default function Kurum({ kurumlar }) {
  return (
    <div>
      <h3>Kurum Listesi</h3>
      <span>
        Sistemde kayıtlı olan kurumlar listelenmektedir. Burada bir değişiklik
        yapamazsınız !
        <br />
      </span>

      <hr />

      <div className="mt-5">
        <ListGroup>
          {kurumlar.map((kurum) => (
            <ListGroupItem key={kurum.id}>
              <ListGroupItemHeading>
                <Badge color="info" className="me-2">
                  {kurum.id}
                </Badge>

                {kurum.name}
              </ListGroupItemHeading>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}
