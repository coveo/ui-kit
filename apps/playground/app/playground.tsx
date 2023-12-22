"use client";

import { AppShell, Burger, Flex, NavLink, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Playground(props: React.PropsWithChildren) {
  const { children } = props;
  const navLinks = ["Sandbox", "CDN"] as const;
  const pathName = usePathname();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex align="center">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="md" />
          <Text size="xl" m="sm">
            Relay Playground
          </Text>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navLinks.map((navLink, i) => {
          const href = `/${navLink.toLowerCase()}`;
          const isDefault = i === 0 && pathName === "/";
          const matchesPath = href === pathName;

          return (
            <NavLink
              key={i}
              component={Link}
              href={href}
              label={navLink}
              variant="subtle"
              active={isDefault || matchesPath}
            />
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
