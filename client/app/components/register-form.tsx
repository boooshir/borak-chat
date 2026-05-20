import React, { useRef } from "react";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link, useFetcher, useNavigate } from "react-router";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const hasDisplayToast = useRef(false);
  React.useEffect(() => {
    if (fetcher?.data?.success === false) {
      toast.error(fetcher.data.message, {
        description: "Make sure fill the form correctly.",
      });
      hasDisplayToast.current = true;
    }
    if (fetcher?.data?.success === true) {
      toast.success(fetcher.data.message, {
        description: "Success create account, please login",
      });
      hasDisplayToast.current = true;
      navigate("/login");
    }
  }, [fetcher?.data]);
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <span>Please create an account</span>
              <ModeToggle />
            </div>
          </CardTitle>
          <CardDescription>Let's join to borak chat</CardDescription>
        </CardHeader>
        <CardContent>
          <fetcher.Form method="post">
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label
                  htmlFor="username"
                  className="aria-invalid:text-destructive"
                  aria-invalid={
                    fetcher.state !== "submitting" &&
                    fetcher?.data?.errors?.username !== undefined
                  }
                >
                  Username
                </Label>
                <div className="flex flex-col">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    aria-invalid={
                      fetcher.state !== "submitting" &&
                      fetcher?.data?.errors?.username !== undefined
                    }
                    placeholder="username"
                    required
                  />
                  {fetcher?.data?.errors?.username && (
                    <small className="pl-1 text-destructive">
                      {fetcher?.data?.errors?.username}
                    </small>
                  )}
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label
                    htmlFor="email"
                    className="aria-invalid:text-destructive"
                    aria-invalid={
                      fetcher.state !== "submitting" &&
                      fetcher?.data?.errors?.email !== undefined
                    }
                  >
                    Email
                  </Label>
                  <small className="text-gray-400">&nbsp;(Optional)</small>
                </div>
                <div className="flex flex-col">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email"
                    aria-invalid={
                      fetcher.state !== "submitting" &&
                      fetcher?.data?.errors?.email !== undefined
                    }
                  />
                  {fetcher?.data?.errors?.email && (
                    <small className="pl-1 text-destructive">
                      {fetcher?.data?.errors?.email}
                    </small>
                  )}
                </div>
              </div>
              <div className="grid gap-3">
                <Label
                  htmlFor="password"
                  className="aria-invalid:text-destructive"
                  aria-invalid={
                    fetcher.state !== "submitting" &&
                    fetcher?.data?.errors?.password !== undefined
                  }
                >
                  Password
                </Label>
                <div className="flex flex-col">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    aria-invalid={
                      fetcher.state !== "submitting" &&
                      fetcher?.data?.errors?.password !== undefined
                    }
                    required
                  />
                  {fetcher?.data?.errors?.password && (
                    <small className="pl-1 text-destructive">
                      {fetcher?.data?.errors?.password}
                    </small>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={fetcher.state !== "idle"}
                >
                  {fetcher.state !== "idle" ? (
                    <>
                      <Loader2Icon className="animate-spin" /> Please wait
                    </>
                  ) : (
                    <>Register</>
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              have an account?{" "}
              <Link to={"/login"} className="underline underline-offset-4">
                Sign In
              </Link>
            </div>
          </fetcher.Form>
        </CardContent>
      </Card>
    </div>
  );
}
