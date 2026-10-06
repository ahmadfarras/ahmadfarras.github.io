import { describe, expect, it } from "vitest";
import { projects } from "./projects";

describe("projects", () => {
  it("has unique ids", () => {
    expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length);
  });

  it.each(projects)("$id links to an https page", ({ href }) => {
    expect(new URL(href).protocol).toBe("https:");
  });

  it.each(projects)("$id has a title, a description and tags", (project) => {
    expect(project.title).not.toBe("");
    expect(project.description).not.toBe("");
    expect(project.tags.length).toBeGreaterThan(0);
  });
});
