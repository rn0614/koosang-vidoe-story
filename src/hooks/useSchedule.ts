import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const GET_SCHEDULE_LIST = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/schedule`;

export const getScheduleListRequest = async () => {
  try {
    const res = await fetch(GET_SCHEDULE_LIST(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch schedule list');
    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export function useScheduler() {
  const { data } = useQuery(["schedule-list"], () =>
    getScheduleListRequest()
  );
  return data?.scheduleList ? data.scheduleList : [];
}

const changeData = (inputData:any) => {
  // Creating a Map to group data by type
  const groupedByType = new Map();

  // Filling the map with data grouped by type
  inputData.forEach((item:any) => {
    if (!groupedByType.has(item.type)) {
      groupedByType.set(item.type, []);
    }
    groupedByType.get(item.type).push(item);
  });

  return Array.from(groupedByType.values());
};