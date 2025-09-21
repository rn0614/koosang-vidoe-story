import React, { useRef } from "react";
import DropArea from "./drop-area";

type DropWrapperProps<T> = {
  areaList: T[]|undefined;
  addBox: any;
  type: string;
};

export default function DropWrapper<
  T extends { startTime: number; id: number }
>({ areaList, addBox, type }: DropWrapperProps<T>) {
  const ref = useRef<HTMLTableRowElement>(null);
  const wrapperList = Array.from({ length: 24 }, (v, k) => k);
  const resultList = wrapperList.map((time) => {
    // areaList에서 해당 시간과 일치하는 요소 찾기
    const found = areaList?.find((area) => area.startTime === time) ?? null;
    // 일치하는 요소가 있으면 그 요소의 id를 사용, 없으면 null
    return {
      time,
      data: found,
    };
  });

  const dropCheckHandler = (data: any, item: any, monitor: any) => {
    let diff = Math.floor(
      (monitor.getInitialClientOffset()!.y -
        monitor.getInitialSourceClientOffset()!.y) /
        20
    );
    let downsideCheck = data.time - diff;
    let upsideCheck =
      data.time + item.data.endTime - item.data.startTime - diff;
    let check = resultList.every((row) => {
      if (upsideCheck > 24 || downsideCheck < 0) return false;
      if (row.data?.id == item.data.id) return true;
      if (row.time >= upsideCheck || row.time < downsideCheck) return true;
      if (row.data === null) return true;
      return false;
    });
    return check;
  };

  return (
    <div ref={ref}>
      <div>날짜</div>
      {wrapperList.map((_, idx) => (
        <DropArea
          key={idx}
          addBox={addBox}
          time={idx}
          data={resultList[idx]}
          type={type}
          dropCheckHandler={dropCheckHandler}
        ></DropArea>
      ))}
    </div>
  );
}
