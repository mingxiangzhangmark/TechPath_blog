import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Edges,
  ContactShadows,
  RoundedBox,
  Float,
  Text,
} from "@react-three/drei";
import * as THREE from "three";

function Workstation() {
  const group = useRef();
  const { pointer } = useThree();

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      pointer.x * 0.55,
      0.08,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -pointer.y * 0.28,
      0.08,
    );
  });

  // Blue/indigo glass palette (no pink)
  const glassBlue = new THREE.MeshPhysicalMaterial({
    color: "#60a5fa", // blue-400
    transmission: 1,
    thickness: 1,
    roughness: 0.05,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    attenuationColor: "#bae6fd",
    attenuationDistance: 1.4,
  });

  const glassIndigo = new THREE.MeshPhysicalMaterial({
    color: "#6366f1", // indigo-500
    transmission: 1,
    thickness: 0.9,
    roughness: 0.06,
    ior: 1.46,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    attenuationColor: "#c7d2fe",
    attenuationDistance: 1.2,
  });

  const neonCyan = new THREE.MeshStandardMaterial({
    color: "#22d3ee",
    emissive: "#22d3ee",
    emissiveIntensity: 0.35,
    metalness: 0.4,
    roughness: 0.35,
  });

  return (
    <group
      ref={group}
      position={[0, -0.12, 0]}
      rotation={[0.05, 0.42, 0]}
      scale={1.12}
    >
      {/* Base plate */}
      <RoundedBox
        args={[3.2, 0.18, 2.2]}
        radius={0.14}
        smoothness={6}
        receiveShadow
        castShadow
      >
        <primitive object={glassIndigo} attach="material" />
      </RoundedBox>
      <Edges scale={1.002} threshold={10} color="#a5b4fc" />

      {/* Screen with blog name */}
      {/* Upright laptop screen (rotate around X like a real hinge; no diagonal Z-tilt) */}
      <group position={[0, 1.12, -1.05]} rotation={[-0.38, 0, 0]}>
        <RoundedBox
          args={[3.2, 1.9, 0.1]}
          radius={0.12}
          smoothness={6}
          castShadow
        >
          <primitive object={glassBlue} attach="material" />
        </RoundedBox>
        <Edges scale={1.002} threshold={10} color="#93c5fd" />
        {/* Blog name on screen */}
        {/* Glow layer (soft outer halo) */}
        <Text
          position={[0, 0, 0.062]}
          font={
            "https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/Orbitron%5Bwght%5D.ttf"
          }
          fontSize={0.32}
          color="#38bdf8"
          fillOpacity={0.1}
          outlineWidth="14%"
          outlineColor="#7dd3fc"
          outlineOpacity={0.25}
          outlineBlur="8%"
          letterSpacing={0.02}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
        >
          TechPath Blog
        </Text>
        {/* Main neon text */}
        <Text
          position={[0, 0, 0.065]}
          font={
            "https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/Orbitron%5Bwght%5D.ttf"
          }
          fontSize={0.32}
          color="#a5f3fc"
          outlineWidth="3.5%"
          outlineColor="#0284c7"
          outlineBlur="2%"
          letterSpacing={0.02}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.6}
        >
          TechPath Blog
        </Text>
        {/* little camera dot */}
        <mesh position={[0, 0.8, 0.06]}>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* Keyboard keys */}
      <group position={[0, 0.14, -0.25]}>
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 11 }).map((_, c) => {
            const x = (c - 5) * 0.24;
            const z = (r - 2) * 0.22;
            return (
              <RoundedBox
                key={`${r}-${c}`}
                args={[0.18, 0.04, 0.18]}
                radius={0.05}
                smoothness={4}
                position={[x, 0.04, z]}
              >
                <meshStandardMaterial
                  color="#93c5fd"
                  metalness={0.45}
                  roughness={0.35}
                  emissive="#60a5fa"
                  emissiveIntensity={0.14}
                />
              </RoundedBox>
            );
          }),
        )}
      </group>

      {/* Accent glow bars */}
      <mesh material={neonCyan} position={[0, 0.13, 0.54]}>
        <boxGeometry args={[2.6, 0.02, 0.12]} />
      </mesh>
      <mesh material={neonCyan} position={[0, 0.12, 0.75]}>
        <boxGeometry args={[1.6, 0.02, 0.09]} />
      </mesh>

      {/* Floating glass cubes (blue tones only) */}
      <Float
        floatIntensity={0.6}
        rotationIntensity={0.4}
        position={[1.6, 0.6, 0.9]}
      >
        <RoundedBox
          args={[0.36, 0.36, 0.36]}
          radius={0.08}
          smoothness={5}
          castShadow
        >
          <primitive object={glassBlue} attach="material" />
        </RoundedBox>
      </Float>
      <Float
        floatIntensity={0.6}
        rotationIntensity={0.4}
        position={[-1.7, 0.9, 0.7]}
      >
        <RoundedBox
          args={[0.32, 0.32, 0.32]}
          radius={0.08}
          smoothness={5}
          castShadow
        >
          <primitive object={glassIndigo} attach="material" />
        </RoundedBox>
      </Float>
    </group>
  );
}

export default function GlassGadget() {
  return (
    <Canvas
      camera={{ position: [5.1, 2.2, 6.0], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      shadows
    >
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Workstation />
        <ContactShadows
          position={[0, -0.02, 0]}
          opacity={0.22}
          scale={9}
          blur={1.8}
          far={4.2}
        />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.1}
        rotateSpeed={0.45}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 8, 5]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </Canvas>
  );
}
