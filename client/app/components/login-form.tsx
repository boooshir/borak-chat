import React, { useRef } from "react";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, Loader2Icon } from "lucide-react";
import { Link, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";

export type LoginFormProps = {
  actiondata: {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
  };
} & React.ComponentProps<"div">;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const fetcher = useFetcher();
  const hasDisplayToast = useRef(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (fetcher?.data?.success === true) {
      toast.success("Login Success", {
        description: "welcome back, nice to see you again.",
      });
      navigate("/direct-message");
      hasDisplayToast.current = true;
    }
  }, [fetcher.data]);
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between">
              <span>Welcome back</span>
              <ModeToggle />
            </div>
          </CardTitle>
          <CardDescription>login to your borak account</CardDescription>
        </CardHeader>
        <CardContent>
          {fetcher.data && !fetcher?.data?.success && (
            <Alert variant={"destructive"} className="mb-6">
              <AlertCircle />
              <AlertTitle>Unable to process the login</AlertTitle>
              <AlertDescription>{fetcher?.data?.message}</AlertDescription>
            </Alert>
          )}
          <fetcher.Form method="post">
            <div className="flex flex-col gap-4">
              <div className="grid gap-3">
                <Label
                  htmlFor="username"
                  className="aria-invalid:text-destructive"
                  aria-invalid={fetcher.data && !fetcher.data.success}
                >
                  Username
                </Label>
                <div className="flex flex-col">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="username"
                    aria-invalid={fetcher.data && !fetcher?.data?.success}
                    required
                  />
                  {fetcher.state !== "submitting" &&
                    fetcher?.data?.success === false && (
                      <small className="pl-1 text-destructive">
                        {fetcher?.data?.errors?.username}
                      </small>
                    )}
                </div>
              </div>
              <div className="grid gap-3">
                <div className="item-center flex">
                  <Label
                    htmlFor="password"
                    className="aria-invalid:text-destructive"
                    aria-invalid={fetcher.data && !fetcher.data.success}
                  >
                    Password
                  </Label>
                  <Link
                    to={""}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot Password
                  </Link>
                </div>
                <div className="flex flex-col">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="password"
                    aria-invalid={fetcher.data && !fetcher?.data?.success}
                    required
                  />
                  {fetcher.state !== "submitting" &&
                    !fetcher?.data?.success && (
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
                  disabled={fetcher.state === "submitting"}
                >
                  {fetcher.state === "submitting" ? (
                    <>
                      <Loader2Icon className="animate-spin" /> Please wait
                    </>
                  ) : (
                    <>Login</>
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to={"/register"} className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </fetcher.Form>
        </CardContent>
      </Card>
    </div>
  );
}
