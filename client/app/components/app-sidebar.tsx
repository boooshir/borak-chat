import React from "react";
import {
  MessageSquare,
  Users,
  Search,
  Medal,
  Lock,
  UserPlus,
  ClockArrowUp,
  ClockArrowDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarMenuSkeleton,
} from "~/components/ui/sidebar";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { NavLink, useLocation } from "react-router";
import { NavUser } from "./chat-nav-user";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useChatContext } from "./chat-provider";
import { SettingsDialog } from "./app-setting-dialog";
import { RequestFriendDialog } from "./app-request-friend-dialog";
import { CreateRoomDialog } from "./create-room";

export function AppSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const location = useLocation();
  const { friends, friendsLoading, rooms, roomsLoading } = useChatContext();
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <Medal className="h-5 w-5" />
            <h1 className="text-xl font-bold">Borak Inc</h1>
          </div>
          <SettingsDialog />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          <NavLink
            to="/direct-message"
            className={cn(
              "flex flex-1 items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
              location.pathname.includes("/direct-message")
                ? "border-b-2 bg-primary"
                : "hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <MessageSquare className="h-4 w-4" />
          </NavLink>
          <NavLink
            to="/rooms"
            className={cn(
              "flex flex-1 items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
              location.pathname.includes("/rooms")
                ? "border-b-2 bg-primary"
                : "hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Users className="h-4 w-4" />
          </NavLink>
          <NavLink
            to="/request"
            className={cn(
              "flex flex-1 items-center justify-center gap-2 p-3 text-sm font-medium transition-colors",
              location.pathname.includes("/request")
                ? "border-b-2 bg-primary"
                : "hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <UserPlus className="h-4 w-4" />
          </NavLink>
        </div>

        {/* Content based on active tab */}
        {location.pathname.includes("direct-message") && (
          <>
            <SearchInput
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-2">
                <span>Friends ({filteredFriends.length})</span>
                <div className="flex items-center gap-1">
                  <RequestFriendDialog />
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {friendsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuSkeleton />
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <ScrollArea>
                      {filteredFriends.map((friend) => (
                        <SidebarMenuItem key={friend.id}>
                          <NavLink to={`/direct-message/${friend.id}`}>
                            {({ isActive }) => (
                              <SidebarMenuButton
                                isActive={isActive}
                                className={cn("h-auto justify-start p-3")}
                              >
                                <div className="flex w-full items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={friend.avatar} />
                                      <AvatarFallback className="text-xs">
                                        {friend.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                      {friend.name}
                                    </p>
                                  </div>
                                </div>
                              </SidebarMenuButton>
                            )}
                          </NavLink>
                        </SidebarMenuItem>
                      ))}
                    </ScrollArea>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {location.pathname.includes("rooms") && (
          <>
            <SearchInput
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between px-4 py-2">
                <span>Rooms ({filteredRooms.length})</span>
                {/* <Button variant="ghost" size="icon" className="h-6 w-6"> */}
                {/*   <Plus className="h-3 w-3" /> */}
                {/* </Button> */}
                <CreateRoomDialog />
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {roomsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuSkeleton />
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <ScrollArea>
                      {filteredRooms.map((room) => (
                        <SidebarMenuItem key={room.publicId}>
                          <NavLink to={`/rooms/${room.publicId}`}>
                            {({ isActive }) => (
                              <SidebarMenuButton
                                isActive={isActive}
                                className={cn("h-auto justify-start p-3")}
                              >
                                <div className="flex w-full items-center gap-3">
                                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                                    <Users className="h-4 w-4" />
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex min-w-0 items-center justify-between gap-2">
                                          <p className="flex-1 truncate text-sm font-medium">
                                            {room.name.length > 15
                                              ? room.name.slice(0, 15) + "..."
                                              : room.name}
                                          </p>
                                          {room.isPrivate && (
                                            <Lock className="h-4 w-4 text-foreground" />
                                          )}
                                        </div>
                                        <p
                                          className={`text-xs ${!isActive && "text-muted-foreground"}`}
                                        >
                                          {room.totalMember} members
                                        </p>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{room.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </SidebarMenuButton>
                            )}
                          </NavLink>
                        </SidebarMenuItem>
                      ))}
                    </ScrollArea>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        {location.pathname.includes("/request") && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <NavLink to="/request/incoming">
                    {({ isActive }) => (
                      <SidebarMenuButton
                        isActive={isActive}
                        className={cn("h-auto justify-start p-3")}
                      >
                        <ClockArrowUp />
                        Incoming
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavLink to="/request/outgoing">
                    {({ isActive }) => (
                      <SidebarMenuButton
                        isActive={isActive}
                        className={cn("h-auto justify-start p-3")}
                      >
                        <ClockArrowDown />
                        Outgoing
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function SearchInput({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  return (
    <div className="relative mt-3">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
