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
          {kurumlar.map((kurum, index) => (
            <ListGroupItem key={kurum.id}>
              <ListGroupItemHeading>
                <Badge color="info" className="me-2">
                  {index + 1}
                </Badge>
                {kurum.name} {kurum.status === false && "(Pasif)"}
                <Button
                  className="float-end"
                  onClick={() => setSelectedKurum(kurum)}
                  color="success"
                  disabled={
                    (selectedKurum && selectedKurum.id === kurum.id) ||
                    kurum.status === false
                  }
                >
                  {selectedKurum && selectedKurum.id === kurum.id
                    ? "Seçili"
                    : "Seç"}
                </Button>
              </ListGroupItemHeading>

              <ListGroup flush>
                {kurum.types.map((altBirim) => (
                  <ListGroupItem key={altBirim.id}>
                    {altBirim.name}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
}
