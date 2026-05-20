import { ArrowUp, CheckCheck, MessageSquare } from "lucide-react";
import React from "react";
import { useFetcher } from "react-router";
import { useWebSocketContext } from "~/components/chat-websocket";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Textarea } from "~/components/ui/textarea";
import { useMessagesStore } from "~/hooks/use-messages-store";
import { useOnlineStatusStore } from "~/hooks/use-online-status-store";
import { useMessagesAutoScroll } from "~/hooks/use-scrollable";
import { useTypingStore } from "~/hooks/use-typing-store";
import { DateFormatDistance } from "~/lib/date-format";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/direct-message.$friendId";

export type DirectMessage = {
  id: number;
  content: string;
  isRead: boolean;
  isOwn: boolean;
  createdAt: Date;
  sender: string;
};

export type DirectMessageResponse = {
  success: boolean;
  message: string;
  data: {
    friendName: string;
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
    messages: DirectMessage[];
  };
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const { authUser } = await import("~/lib/session.server");
  const { token } = await authUser(request);
  const friendId = params.friendId;
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/messages/direct/${friendId}?page=${page}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const result: DirectMessageResponse = await response.json();

  return {
    ...result,
    friendId: friendId,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const { authUser } = await import("~/lib/session.server");
  const { token } = await authUser(request);

  const friendId = params.friendId;

  const formData = await request.formData();
  const content = formData.get("content");

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/messages/direct/${friendId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    },
  );
  const result = await response.json();
  return result;
}

export default function DirectMessageFriend({
  loaderData,
}: Route.ComponentProps) {
  const { data, friendId } = loaderData;

  // initiate hooks
  const messages = useMessagesStore((state) => state.messages);
  const setMessages = useMessagesStore((state) => state.setMessages);
  const prependMessages = useMessagesStore((state) => state.prependMessages);
  const friendStatus = useOnlineStatusStore((state) =>
    state.getStatus(friendId),
  );
  const clearMessages = useMessagesStore((state) => state.clearAll);
  const isTyping = useTypingStore((state) => state.typingStatus[friendId]);

  const {
    messagesEndRef,
    scrollContainerRef,
    saveScrollPosition,
    restoreScrollPosition,
    scrollToBottomInstant,
    scrollToBottomSmooth,
  } = useMessagesAutoScroll();

  //track previous message length for sroll detection
  const prevMessagesLenghtRef = React.useRef(messages.length);

  // Infinite scroll state
  const [currentPage, setCurrentPage] = React.useState(data.currentPage);
  const [hasMore, setHasMore] = React.useState(data.hasMore);
  const prevScrollPositionRef = React.useRef<{
    scrollTop: number;
    scrollHeight: number;
  } | null>(null);

  // add a ref to track if a load more request is pending/queue
  const isLoadingMoreRef = React.useRef<boolean>(false);

  // track if user is near bottm to decide if we should auto-scroll
  const isNearBottomRef = React.useRef<boolean>(true);

  const loadMoreFetcher = useFetcher<typeof loader>();

  const loadMoreMessages = React.useCallback(() => {
    if (
      isLoadingMoreRef.current ||
      loadMoreFetcher.state !== "idle" ||
      !hasMore
    )
      return;
    // set ref to true to indicate a load stating/queued
    isLoadingMoreRef.current = true;
    // handle nextPage
    const nextPage = currentPage + 1;
    // save scroll position before loading more
    prevScrollPositionRef.current = saveScrollPosition();
    loadMoreFetcher.load(`/direct-message/${friendId}?page=${nextPage}`);
  }, [currentPage, hasMore, loadMoreFetcher, friendId]);

  // handle loadMore fetcher response
  React.useEffect(() => {
    if (
      loadMoreFetcher.state === "idle" &&
      loadMoreFetcher.data &&
      loadMoreFetcher?.data?.data?.messages
    ) {
      // reset the isLoadingMoreRef here
      isLoadingMoreRef.current = false;

      const result = loadMoreFetcher.data;
      if (result.data.messages && result.data.messages.length > 0) {
        // Prepend new messages to the beginning of the array
        const reversedMessages = [...result.data.messages].reverse();
        prependMessages(reversedMessages);
        setCurrentPage((prev) => prev + 1);
        setHasMore(result.data.hasMore || false);

        // Restore scroll position after new messages are loaded
        if (prevScrollPositionRef.current) {
          requestAnimationFrame(() => {
            restoreScrollPosition(prevScrollPositionRef.current!);
          });
        }
      } else {
        setHasMore(false);
      }
    } else if (loadMoreFetcher.state === "idle") {
      // event data is not expected, release the lock when idle again
      // this handles potential errors or empty response
      isLoadingMoreRef.current = false;
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
        const threshold = 100; // Load more when within 100px of top

        // update neat bottom status (within 200px of bottom)
        const distanceToBottom =
          scrollElement.scrollHeight - scrollTop - scrollElement.clientHeight;
        isNearBottomRef.current = distanceToBottom < 200;
        if (
          scrollTop < threshold &&
          hasMore &&
          loadMoreFetcher.state === "idle" &&
          !isLoadingMoreRef.current
        ) {
          loadMoreMessages();
        }
      };
      viewport.removeEventListener("scroll", handleScroll);
      viewport.addEventListener("scroll", handleScroll);
      return () => {
        viewport.removeEventListener("scroll", handleScroll);
      };
    }
  }, [hasMore, loadMoreMessages, loadMoreFetcher.state]);

  // load messages when activechat change
  React.useEffect(() => {
    clearMessages();

    const reversedMessages = [...data.messages].reverse();
    setMessages(reversedMessages);
    // scroll to bottom after messages are set
    const timer = setTimeout(() => {
      scrollToBottomInstant();
    }, 100);
    return () => clearTimeout(timer);
  }, [friendId, data.messages]);

  React.useEffect(() => {
    setCurrentPage(data.currentPage);
    setHasMore(data.hasMore);
  }, [friendId]);

  // Handle component mount (page refresh)
  React.useEffect(() => {
    // check if new message were added at the end
    const newMessagesAdded = messages.length > prevMessagesLenghtRef.current;
    prevMessagesLenghtRef.current = messages.length;

    if (newMessagesAdded) {
      const lastMessage = messages[messages.length - 1];
      // always scroll for sent messages
      if (lastMessage.isOwn) {
        scrollToBottomSmooth();
      }
      // only scroll for received message if neat bottom
      else if (isNearBottomRef.current) {
        scrollToBottomSmooth();
      }
    }
  }, [messages, scrollToBottomSmooth]);

  return (
    <div className="flex h-dvh flex-col">
      {/* Chat Header */}
      <header className="flex w-full items-center gap-2 border-b border-border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger />
        <div className="mx-1 h-8 border-r border-border" />
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {data.friendName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <h2 className="font-semibold">{data.friendName}</h2>
            {friendStatus?.isInThisChat ? (
              <div className="flex h-2 w-2 flex-1 rounded-full bg-green-500"></div>
            ) : friendStatus?.isOnline ? (
              <div className="flex h-2 w-2 flex-1 rounded-full bg-yellow-500"></div>
            ) : (
              <div className="flex h-2 w-2 flex-1 rounded-full bg-gray-500"></div>
            )}
            {isTyping && (
              <span className="text-sm text-gray-500">is typing...</span>
            )}
          </div>
        </div>
      </header>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-hidden" ref={scrollContainerRef}>
        <ScrollArea
          className="flex h-dvh w-full flex-col items-center overflow-y-auto p-3 sm:p-4"
          style={{ height: "calc(100dvh - 8rem)" }}
          // ref={scrollContainerRef}
        >
          <div className="relative flex flex-col items-center space-y-4 p-4">
            {!hasMore && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {`This is the beginning of your conversation with ${data.friendName}`}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Send a message to start the conversation
                </p>
              </div>
            )}

            {/* Sample messages - replace with real messages */}

            <div className="w-full flex-col space-y-4 lg:w-1/2 flex">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${message.isOwn ? "order-2" : "order-1"}`}
                  >
                    <p className={message.isOwn ? "text-right" : "text-left"}>
                      {message.sender}
                    </p>
                    <div className="relative">
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {message.isOwn && (
                        <div className="absolute -bottom-2">
                          <CheckCheck
                            className={`h-4 w-4 ${message.isRead && "text-blue-500"}`}
                          />
                        </div>
                      )}
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
      {/* Message Input */}
      <MessageInput friendName={data.friendName} friendId={friendId} />
    </div>
  );
}

function MessageInput({
  friendName,
  friendId,
  // fetcher,
}: {
  friendName: string;
  friendId: string;
  // fetcher: ReturnType<typeof useFetcher<typeof action>>;
}) {
  const [message, setMessage] = React.useState("");
  const fetcher = useFetcher();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const typingTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const typingRef = React.useRef<boolean>(false);
  const { send } = useWebSocketContext();

  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success) {
      setMessage("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // start typing notification
    if (!typingRef.current) {
      typingRef.current = true;
      send({
        type: "typing_start",
        payload: { targetPublicId: friendId },
      });
    }
    if (value.length < 1) {
      typingRef.current = false;
      send({
        type: "typing_stop",
        payload: { targetPublicId: friendId },
      });
    }
    // reset typing timeout
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false;
      if (value.length > 0) {
        send({
          type: "typing_stop",
          payload: { targetPublicId: friendId },
        });
      }
    }, 2000); // 2s delay after last keystroke
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit(
      { content: message },
      { method: "post", action: `/direct-message/${friendId}` },
    );

    // clear typing status
    send({
      type: "typing_stop",
      payload: { targetPublicId: friendId },
    });
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
      <div className="w-full rounded-2xl p-3 backdrop-blur supports-[backdrop-filter]:bg-foreground/20 sm:p-4 lg:w-1/2">
        <fetcher.Form onSubmit={handleSubmit}>
          <div className="relative">
            <Textarea
              ref={inputRef}
              id="content"
              name="content"
              placeholder={`Message ${friendName}...`}
              value={message}
              onChange={handleInputChange}
              className={cn("pr-20")}
              autoComplete="off"
              onKeyDown={handleKeyDown}
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
