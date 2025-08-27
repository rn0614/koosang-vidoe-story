export default interface TimeSchedule {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
  type: string;
  isChange: boolean;
}
