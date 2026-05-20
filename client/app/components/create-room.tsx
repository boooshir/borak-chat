import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Dialog,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useFetcher } from "react-router";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "~/lib/utils";
import { Switch } from "./ui/switch";
import React from "react";
import { toast } from "sonner";
import { useChatContext } from "./chat-provider";

export function CreateRoomDialog() {
  const fetcher = useFetcher();
  const [isPrivate, setIsPrivate] = React.useState(true);
  const [roomName, setRoomName] = React.useState<string>("");
  const { rooms, setRooms } = useChatContext();
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (fetcher?.data?.success === true) {
      toast.success("Create room is success", {
        description: fetcher.data.message,
      });
      if (rooms.some((room) => room.publicId !== fetcher.data.data.publicId)) {
        setRooms([...rooms, fetcher.data.data]);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setRoomName("");
      setTimeout(() => {
        setOpen(false);
      }, 500);
    }
  }, [fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a room</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <fetcher.Form
            method="post"
            className="flex flex-col gap-3"
            action="/rooms"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="roomName"
                aria-invalid={fetcher?.data?.success === false}
                className={cn("aria-invalid:text-destructive")}
              >
                Room name
              </Label>
              <div className="flex flex-col gap-1.5">
                <Input
                  ref={inputRef}
                  id="roomName"
                  name="roomName"
                  onChange={(e) => setRoomName(e.currentTarget.value)}
                  type="text"
                  className="border-border"
                  placeholder="room name..."
                  aria-invalid={fetcher?.data?.success === false}
                />
                {fetcher?.data?.success === false && (
                  <small className="text-destructive">
                    {fetcher?.data?.message}
                  </small>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="isPrivate">Private Status</Label>

                <Switch
                  id="isPrivate"
                  name="isPrivate"
                  className="border-border"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(checked)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                name="intent"
                value="create-room"
                disabled={roomName === "" ? true : false}
              >
                Create
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
