// @vitest-environment jsdom

import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SimulatedViewerCount } from "./SimulatedViewerCount";

afterEach(cleanup);

describe("SimulatedViewerCount", () => {
  it("shows an honest neutral activity label with strong visual hierarchy", () => {
    const view = render(createElement(SimulatedViewerCount, { seed: "piece" }));
    expect(view.getByText("Activity")).toBeTruthy();
    expect(view.getByTitle("Store activity indicator")).toBeTruthy();
    expect(view.queryByText(/simulated|preview|viewers|people viewing/i)).toBeNull();
    expect(view.getByText("Activity").className).toContain("font-black");
    expect(view.getByText("Activity").className).toContain("text-lg");
  });
});
