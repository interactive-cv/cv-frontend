import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Timeline from "@/components/landing/Timeline";

const projects = [
  {
    title: "Магазин ЕС",
    period: "Дек 2025 – наст",
    role: "Fullstack",
    tags: ["flutter"],
    short_desc: "desc1",
    stack: ["Flutter"],
    metrics: {},
    order_idx: 0,
  },
  {
    title: "Маркетплейсы",
    period: "2025",
    role: "Backend",
    tags: ["java"],
    short_desc: "desc2",
    stack: ["Spring"],
    metrics: {},
    order_idx: 1,
  },
];

test("renders projects and opens modal on click", async () => {
  render(<Timeline projects={projects} />);
  expect(screen.getByText("Магазин ЕС")).toBeInTheDocument();
  await userEvent.click(screen.getByText("Маркетплейсы"));
  expect(screen.getByText(/desc2/)).toBeVisible();
});
