import { useEffect, useState } from "react";

export const useTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const defaultTheme = savedTheme || "light";
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return { theme, toggleTheme };
};
