import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { createRouter } from "./router";

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  const router = createRouter();

  root.render(<RouterProvider router={router} />);
}
