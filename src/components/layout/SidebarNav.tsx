import React from 'react';
import { Calendar, FileText, Users, Stethoscope, Settings, Tablet } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const mainItems = [
  { title: 'Programări', url: '/scheduling', icon: Calendar },
  { title: 'Formulare', url: '/forms', icon: FileText },
  { title: 'Pacienți', url: '/patients', icon: Users },
  { title: 'Consulturi', url: '/consultations', icon: Stethoscope },
  { title: 'Tabletă', url: '/tablet', icon: Tablet },
];

const footerItems = [
  { title: 'Setări', url: '/settings', icon: Settings },
];

export default function SidebarNav() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      style={{
        '--sidebar-background': '210 40% 15%',
        '--sidebar-foreground': '0 0% 95%',
        '--sidebar-accent': '204 98% 38%',
        '--sidebar-accent-foreground': '0 0% 100%',
        '--sidebar-border': '210 30% 22%',
      } as React.CSSProperties}
    >
      <SidebarContent className="pt-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                      activeClassName="!bg-sidebar-accent !text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
              >
                <NavLink
                  to={item.url}
                  end
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
                  activeClassName="!bg-sidebar-accent !text-sidebar-accent-foreground"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
