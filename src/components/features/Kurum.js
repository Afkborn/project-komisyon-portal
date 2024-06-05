import React from "react";
import {
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  Badge,
  Button,
} from "reactstrap";

export default function Kurum({ kurumlar, selectedKurum, setSelectedKurum }) {
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

                <Button
                  className="float-end"
                  onClick={() => setSelectedKurum(kurum)}
                  color="success"
                  disabled={selectedKurum && selectedKurum.id === kurum.id}
                >
                  {selectedKurum && selectedKurum.id === kurum.id
                    ? "Seçili"
                    : "Seç"}
                </Button>
              </ListGroupItemHeading>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}
