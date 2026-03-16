import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "个人做账 & 储蓄系统",
  description: "Personal accounting and savings tracker",
};

const navLinks = [
  { href: "/", label: "概览" },
  { href: "/transactions", label: "交易记录" },
  { href: "/savings", label: "储蓄目标" },
  { href: "/stats", label: "分类统计" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-6 h-14">
            <span className="font-bold text-lg">💰 记账本</span>
            <nav className="flex gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
