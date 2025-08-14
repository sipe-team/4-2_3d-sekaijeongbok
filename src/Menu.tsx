import { RapierRigidBody, RigidBody } from '@react-three/rapier'
import { Text3D } from '@react-three/drei'
import { useRef } from 'react'

const MENU_ITEMS = ['Everyday', 'People', 'with', 'Insight', 'Sharing']
const ROWS = 4
const COLS = 1
const MARGIN_X = 10
const MARGIN_Y = 3
// const FORCE = 150

export function Menu() {
  const menuRef = useRef<RapierRigidBody>(null)

  const jump = (index: number) => {
    if (!menuRef.current) return

    menuRef.current.applyImpulse({ x: 4, y: 100, z: 0 }, true)
    console.log('jump', index)
  }

  return (
    <>
      {MENU_ITEMS.map((item, index) => {
        const row = Math.floor(index / COLS)
        const col = index % COLS

        const x = (col - (COLS - 1) / 2) * MARGIN_X - 10
        const y = (row - (ROWS - 1) / 2) * MARGIN_Y + 10

        return (
          <RigidBody
            ref={menuRef}
            key={item}
            position={[x, y, 0]}
            restitution={0}
            friction={2}
            userData={{ index }}
            mass={1}
            colliders={'cuboid'}
            linearDamping={0.2}
          >
            <Text3D
              font="/fonts/helvetiker_bold.typeface.json"
              size={3}
              height={0.4}
              curveSegments={24}
              bevelEnabled
              bevelThickness={0.9}
              bevelSize={0.3}
              bevelOffset={0}
              bevelSegments={10}
              onClick={() => jump(index)}
            >
              {item}
              <meshPhongMaterial color="#00ffff" shininess={200} />
            </Text3D>
          </RigidBody>
        )
      })}
    </>
  )
}
