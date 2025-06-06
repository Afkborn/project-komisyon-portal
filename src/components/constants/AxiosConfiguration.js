const GET_institutions = {
  method: "GET",
  url: "/api/institutions",
};

const GET_titles = (token) => {
  return {
    method: "GET",
    url: "/api/titles",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const DELETE_titles = (_id, token) => {
  return {
    method: "DELETE",
    url: "/api/titles/" + _id,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const POST_titles = (newUnvanName, kind, token, newUnvanOncelikSira,  deletable = true) => {
  return {
    method: "POST",
    url: "/api/titles/",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name: newUnvanName,
      kind: kind,
      oncelikSirasi: newUnvanOncelikSira,
      deletable,
    },
  };
};

const PUT_titles = (_id, newUnvanName, kind, newOncelikSirasi, token,  deletable = true) => {
  return {
    method: "PUT",
    url: "/api/titles/" + _id,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name: newUnvanName,
      oncelikSirasi : newOncelikSirasi,
      kind: kind,
      deletable,
    },
  };
};

const GET_USER_DETAILS = (token) => {
  return {
    method: "GET",
    url: "/api/users/details",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const GET_UNITS_BY_INSTITUTİON = (_id, token) => {
  return {
    method: "GET",
    url: "/api/units/institution/" + _id,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const GET_UNIT_TYPES = (_id) => {
  return {
    method: "GET",
    url: "/api/unit_types",
    params: {
      institutionTypeId: _id,
    },
  };
};

const DELETE_UNIT = (_id, token) => {
  return {
    method: "DELETE",
    url: "/api/units/" + _id,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

module.exports = {
  GET_institutions,
  GET_titles,
  GET_USER_DETAILS,
  POST_titles,
  PUT_titles,
  DELETE_titles,
  GET_UNITS_BY_INSTITUTİON,
  GET_UNIT_TYPES,
  DELETE_UNIT,
};
