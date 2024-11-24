import React from "react";
import { getUserAvailability } from "../../../../actions/availabilityAction";
import AvailabilityForm from "@/components/availability-form";
import { defaultAvailability } from "@/lib/data";

type Props = {};

const page = async (props: Props) => {
  const availability = await getUserAvailability();
  return <AvailabilityForm data={availability || defaultAvailability} />;
};

export default page;
