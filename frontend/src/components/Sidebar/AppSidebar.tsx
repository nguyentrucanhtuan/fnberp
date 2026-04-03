import {
  ClipboardList,
  CreditCard,
  Home,
  Monitor,
  Package,
  Printer,
  Ruler,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
} from "lucide-react"

import { SidebarAppearance } from "@/components/Common/Appearance"
import { Logo } from "@/components/Common/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import useAuth from "@/hooks/useAuth"
import { type ItemGroup, Main } from "./Main"
import { User } from "./User"

const baseGroups: ItemGroup[] = [
  {
    label: "TỔNG QUAN",
    items: [{ icon: Home, title: "Dashboard", path: "/" }],
  },
  {
    label: "QUẢN LÝ KHO",
    items: [
      { icon: Ruler, title: "Đơn vị tính", path: "/uoms" },
      { icon: Tag, title: "Danh mục", path: "/product-categories" },
      { icon: Package, title: "Sản phẩm", path: "/products" },
      { icon: Warehouse, title: "Kho hàng", path: "/warehouses" },
    ],
  },
  {
    label: "BÁN HÀNG",
    items: [
      { icon: ShoppingCart, title: "Quầy bán hàng", path: "/pos" },
      { icon: ClipboardList, title: "Loại đơn hàng", path: "/order-types" },
      {
        icon: CreditCard,
        title: "Phương thức thanh toán",
        path: "/payment-methods",
      },
      { icon: Printer, title: "Máy in", path: "/printers" },
      { icon: Monitor, title: "Màn hình nhà bếp", path: "/kitchen-screens" },
    ],
  },
]

const adminGroup: ItemGroup = {
  label: "HỆ THỐNG",
  items: [{ icon: Users, title: "Quản trị", path: "/admin" }],
}

export function AppSidebar() {
  const { user: currentUser } = useAuth()

  const groups = currentUser?.is_superuser
    ? [...baseGroups, adminGroup]
    : baseGroups

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <Logo variant="responsive" />
      </SidebarHeader>
      <SidebarContent>
        <Main groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAppearance />
        <User user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
