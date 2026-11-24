import { ChartColumn, Droplets, LayoutDashboard, UserRound } from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    description: "A summary of your glucose readings will appear here.",
  },
  {
    title: "Readings",
    path: "/readings",
    icon: Droplets,
    description: "Logged glucose readings will appear here.",
  },
  {
    title: "Reports",
    path: "/reports",
    icon: ChartColumn,
    description: "Glucose trends and reports will appear here.",
  },
  {
    title: "Profile",
    path: "/profile",
    icon: UserRound,
    description: "Account details will appear here.",
  },
];

export function getNavigationItem(pathname) {
  return navigation.find((item) => item.path === pathname) ?? null;
}
