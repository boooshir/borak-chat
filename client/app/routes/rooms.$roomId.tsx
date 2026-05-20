import { SidebarTrigger } from "~/components/ui/sidebar";
import type { Route } from "./+types/rooms.$roomId";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import React from "react";
import { useRoomMessagesStore } from "~/hooks/use-room-messages-store";
import { DateFormatDistance } from "~/lib/date-format";
import { ScrollArea } from "~/components/ui/scroll-area";
import { ArrowUp, EllipsisVertical, MessageSquare } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Await, useFetcher, useRouteLoaderData } from "react-router";
import { useMessagesAutoScroll } from "~/hooks/use-scrollable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

export async function loader({ request, params }: Route.LoaderArgs) {
  const { authUser } = await import("~/lib/session.server");
  const { token } = await authUser(request);
  const roomId = params.roomId;
  const url = new URL(request.url);

  const page = url.searchParams.get("page") || "1";

  const resposeMessages = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/rooms/${roomId}/messages?page=${page}`,
    {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const responseRoomMembers = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/rooms/${roomId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const resultRoomMembers = responseRoomMembers.json();
  const resultMessages = await resposeMessages.json();

  return { resultMessages, resultRoomMembers, roomId };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { authUser } = await import("~/lib/session.server");
  const { token } = await authUser(request);
  const roomId = params.roomId;

  const formData = await request.formData();
  const content = formData.get("content");

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/rooms/${roomId}/messages`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    },
  );
  const result = await response.json();
  return { result };
}

export default function RoomIdPage({ loaderData }: Route.ComponentProps) {
  const { resultMessages, roomId } = loaderData;
  const setMessages = useRoomMessagesStore((state) => state.setMessages);
  const messages = useRoomMessagesStore((state) => state.messages);
  const prependMessages = useRoomMessagesStore(
    (state) => state.prependMessages,
  );
  const clearMessages = useRoomMessagesStore((state) => state.clearAll);

  const {
    scrollToBottomSmooth,
    messagesEndRef,
    saveScrollPosition,
    restoreScrollPosition,
    scrollToBottomInstant,
    scrollContainerRef,
  } = useMessagesAutoScroll();

  // track previous message length for scroll destectio
  const prevMessagesLengthRef = React.useRef<number>(messages.length);

  // infinite scroll state
  const [currentPage, setCurrentPage] = React.useState<number>(
    resultMessages.data.currentPage,
  );
  const [hasMore, setHasMore] = React.useState(
    resultMessages.data.hasMore || false,
  );
  const prevScrollPositionRef = React.useRef<{
    scrollTop: number;
    scrollHeight: number;
  } | null>(null);

  //tract if user is near bottom to decide if we need auto-scroll
  const isNearBottomRef = React.useRef<boolean>(true);

  const loadMoreFetcher = useFetcher<typeof loader>();

  const loadMoreMessages = React.useCallback(() => {
    if (loadMoreFetcher.state !== "idle" || !hasMore) return;
    const nextPage = currentPage + 1;
    // save scroll position before loading more
    prevScrollPositionRef.current = saveScrollPosition();
    loadMoreFetcher.load(`/rooms/${roomId}?page=${nextPage}`);
  }, [currentPage, hasMore, loadMoreFetcher, roomId, prevScrollPositionRef]);

  // handle loadMore fetcher response
  React.useEffect(() => {
    if (
      loadMoreFetcher.state == "idle" &&
      loadMoreFetcher.data &&
      loadMoreFetcher?.data?.resultMessages?.data.messages
    ) {
      const result = loadMoreFetcher.data;
      if (
        result.resultMessages.data.messages &&
        result.resultMessages.data.messages.length > 0
      ) {
        //prepend new Message to the begining of array
        const reversedMessages = [
          ...result.resultMessages.data.messages,
        ].reverse();
        prependMessages(reversedMessages);
        setCurrentPage((prev) => prev + 1);
        setHasMore(result.resultMessages.data.hasMore || false);

        // restore scroll position after new messages are load
        if (prevScrollPositionRef.current) {
          requestAnimationFrame(() => {
            restoreScrollPosition(prevScrollPositionRef.current);
          });
        }
      } else {
        setHasMore(false);
      }
    }
  }, [
    loadMoreFetcher.state,
    loadMoreFetcher.data,
    prependMessages,
    restoreScrollPosition,
  ]);

  // set up scroll listener
  React.useEffect(() => {
    const viewport = scrollContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    if (viewport) {
      const handleScroll = (e: Event) => {
        const scrollElement = e.target as HTMLDivElement;
        const scrollTop = scrollElement.scrollTop;
        const threshold = 100; // Loadmore when within 100px of top
        // update neat bottom status (within 200px of bottom)
        const distanceToBottom =
          scrollElement.scrollHeight - scrollTop - scrollElement.clientHeight;
        isNearBottomRef.current = distanceToBottom < 200;
        if (
          scrollTop < threshold &&
          hasMore &&
          loadMoreFetcher.state === "idle"
        ) {
          loadMoreMessages();
        }
      };
      viewport.addEventListener("scroll", handleScroll);
      return () => {
        viewport.removeEventListener("scroll", handleScroll);
      };
    }
  }, [hasMore, loadMoreMessages, loadMoreFetcher.state]);

  // load message when active chat change
  React.useEffect(() => {
    // clear messages before load new messages
    clearMessages();
    const reversedMessages = [...resultMessages.data.messages].reverse();
    setMessages(reversedMessages);
    // scroll to bottom after messages area set
    const timer = setTimeout(() => {
      scrollToBottomInstant();
    }, 100);
    return () => clearTimeout(timer);
  }, [roomId]);

  // Handle component mount (page refresh)
  React.useEffect(() => {
    // check if new messages were added at the end
    const newMessagesAdded = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;

    if (newMessagesAdded) {
      const lastMessage = messages[messages.length - 1];
      // always scroll for sent messages
      if (lastMessage.isOwn) {
        scrollToBottomSmooth();
      }
      // only scroll for receiverd message if new bottom
      else if (isNearBottomRef.current) {
        scrollToBottomInstant();
      }
    }
  }, [messages, scrollToBottomSmooth, scrollToBottomInstant]);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex w-full flex-shrink-0 items-center justify-between gap-2 border-b p-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="mx-1 h-8 border-r border-border" />
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs uppercase">
                {loaderData.resultMessages.data.roomName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <h2 className="font-semibold">
                {loaderData.resultMessages.data.roomName}
              </h2>
            </div>
          </div>
        </div>
        <ListMemberSheet />
      </header>
      <div className="flex-1 overflow-y-hidden" ref={scrollContainerRef}>
        <ScrollArea
          className="flex h-dvh w-full flex-col items-center overflow-y-auto p-3 sm:p-4"
          style={{ height: "calc(100dvh - 8rem)" }}
        >
          <div className="relative flex flex-col items-center space-y-4 p-4">
            {/* Welcome message */}
            {!hasMore && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg">
                  {`Let's start new conversation with ${resultMessages.data.roomName} group`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Send a message to start the conversation
                </p>
              </div>
            )}

            {/* Sample messages - replace with real messages */}

            <div className="flex w-full flex-col space-y-4 lg:w-1/2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${message.isOwn ? "order-2" : "order-1"}`}
                  >
                    <p>{message.sender}</p>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p
                      className={`mt-1 px-3 text-xs text-muted-foreground ${message.isOwn ? "text-end" : "text-start"}`}
                    >
                      {DateFormatDistance(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-px" />
            </div>
          </div>
        </ScrollArea>
      </div>

      <MessageInput
        roomName={loaderData.resultMessages.data.room_name}
        roomId={loaderData.roomId}
      />
    </div>
  );
}

function MessageInput({
  roomName,
  roomId,
}: {
  roomName: string;
  roomId: string;
}) {
  const [message, setMessage] = React.useState("");
  const fetcher = useFetcher();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const typingTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success) {
      setMessage("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setMessage(e.currentTarget.value);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit(
      { content: message },
      { method: "post", action: `/rooms/${roomId}` },
    );

    setMessage("");
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // check if enter key was press
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="mb-3 flex w-full items-center justify-center lg:mb-0">
      <div className="w-full rounded-2xl border p-3 sm:p-4 lg:w-1/2">
        <fetcher.Form onSubmit={handleSubmit}>
          <div className="relative">
            <Textarea
              id="content"
              name="content"
              placeholder={`Message in ${roomName}...`}
              value={message}
              onChange={handleInputChange}
              className={cn("pr-20")}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              disabled={fetcher.state === "submitting"}
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 transform gap-1">
              <Button
                size="icon"
                className="h-8 w-8"
                type="submit"
                disabled={fetcher.state === "submitting"}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}

function ListMemberSheet() {
  const { resultRoomMembers } = useRouteLoaderData("routes/rooms.$roomId");
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <EllipsisVertical />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Member List</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          <React.Suspense fallback="Loading...">
            <Await resolve={resultRoomMembers}>
              {(initialize) => (
                <>
                  {initialize.data.map((item: any, index: any) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-border bg-muted">
                        {item.username.slice(0, 2)}
                      </div>
                      <p>{item.username}</p>
                      <small className="rounded-full bg-green-700 px-1">
                        {item.isAdmin && "admin"}
                      </small>
                    </div>
                  ))}
                </>
              )}
            </Await>
          </React.Suspense>
        </div>
      </SheetContent>
    </Sheet>
  );
}
