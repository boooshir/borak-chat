import { useFetcher } from "react-router";
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
import { Loader2, Plus } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "~/lib/utils";
import React from "react";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

export function RequestFriendDialog() {
  const fetcher = useFetcher();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (fetcher?.data?.success === false) {
      toast.error(fetcher.data.message);
    }

    if (fetcher?.data?.success === true) {
      toast.success("Success Add Friends.", {
        description: fetcher.data.message,
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }, [fetcher.data]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("hover:border")}>
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <fetcher.Form method="post" action="/request-friend">
          <DialogHeader>
            <DialogTitle>Add Friends</DialogTitle>
            <DialogDescription>Let's connect to the world</DialogDescription>
          </DialogHeader>
          <Separator className="my-2 w-full" />
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label
                htmlFor="FriendPublicId"
                aria-invalid={
                  fetcher.state !== "submitting" &&
                  fetcher?.data?.success === false
                }
                className="aria-invalid:text-destructive"
              >
                User Id
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  ref={inputRef}
                  id="friendPublicId"
                  name="friendPublicId"
                  placeholder="Friend ID"
                  autoComplete="off"
                  aria-invalid={
                    fetcher.state !== "submitting" &&
                    fetcher?.data?.success === false
                  }
                  autoFocus
                  required
                />
                {fetcher.state !== "submitting" && !fetcher?.data?.success && (
                  <small className="text-destructive">
                    {fetcher.data?.errors.friendPublicId}
                  </small>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className={cn("pt-4")}>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="cursor-pointer hover:text-foreground"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={fetcher.state === "submitting"}
            >
              {fetcher.state === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Send"
              )}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
