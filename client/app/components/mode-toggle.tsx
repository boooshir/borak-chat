import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme, Theme } from "remix-themes";
import type React from "react";

export function ModeToggle() {
  const [theme, setTheme] = useTheme();
  function handleThemeToggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (theme === "light") {
      setTheme(Theme.DARK);
    }
    if (theme === "dark") {
      setTheme(Theme.LIGHT);
    }
  }

  return (
    <Button variant={"secondary"} size={"icon"} onClick={handleThemeToggle}>
      {theme === "light" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
