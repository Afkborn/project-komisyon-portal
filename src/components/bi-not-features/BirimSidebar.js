import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  ListGroup,
  ListGroupItem,
  Badge,
} from "reactstrap";

export default function BirimSidebar({ units, selectedKey, onSelect }) {
  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="bg-light d-flex align-items-center justify-content-between">
        <h6 className="mb-0">
          <i className="fas fa-layer-group me-2"></i>
          Birimler
        </h6>
      </CardHeader>
      <CardBody className="p-0">
        <ListGroup flush>
          {units.map((unit) => {
            const isActive = unit.key === selectedKey;
            return (
              <ListGroupItem
                key={unit.key}
                action
                onClick={() => onSelect(unit)}
                className={`d-flex align-items-center justify-content-between ${
                  isActive ? "bg-danger text-white" : ""
                }`}
                style={{ cursor: "pointer" }}
              >
                <span className="fw-bold">
                  {unit.iconClass && (
                    <i className={`${unit.iconClass} me-2`}></i>
                  )}
                  {unit.label}
                </span>

                {unit.kind && (
                  <Badge
                    color={isActive ? "light" : "secondary"}
                    className={isActive ? "text-dark" : ""}
                    pill
                  >
                    {unit.kind}
                  </Badge>
                )}
              </ListGroupItem>
            );
          })}
        </ListGroup>
      </CardBody>
    </Card>
  );
}
