import { getVariant } from "@/lib/api";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ slug: "staffty", title: "T", content_markdown: "# m" }),
  })
) as jest.Mock;

test("getVariant returns parsed CV", async () => {
  const v = await getVariant("staffty");
  expect(v.slug).toBe("staffty");
});
