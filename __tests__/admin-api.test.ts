global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
) as jest.Mock;

test("listApplications fetches /admin/applications with token", async () => {
  const { listApplications } = await import("@/lib/admin");
  const result = await listApplications("test-token");
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/admin/applications"),
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
    })
  );
  expect(result).toEqual([]);
});
