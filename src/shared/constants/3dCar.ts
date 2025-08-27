const COLORS = [
    { name: '빨강', value: '#ff3b3b' },
    { name: '파랑', value: '#3b82f6' },
    { name: '초록', value: '#22c55e' },
    { name: '노랑', value: '#fbbf24' },
  ]


  const COLORABLE_PARTS = ['car_body', 'door_l', 'door_r', 'free_number']
const ROTATABLE_PARTS = ['wheel_bl', 'wheel_br', 'wheel_fl', 'wheel_fr']

const WHEEL_ROTATION_DURATION = 5 // 초

export { COLORS, COLORABLE_PARTS, ROTATABLE_PARTS, WHEEL_ROTATION_DURATION }