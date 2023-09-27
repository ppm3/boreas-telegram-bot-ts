type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = Array<JSONValue>;

export interface sensorAvarage {
  sensor: string;
  value: number;
}
