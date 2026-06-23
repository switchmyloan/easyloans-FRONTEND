"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Gift,
  FileText,
  Calculator,
  CircleDollarSign,
  CreditCard,
  Headphones,
  Menu,
  X,
  User,
} from "lucide-react";

const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Offers", href: "/dashboard/offers", icon: Gift },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const toolsItems = [
  { label: "EMI Calculator", href: "/dashboard/emi-calculator", icon: Calculator },
];

const loansItems = [
  { label: "Gold Loan", href: "/dashboard/gold-loan", icon: CircleDollarSign },
  { label: "Credit Cards", href: "/dashboard/credit-cards", icon: CreditCard },
];

const supportItems = [
  { label: "FAQs", href: "/dashboard/faq", icon: FileText },
  { label: "Contact Us", href: "/dashboard/contact-us", icon: Headphones },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

  const NavLink = ({ item, onClick }: { item: NavItem; onClick?: () => void }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
          ${active
            ? "bg-violet-600 text-white"
            : "text-gray-600 hover:bg-gray-50"
          }
        `}
      >
        <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "text-gray-400"}`} />
        <span>{item.label}</span>
      </Link>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 pt-1 pb-1">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </span>
    </div>
  );

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center">
          <img
            src="/cready.png"
            alt="Cready"
            className="h-6 w-auto"
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {/* Main Nav Items */}
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavLink key={item.href} item={item} onClick={onClose} />
          ))}
        </div>

        {/* Tools Section */}
        <SectionHeader title="Tools" />
        <div className="space-y-1">
          {toolsItems.map((item) => (
            <NavLink key={item.href} item={item} onClick={onClose} />
          ))}
        </div>

        {/* Loans Section */}
        <SectionHeader title="Loans" />
        <div className="space-y-1">
          {loansItems.map((item) => (
            <NavLink key={item.href} item={item} onClick={onClose} />
          ))}
        </div>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <div className="space-y-1">
          {supportItems.map((item) => (
            <NavLink key={item.href} item={item} onClick={onClose} />
          ))}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-md border border-gray-100"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-55 z-50 shadow-xl bg-white"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-48 border-r border-gray-100 bg-white z-40">
        <SidebarContent />
      </aside>
    </>
  );
}
