"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usernameSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateUsername } from "../../actions/userAction";
import useFetch from "@/hooks/use-fetch";
import { useRouter } from "next/navigation";
import { BarLoader } from "react-spinners";

type Props = {
  username?: string | undefined | null;
};

const UpdateLinkForm = ({ username }: Props) => {
  const [origin, setOrigin] = useState("");
  const router = useRouter();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: username || "",
    },
  });

  const { loading, error, fn: fnUpdateUsername } = useFetch(updateUsername);

  async function onSubmit({ username }: z.infer<typeof usernameSchema>) {
    try {
      console.log(username);
      const response = await fnUpdateUsername(username);
      console.log(response);
      router.refresh();
    } catch (error) {
      console.log("error in client", error);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Unique Link</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="flex items-center justify-center py-2">
                  <span>{origin}/</span>
                  <FormControl>
                    <Input placeholder="username" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error?.message}</p>}
            {loading && <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />}
            <Button type="submit" disabled={loading}>
              Update Username
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UpdateLinkForm;
