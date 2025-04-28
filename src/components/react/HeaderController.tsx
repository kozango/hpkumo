import React, { useEffect } from 'react';
import { useAnimationContext } from '../../contexts/AnimationContext';

const HeaderController: React.FC = () => {
  const { introAnimationComplete } = useAnimationContext();

  useEffect(() => {
    const header = document.getElementById('header');
    if (!header) return;

    if (introAnimationComplete) {
      // アニメーション完了後、ヘッダーを表示
      header.classList.remove('opacity-0', 'pointer-events-none');
      header.classList.add('opacity-100');
    } else {
      // アニメーション中はヘッダーを非表示
      header.classList.add('opacity-0', 'pointer-events-none');
      header.classList.remove('opacity-100');
    }
  }, [introAnimationComplete]);

  // このコンポーネントは何も表示しない
  return null;
};

export default HeaderController;
