import { describe, expect, it } from "vitest";
import { parseNwicWindCsv } from "./dataSources";

describe("NWIC hourly wind CSV", () => {
  it("normalizes the provided Uttar Pradesh SW schema", () => {
    const csv = [
      "SlNo,Station,Agency,State LGD Code,State,District LGD Code,District,Tehsil,Block,Village,River,Basin,Tributary,Subtributary,SubSubtributary,Local River,Latitude,Longitude,Data Acquisition Time,Telemetry Hourly Wind Speed (Km/Hr)",
      "1,ADWA AWS,Uttar Pradesh SW,9,Uttar Pradesh,170,MIRZAPUR,-,-,-,-,-,-,-,-,-,24.76945870,82.33034840,12-01-2026 23:00,57",
    ].join("\n");
    const [observation] = parseNwicWindCsv(csv);
    expect(observation.sensorKey).toBe("NWIC-WIND-ADWA-AWS");
    expect(observation.metric).toBe("wind_speed_hourly");
    expect(observation.value).toBe(57);
    expect(observation.unit).toBe("km/h");
    expect(observation.observedAt.toISOString()).toBe("2026-01-12T17:30:00.000Z");
    expect(observation.source).toBe("NWIC");
  });
});
