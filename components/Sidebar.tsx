"use client";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";

import logo from "@/public/logo.png";
import Link from "next/link";

import {
    UsersThreeIcon,
    FileTextIcon,
    GearIcon,
    GpsFixIcon,
    GameControllerIcon,
    CreditCardIcon,
    VectorThreeIcon,
    ChartLineIcon,
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import GridIcon from "@/public/GridIcon";
import { usePermissions } from "@/hooks/usePermissions";

type SidebarLink = {
    icon?: React.ComponentType<IconProps>;
    iconProps?: IconProps;
    customIcon?: (isActive: boolean) => React.ReactNode;
    name: string;
    url: string;
    requiredPermissions?: string[];
    requireAny?: boolean;
};

const links: Array<{
    section: string;
    items: SidebarLink[];
}> = [
    {
        section: "Geral",
        items: [
            {
                customIcon: (isActive: boolean) => (
                    <GridIcon
                        width={24}
                        height={24}
                        fill={isActive}
                        color={isActive ? "#009DD5" : undefined}
                    />
                ),
                name: "Dashboard",
                url: "/",
            },
            {
                icon: UsersThreeIcon,
                iconProps: { size: 24 },
                name: "Usuários",
                url: "/usuarios",
                requiredPermissions: ["user_view"],
            },
            {
                icon: GpsFixIcon,
                iconProps: { size: 24 },
                name: "Agentes",
                url: "/agentes",
                requiredPermissions: ["agent_view"],
            },
            {
                icon: CreditCardIcon,
                iconProps: { size: 24 },
                name: "Pacotes",
                url: "/pacotes",
                requiredPermissions: [
                    "wallet_view",
                    "ggr_view",
                    "orders_view",
                    "signature_view",
                ],
                requireAny: true,
            },
            {
                icon: GameControllerIcon,
                iconProps: { size: 24 },
                name: "Jogos",
                url: "/jogos",
                requiredPermissions: ["games_view"],
            },
            {
                icon: VectorThreeIcon,
                iconProps: { size: 24 },
                name: "Fornecedores",
                url: "/fornecedores",
                requiredPermissions: ["provider_view", "distributor_view"],
                requireAny: true,
            },
            {
                icon: ChartLineIcon,
                iconProps: { size: 24 },
                name: "Relatórios",
                url: "/relatorios",
                requiredPermissions: [
                    "logs_view",
                    "logs_agent_view",
                    "logs_ggr_view",
                    "agent_view_report",
                    "ggr_view",
                ],
                requireAny: true,
            },
        ],
    },
    {
        section: "Configurações",
        items: [
            // {
            //     icon: <PaletteIcon size={24} />,
            //     name: "Customização Esporte",
            //     url: "/custom",
            // },
            {
                icon: GearIcon,
                iconProps: { size: 24 },
                name: "Configurações",
                url: "/configuracoes",
                requiredPermissions: ["setting_view"],
            },
        ],
    },
    {
        section: "Suporte",
        items: [
            {
                icon: FileTextIcon,
                iconProps: { size: 24 },
                name: "documentação",
                url: "https://api.playfivers.com/docs/api",
            },
        ],
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const { loading, hasPermission } = usePermissions();

    const renderSkeleton = () => (
        <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, sectionIndex) => (
                <div
                    key={`skeleton-${sectionIndex}`}
                    className="space-y-2 text-sm"
                >
                    <div className="h-3 w-24 bg-foreground/10 rounded" />
                    <ul className="space-y-2">
                        {[...Array(4)].map((__, itemIndex) => (
                            <li
                                key={`skeleton-item-${sectionIndex}-${itemIndex}`}
                                className="py-1 px-6"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded bg-foreground/10" />
                                    <span className="h-3 flex-1 rounded bg-foreground/10" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );

    const getVisibleItems = (items: SidebarLink[]) =>
        items.filter((item) =>
            hasPermission(item.requiredPermissions, {
                any: item.requireAny,
            })
        );

    return (
        <>
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                />
            )}

            <div
                className={`
                fixed md:sticky md:translate-x-0 transition-transform duration-300 ease-in-out z-40
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                h-svh py-4 pl-4 left-0 top-0 w-64 md:w-auto
            `}
            >
                <aside
                    id="sidebar"
                    className="bg-background-primary h-full px-2 py-4 rounded-md shadow-lg md:shadow-none"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                            <Image
                                src={logo.src}
                                height={logo.height}
                                width={logo.width}
                                alt="logo"
                                className="size-9"
                            />
                            <span className="font-black text-2xl text-primary">
                                Playfiver
                            </span>
                        </div>

                        <div className="overflow-y-auto">
                            {loading
                                ? renderSkeleton()
                                : links
                                      .map((linkGroup) => {
                                          const visibleItems = getVisibleItems(
                                              linkGroup.items
                                          );
                                          if (visibleItems.length === 0) {
                                              return null;
                                          }

                                          return (
                                              <div
                                                  key={linkGroup.section}
                                                  className="space-y-2 text-sm"
                                              >
                                                  <p className="text-foreground/50 font-light">
                                                      {linkGroup.section}
                                                  </p>
                                                  <ul className="space-y-2">
                                                      {visibleItems.map(
                                                          (item) => {
                                                              const isActive =
                                                                  pathname ===
                                                                  item.url;
                                                              const linkProps =
                                                                  {
                                                                      href: item.url,
                                                                      className:
                                                                          "flex items-center gap-2",
                                                                      onClick:
                                                                          onClose,
                                                                  } as const;

                                                              const renderIcon =
                                                                  () => {
                                                                      if (
                                                                          item.customIcon
                                                                      ) {
                                                                          return item.customIcon(
                                                                              isActive
                                                                          );
                                                                      }

                                                                      const IconComponent =
                                                                          item.icon;
                                                                      if (
                                                                          !IconComponent
                                                                      ) {
                                                                          return null;
                                                                      }

                                                                      const baseProps =
                                                                          item.iconProps ||
                                                                          {};
                                                                      const activeProps =
                                                                          isActive
                                                                              ? {
                                                                                    weight: "fill" as IconProps["weight"],
                                                                                    color: "#009DD5",
                                                                                }
                                                                              : {};

                                                                      return (
                                                                          <IconComponent
                                                                              {...baseProps}
                                                                              {...activeProps}
                                                                          />
                                                                      );
                                                                  };

                                                              return (
                                                                  <li
                                                                      className="py-1 px-6 text-foreground/50 relative"
                                                                      key={
                                                                          item.name
                                                                      }
                                                                      id={`link-${item.url.replace(
                                                                          "/",
                                                                          ""
                                                                      )}`}
                                                                  >
                                                                      {isActive && (
                                                                          <div className="absolute h-full w-1 left-0 top-0 bg-primary"></div>
                                                                      )}
                                                                      <Link
                                                                          {...linkProps}
                                                                      >
                                                                          {renderIcon()}
                                                                          <span
                                                                              className={`${
                                                                                  isActive
                                                                                      ? "font-semibold text-foreground"
                                                                                      : ""
                                                                              }`}
                                                                          >
                                                                              {
                                                                                  item.name
                                                                              }
                                                                          </span>
                                                                      </Link>
                                                                  </li>
                                                              );
                                                          }
                                                      )}
                                                  </ul>
                                              </div>
                                          );
                                      })
                                      .filter(Boolean)}
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default Sidebar;
