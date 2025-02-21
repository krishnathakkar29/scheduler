"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { bookingSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createBooking } from "../../../actions/bookingAction";

type Props = {
  event: any;
  availability: any;
};

const BookingForm = ({ event, availability }: Props) => {
  const [selectedDate, setSelectedDate] = useState<any>();
  const [selectedTime, setSelectedTime] = useState(null);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      additionalInfo: "",
      date: "",
      time: "",
    },
  });

  const { loading, data, fn: fnCreateBooking } = useFetch(createBooking);

  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", format(selectedDate, "yyyy-MM-dd"));
    }
  }, [selectedDate, form]);

  useEffect(() => {
    if (selectedTime) {
      form.setValue("time", selectedTime);
    }
  }, [selectedTime, form]);

  const onSubmit = async (data: z.infer<typeof bookingSchema>) => {
    console.log("Form submitted with data:", data);

    if (!selectedDate || !selectedTime) {
      console.error("Date or time not selected");
      return;
    }

    const startTime = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}`);
    const endTime = new Date(startTime.getTime() + event.duration * 60000);

    const bookingData = {
      eventId: event.id,
      name: data.name,
      email: data.email,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      additionalInfo: data.additionalInfo,
    };

    await fnCreateBooking(bookingData);
  };

  const availableDays = availability.map((day: any) => new Date(day.date));

  const timeSlots = selectedDate
    ? availability.find((day: any) => day.date === format(selectedDate, "yyyy-MM-dd"))?.slots || []
    : [];

  if (data) {
    return (
      <div className="text-center p-10 border bg-white">
        <h2 className="text-2xl font-bold mb-4">Booking successful!</h2>
        {data.meetLink && (
          <p>
            Join the meeting:{" "}
            <a
              href={data.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {data.meetLink}
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date!);
                setSelectedTime(null);
              }}
              disabled={[{ before: new Date() }]}
              modifiers={{ available: availableDays }}
              modifiersStyles={{
                available: {
                  background: "lightblue",
                  borderRadius: 100,
                },
              }}
            />
          </div>

          <div className="w-full md:w-1/2">
            {selectedDate && (
              <div className="space-y-4">
                <h3 className="font-medium">Available Time Slots</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {timeSlots.map((slot: any) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedTime && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="email" placeholder="Your Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Additional Information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Scheduling..." : "Schedule Event"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingForm;
