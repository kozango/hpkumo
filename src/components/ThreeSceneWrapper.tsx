import React from 'react';
import ThreeScene from './ThreeScene';
import { useAnimationContext } from '../contexts/AnimationContext';

interface ThreeSceneWrapperProps {
  className?: string;
}

const ThreeSceneWrapper: React.FC<ThreeSceneWrapperProps> = ({ className }) => {
  const { setIntroAnimationComplete } = useAnimationContext();

  const handleAnimationComplete = () => {
    console.log('Animation completed in ThreeSceneWrapper');
    setIntroAnimationComplete(true);
  };

  return (
    <ThreeScene 
      className={className} 
      onAnimationComplete={handleAnimationComplete} 
    />
  );
};

export default ThreeSceneWrapper;
