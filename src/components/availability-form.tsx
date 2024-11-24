"use client";
import { availabilitySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { timeSlots } from "@/lib/data";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { updateUserAvailability } from "../../actions/availabilityAction";
import useFetch from "@/hooks/use-fetch";

export type DayAvailabilitySettings = {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

export type AvailabilityData = {
  timeGap: number;
  monday: DayAvailabilitySettings;
  tuesday: DayAvailabilitySettings;
  wednesday: DayAvailabilitySettings;
  thursday: DayAvailabilitySettings;
  friday: DayAvailabilitySettings;
  saturday: DayAvailabilitySettings;
  sunday: DayAvailabilitySettings;
};

interface AvailabilityFormProps {
  data: AvailabilityData;
}

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const AvailabilityForm = ({ data }: AvailabilityFormProps) => {
  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      ...data,
    },
  });

  const {
    loading,
    error,
    fn: fnupdateAvailability,
  } = useFetch(updateUserAvailability);

  const onSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    await fnupdateAvailability(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="px-4 space-y-4">
        {days.map((day, index) => (
          <div className="flex items-center space-x-4 mb-4" key={index}>
            <FormField
              control={form.control}
              name={`${day}.isAvailable`}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (!checked) {
                      form.setValue(`${day}.startTime`, "09:00");
                      form.setValue(`${day}.endTime`, "17:00");
                    }
                  }}
                />
              )}
            />

            <FormLabel className="w-24">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </FormLabel>

            {form.watch(`${day}.isAvailable`) && (
              <>
                <FormField
                  control={form.control}
                  name={`${day}.startTime`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Start Time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <span>to</span>

                <FormField
                  control={form.control}
                  name={`${day}.endTime`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="End Time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        ))}

        <FormField
          control={form.control}
          name="timeGap"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-4">
              <FormLabel className="w-48">
                Minimum gap before booking (minutes):
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <div className="text-red-500 text-sm">{error?.message}</div>}

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Availability"}
        </Button>
      </form>
    </Form>
  );
};

export default AvailabilityForm;
