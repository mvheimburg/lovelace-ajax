import { expect, it } from "vitest";
import { language, localize } from "../src/localize";
it.each(["nb", "nb-NO", "NB_no", "no", "NO_no", "nn"])(
  "supports Norwegian alias %s",
  (value) => {
    expect(localize(language({ language: value }), "close")).toBe("Lukk");
  },
);
it("prefers the active language and falls back safely", () => {
  expect(
    localize(language({ language: "en", locale: { language: "nb" } }), "close"),
  ).toBe("Close");
  expect(localize(language({ locale: { language: "nb" } }), "close")).toBe(
    "Lukk",
  );
  expect(localize(language({ language: "fr" }), "close")).toBe("Close");
  expect(language({ language: "bad locale!" })).toBe("en");
  expect(language()).toBe("en");
});
