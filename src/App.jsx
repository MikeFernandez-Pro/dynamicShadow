import { OrbitControls, useAnimations, useGLTF, useHelper } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function App(props) {

  const { intensity, color } = useControls("ambientLight", {
    intensity: { value: 1.6, min: 0, max: 10, step: 0.1 },
    color: "c19382",
  })

  return (
    <>
      <Leva collapsed={false} theme={{
        sizes: { rootWidth: 'auto' },
      }} />

      <Canvas
        shadows
        camera={
          {
            position: [0, 0, 10],
            fov: 45,
            near: 0.1,
            far: 1000,
          }
        }
      >
        <Perf position="top-left" />
        <OrbitControls
          position={[0, 0, 10]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          maxDistance={20}
        />

        <ambientLight intensity={intensity} color={color} />

        <Ruins />
        <Fox />

      </Canvas>
    </>
  );
};

function Ruins() {

  const ruins = useGLTF("/models/ruins.glb");

  ruins.scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      child.receiveShadow = true;
    }
  });

  return (
    <primitive object={ruins.scene} position-y={-2.2} position-z={3} />
  )
}

function Fox() {

  const lightControls = useControls("Light", {
    position: { value: [-5.0, 3.7, 0.3], step: 0.1 },
    intensity: { value: 2.1, min: 0, max: 30, step: 0.1 },
    color: "d58642",
  })

  const { scene } = useThree();

  const foxRef = useRef();
  const fox = useGLTF("/models/Fox.glb");
  const animations = useAnimations(fox.animations, fox.scene)

  fox.scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      child.castShadow = true;
    }
  });

  const lightRef = useRef();
  const lightHelper = useHelper(lightRef, THREE.DirectionalLightHelper, 1)


  useEffect(() => {
    scene.add(new THREE.CameraHelper(lightRef.current.shadow.camera))
    animations.actions.Run.play();
  }, [])

  useFrame(({ clock }) => {
    foxRef.current.position.x = Math.cos(clock.elapsedTime) * 1.5;
    foxRef.current.position.z = Math.sin(clock.elapsedTime) * 1.5;
    foxRef.current.rotation.y = -clock.elapsedTime;
    lightRef.current.target = foxRef.current
    lightRef.current.shadow.camera.target = foxRef.current

  })

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={lightControls.position}
        intensity={lightControls.intensity}
        color={lightControls.color}
        castShadow
        shadow-mapSize={[256, 256]}
        shadow-camera-near={5}
        shadow-camera-far={10}
        shadow-camera-top={2}
        shadow-camera-right={-2}
        shadow-camera-bottom={-2}
        shadow-camera-left={2}
        shadow-bias={-0.01}
      />
      <primitive ref={foxRef} object={fox.scene} scale={0.007} position-y={-2.1} />
    </>
  )
}
