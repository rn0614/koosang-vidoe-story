import React, { useRef } from "react";
import { DropTargetMonitor, useDrop } from "react-dnd";
import DragBox from "./drag-box";

type DropAreaType<T> = {
  addBox: (
    time: number,
    item: any,
    monitor: DropTargetMonitor<unknown, unknown>,
    type: string
  ) => void;
  data: any;
  time: number;
  type: string;
  dropCheckHandler: any;
};

export default function DropArea<T>({
  addBox,
  data,
  time,
  type,
  dropCheckHandler,
}: DropAreaType<T>) {
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "row",
      drop: (item, monitor) => addBox(time, item, monitor, type),
      canDrop: (item, monitor) => dropCheckHandler(data, item, monitor),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [data]
  );

  drop(ref);

  const color = (() => {
    if (isOver && !canDrop) return "drop-disable";
    if (!isOver && canDrop) return "drop-possible";
    if (isOver && canDrop) return "drop-cursor";
    return "";
  })();

  return (
    <div
      ref={ref}
      onClick={() => console.log(data, data.id === null, canDrop)}
    >
      {data?.data?.id ? (
        <DragBox
          id={data.data.id}
          text={data.data.text}
          time={time}
          data={data.data}
          size={data.data.endTime - data.data.startTime}
        ></DragBox>
      ) : null}
    </div>
  );
}
