// import './App.css'
import { Canvas } from '@react-three/fiber'
import { Box, OrbitControls } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { Suspense } from 'react'
import { Menu } from './Menu'

export function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const handleCanvasClick = () => {
    onFinished()
  }
  
  return (
    <div onClick={handleCanvasClick}  className='w-full h-screen cursor-pointer'>
      <Canvas orthographic camera={{ position: [-10, 10, 10], zoom: 30 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 20]} color="0xffffff" intensity={0.5} />
        <directionalLight position={[-5, -5, 20]} color="0xffffff" />
        <OrbitControls />
        <color attach="background" args={['#000']} />
        <Suspense>
          <Physics gravity={[0, -50, 0]}>
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 20]} color="0xffffff" intensity={0.5} />
            <directionalLight position={[-5, -5, 20]} color="0xffffff" intensity={0} />
            <OrbitControls />

            <RigidBody name="ground" type="fixed" restitution={0.6} friction={0.1}>
              <Box position={[0, -10, 0]} args={[30, 1, 30]}>
                <meshStandardMaterial color="black" />
              </Box>
            </RigidBody>
            <Menu />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  )
}
