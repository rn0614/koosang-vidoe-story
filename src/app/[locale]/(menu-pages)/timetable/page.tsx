"use client"
import { useCallback, useEffect, useState } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { useScheduler } from '@/hooks/useSchedule';
import TimeSchedule from '@/shared/types/timeSchedule';
import DropWrapper from '@/components/drop-wrapper';
import { HTML5toTouch } from 'rdndmb-html5-to-touch'; // or any other pipeline
import { DndProvider } from 'react-dnd-multi-backend';
import { Button } from '@/components/ui/button';
import {cloneDeep} from 'lodash';
import { timeScheduleMock } from "@/__mocks__/time-schedule-list.mock";

const changeData = (inputData: any) => {
  // Creating a Map to group data by type
  const groupedByType = new Map();

  // Filling the map with data grouped by type
  inputData.forEach((item: any) => {
    if (!groupedByType.has(item.type)) {
      groupedByType.set(item.type, []);
    }
    groupedByType.get(item.type).push(item);
  });

  return Array.from(groupedByType.values());
};

export default function DragDropPage() {
  const scheduleList = useScheduler();
  const [wrapper, setWrapper] = useState<any>(changeData(timeScheduleMock));
  const [inputs, setInputs] = useState();
  const addBox = useCallback(
    (
      time: number,
      item: any,
      monitor: DropTargetMonitor<unknown, unknown>,
      type: string,
    ) => {
      let diff = Math.floor(
        (monitor.getInitialClientOffset()!.y -
          monitor.getInitialSourceClientOffset()!.y) /
          20,
      );
      setWrapper((preRows: TimeSchedule[][]) => {
        let itemToMove = cloneDeep(preRows);
        // 전체 배열을 순회하며 요소 찾기
        itemToMove.forEach((group: TimeSchedule[]) => {
          const itemIndex = group.findIndex((row) => item.id === row.id);
          if (itemIndex !== -1) {
            // 요소를 찾았으면 제거
            group.splice(itemIndex, 1)[0];
          }
        });

        // 찾은 요소를 지정된 배열 번호의 리스트에 추가
        if (type < wrapper.length) {
          itemToMove[+type].push({
            id: item.id,
            text: item.text,
            startTime: time - diff,
            endTime: time + item.data.endTime - item.data.startTime - diff,
            type: type,
            isChange: true,
          });
        }
        return itemToMove;
      });
    },
    [wrapper],
  );

  useEffect(() => {
    if (scheduleList && scheduleList.length > 0) {
      console.log(changeData(scheduleList));
      setWrapper(changeData(scheduleList));
    }
  }, [scheduleList]);
  return (
    <DndProvider options={HTML5toTouch}>
      <div >
        <div >
          <div >
            {Array.from({ length: 26 }, (v, k) => k - 1).map((item) => (
              <div
                key={item}
                style={{
                  height: '20px',
                  backgroundColor: 'rgb(178, 178, 178)',
                  textAlign: 'right',
                  paddingRight: '5px',
                }}
              >
                {item >= 0 ? item : null}
              </div>
            ))}
          </div>
          <DropWrapper areaList={wrapper[0]} addBox={addBox} type={'0'} />
          <DropWrapper areaList={wrapper[1]} addBox={addBox} type={'1'} />
          <DropWrapper areaList={wrapper[2]} addBox={addBox} type={'2'} />
        </div>
      </div>
      <div>
        <label htmlFor="날짜">날짜</label>
        <input name="날짜" placeholder="날짜"></input>
        <label htmlFor="시작"></label>
        <input placeholder=""></input>
      </div>
      <div>
        <Button
          onClick={() => {
            console.log(wrapper);
          }}
        >
          전체 출력
        </Button>
      </div>
    </DndProvider>
  );
}
