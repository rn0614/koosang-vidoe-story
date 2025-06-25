import { useRef } from "react";
import { useDrag } from "react-dnd";


export default function DragBox({ id, text, time, data, size }:any) {
  const ref = useRef<HTMLTableRowElement>(null);
  const [{ isDragging}, drag] = useDrag({
    type: "row",   // type을 통한 드래그 아이템 유형 식별
    item: { id: id, text, time, data },   // 드래그 중인 데이터를 나타내는 객체
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      clientOffset : !!monitor.getInitialClientOffset(),
      sourceClientOffset :!!monitor.getInitialSourceClientOffset(),
    })
  },[]);

  drag(ref);

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 , zIndex:isDragging?0:1, height:size*20+"px"}}
      onClick={()=>console.log(size)}
    >
      {text}
    </div>
  );
}
