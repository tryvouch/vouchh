"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function GradientSphere({
    position,
    color,
    scale = 1,
    speed = 0.5
}: {
    position: [number, number, number];
    color: string;
    scale?: number;
    speed?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const initialY = position[1];

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * speed) * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} position={position} scale={scale}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.08}
            />
        </mesh>
    );
}

function Scene() {
    const spheres = useMemo(() => [
        { position: [-4, 2, -5] as [number, number, number], color: "#7C3AED", scale: 2.5, speed: 0.3 },
        { position: [3, -1, -4] as [number, number, number], color: "#3B82F6", scale: 2, speed: 0.4 },
        { position: [-2, -2, -3] as [number, number, number], color: "#14B8A6", scale: 1.8, speed: 0.5 },
        { position: [4, 1, -6] as [number, number, number], color: "#7C3AED", scale: 3, speed: 0.25 },
        { position: [0, 3, -5] as [number, number, number], color: "#3B82F6", scale: 2.2, speed: 0.35 },
        { position: [-3, 0, -4] as [number, number, number], color: "#14B8A6", scale: 1.5, speed: 0.45 },
    ], []);

    return (
        <>
            <color attach="background" args={["#0A0A0B"]} />
            {spheres.map((sphere, i) => (
                <GradientSphere key={i} {...sphere} />
            ))}
        </>
    );
}

export default function MeshBackground() {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: true, alpha: false }}
                dpr={[1, 2]}
            >
                <Scene />
            </Canvas>
            {/* Blur overlay for depth */}
            <div className="absolute inset-0 backdrop-blur-[100px] bg-[#0A0A0B]/30" />
        </div>
    );
}
