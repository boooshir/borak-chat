import { Theme, useTheme } from "remix-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Moon, Settings, Sun } from "lucide-react";
import { Label } from "./ui/label";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Switch } from "./ui/switch";
import { cn } from "~/lib/utils";

export function SettingsDialog() {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("hover:border")}>
          <Settings className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application settings</DialogTitle>
          <DialogDescription></DialogDescription>
          <div>
            <Label>Apperance</Label>
            <Separator className="my-4 border-t" />
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span>Dark mode</span>
              </Label>
              <Switch
                checked={theme === "dark" ? true : false}
                onClick={handleThemeToggle}
                className="border-border"
              />
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
