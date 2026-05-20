import { MessageCircle, Users } from "lucide-react";

export function Welcome() {
  return (
    <main>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to ChatApp
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Select a conversation from the sidebar to start chatting with your
            friends or join a room for group discussions.
          </p>

          <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Direct Messages for private conversations</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Rooms for group discussions</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
