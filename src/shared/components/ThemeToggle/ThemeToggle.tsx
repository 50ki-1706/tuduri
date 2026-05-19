/**
 * テーマ切り替えボタンのUIコンポーネント
 * tuduri-light と tuduri-dark を切り替え、localStorage に永続化する
 */
"use client";

import { useCallback, useEffect, useState } from "react";

/** localStorage のテーマキー */
const THEME_KEY = "tuduri-theme";

/** ライトテーマ名 */
const LIGHT = "tuduri-light";

/** ダークテーマ名 */
const DARK = "tuduri-dark";

/**
 * テーマ切り替えボタンコンポーネント
 * 現在のテーマを localStorage から読み取り、クリックで切り替える
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  // マウント時に現在のテーマを取得
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const current =
      stored ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? DARK
        : LIGHT);
    setTheme(current);
  }, []);

  // テーマが変わるたびに data-theme 属性と localStorage を更新
  useEffect(() => {
    if (!theme) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  /** テーマを切り替える */
  const toggle = useCallback(() => {
    setTheme((prev) => (prev === LIGHT ? DARK : LIGHT));
  }, []);

  // 初期表示前は何も表示しない（フラッシュ防止）
  if (!theme) return null;

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={toggle}
      aria-label="テーマを切り替える"
    >
      {theme === LIGHT ? "ダーク" : "ライト"}
    </button>
  );
}
