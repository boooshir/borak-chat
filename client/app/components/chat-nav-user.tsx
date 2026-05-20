import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useFetcher, useNavigate } from "react-router";
import React, { useRef } from "react";
import { toast } from "sonner";
import { ChevronsUpDown, Copy, LogOut } from "lucide-react";
import { useLayoutData } from "~/hooks/use-layout-data";
import { cn } from "~/lib/utils";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import { Button } from "./ui/button";

export function NavUser() {
  const loaderData = useLayoutData();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const hasDisplayToast = useRef(false);

  React.useEffect(() => {
    if (fetcher?.data?.success === false) {
      toast.error("Opsss Something wrong with this apps");
      hasDisplayToast.current = true;
    }

    if (fetcher?.data?.success === true) {
      toast.success("You are logged out.", {
        description: "See you soon. we waiting for you",
      });
      hasDisplayToast.current = true;
      navigate("/login");
    }
  }, [fetcher.data]);

  function handleCopy() {
    navigator.clipboard
      .writeText(loaderData.user.data.publicId)
      .then(() => {
        toast("Text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }

  function handleLogout() {
    fetcher.submit({}, { method: "post", action: "/logout" });
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem className={cn("p-2")}>
        <Dialog>
          <DialogTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                `border border-border hover:bg-accent/50 hover:text-foreground`,
              )}
            >
              <div className="flex items-center gap-2 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    // src={user.avatar}
                    alt={loaderData.user.data.username}
                  />
                  <AvatarFallback className="rounded-lg uppercase">
                    {loaderData.user.data.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {loaderData.user.data.username}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {loaderData.user.data.email}
                  </span>
                </div>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <dl className="divide-background-foreground divide-y">
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm leading-6 font-medium">User ID</dt>
                <dd className="mt-1 flex items-center justify-between text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">
                  {loaderData.user.data.publicId}
                  <Button variant="ghost" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm leading-6 font-medium">Username</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">
                  {loaderData.user.data.username}
                </dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm leading-6 font-medium">Email</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">
                  {loaderData.user.data.email}
                </dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm leading-6 font-medium">Created</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground sm:col-span-2 sm:mt-0">
                  {new Date(
                    loaderData.user.data.createdAt,
                  ).toLocaleDateString()}
                </dd>
              </div>
            </dl>

            {/* <Separator className={cn("border")} /> */}
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="cursor-pointer hover:text-foreground"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                variant={"destructive"}
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut />
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
