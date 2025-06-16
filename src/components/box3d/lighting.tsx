import React from 'react';

const Lighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
      <pointLight position={[0, 20, 0]} intensity={0.5} />
    </>
  );
};

export default Lighting; 