import moment from "moment";

export const DEFAULT_DATE_FORMAT = "YYYY/MM/DD";
export const formatDate = (date, format = DEFAULT_DATE_FORMAT) => {
  if (!date) {
    return null;
  }
  return moment(date).format(format);
};

export const DateRenderer = (params) => {
  debugger;
  return params.value ? formatDate(params.value, DEFAULT_DATE_FORMAT) : "";
};

export const getData = () => {
  var data = [];
  for (var i = 0; i < 20; i++) {
    data.push({
      a: "Green " + i * 2,
      b: "Green " + i * 3 + 11,
      c: "Blue " + i * 3 + 155,
      d: "Red " + i * 4 + 265,
      e: "Yellow " + i + 23,
    });
  }
  return data;
};
