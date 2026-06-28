import { buildGraph } from "@/lib/graph";

test("buildGraph links projects to skills", () => {
  const { nodes, links } = buildGraph([
    {
      title: "P1",
      period: "",
      role: "",
      tags: ["flutter"],
      short_desc: "",
      stack: ["Dart"],
      metrics: {},
      order_idx: 0,
    },
  ]);
  expect(nodes.find((n) => n.id === "P1")).toBeDefined();
  expect(nodes.find((n) => n.id === "flutter")).toBeDefined();
  expect(links).toContainEqual({ source: "P1", target: "flutter" });
  expect(links).toContainEqual({ source: "P1", target: "Dart" });
});

test("buildGraph dedupes shared skills across projects", () => {
  const { nodes } = buildGraph([
    {
      title: "A",
      period: "",
      role: "",
      tags: ["flutter"],
      short_desc: "",
      stack: [],
      metrics: {},
      order_idx: 0,
    },
    {
      title: "B",
      period: "",
      role: "",
      tags: ["flutter"],
      short_desc: "",
      stack: [],
      metrics: {},
      order_idx: 1,
    },
  ]);
  // skill "flutter" только один узел, но 2 связи
  const flutterNodes = nodes.filter((n) => n.id === "flutter");
  expect(flutterNodes).toHaveLength(1);
});
