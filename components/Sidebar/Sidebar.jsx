"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard" },
  { label: "Discover", icon: "💫", href: "/discover" },
  { label: "Jobs", icon: "🔍", href: "/jobs" },
  { label: "Applications", icon: "💼", href: "/applications" },
  { label: "Calendar", icon: "📅", href: "/calendar" },
  { label: "Documents", icon: "📄", href: "/documents" },
  { label: "Stats", icon: "📊", href: "/stats" },
  { label: "Settings", icon: "⚙️", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>💼</span>
        <span>SwipeHire</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.userCard}>
        <div className={styles.userAvatar}>V</div>
        <div>
          <p className={styles.userName}>Vedant P.</p>
          <p className={styles.userEmail}>vedant@example.com</p>
        </div>
      </div>
    </aside>
  );
}