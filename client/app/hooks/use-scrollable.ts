import React from "react";

export function useMessagesAutoScroll() {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // save scroll position
  const saveScrollPosition = React.useCallback((): {
    scrollTop: number;
    scrollHeight: number;
  } | null => {
    if (!scrollContainerRef.current) return null;

    const scrollElement = scrollContainerRef.current.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;

    if (scrollElement) {
      return {
        scrollTop: scrollElement.scrollTop,
        scrollHeight: scrollElement.scrollHeight,
      };
    }
    return null;
  }, []);

  // restore scroll position
  const restoreScrollPosition = React.useCallback(
    (
      prevPosition?: {
        scrollTop: number;
        scrollHeight: number;
      } | null,
    ) => {
      if (!prevPosition || !scrollContainerRef.current) return;
      const scrollElement = scrollContainerRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLDivElement | null;
      if (scrollElement) {
        const newScrollHeight = scrollElement.scrollHeight;
        scrollElement.scrollTop =
          prevPosition.scrollTop +
          (newScrollHeight - prevPosition.scrollHeight);
      }
    },
    [],
  );

  // instant scroll to bottom (animation)
  const scrollToBottomInstant = React.useCallback(() => {
    const scrollElement = scrollContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, []);

  // smooth scroll to bottom (with animation) - only for new messages
  const scrollToBottomSmooth = React.useCallback(() => {
    const scrollElement = scrollContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;

    if (scrollElement) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return {
    messagesEndRef,
    scrollContainerRef,
    scrollToBottomInstant,
    scrollToBottomSmooth,
    saveScrollPosition,
    restoreScrollPosition,
  };
}
