import React from 'react';

const GridFloor: React.FC = () => {
  return (
    <group>
      <gridHelper args={[50, 50, '#444444', '#222222']} />
      <axesHelper args={[10]} />
    </group>
  );
};

export default GridFloor; 