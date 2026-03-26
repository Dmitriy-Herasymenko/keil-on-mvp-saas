"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useTranslations } from "../hooks/useTranslations";

export default function LogoutButton() {
  const { t } = useTranslations();
  
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4" />
      {t("sidebar.logout")}
    </button>
  );
}
