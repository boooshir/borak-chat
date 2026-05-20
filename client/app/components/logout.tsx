import React, { useRef } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";

export function Logout({ children }: { children: React.ReactNode }) {
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
  return (
    <fetcher.Form method="post" action="/logout">
      {children}
    </fetcher.Form>
  );
}
