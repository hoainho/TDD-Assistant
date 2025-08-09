import { useEffect } from 'react';

declare const PIXI: any;

interface Particle {
  sprite: any;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const usePixiBackground = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  useEffect(() => {
    if (!canvasRef.current || typeof PIXI === 'undefined') return;

    const app = new PIXI.Application({
      view: canvasRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
    });

    const particles: Particle[] = [];
    const particleCount = 70;
    const colors = [0x06b6d4, 0x8b5cf6, 0xec4899];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 4 + 1;
      const particleGraphic = new PIXI.Graphics();
      particleGraphic.beginFill(colors[i % colors.length]);
      particleGraphic.drawCircle(0, 0, radius);
      particleGraphic.endFill();

      // Add a blur filter for a soft, glowing effect
      const blurFilter = new PIXI.filters.BlurFilter();
      blurFilter.blur = 2;
      particleGraphic.filters = [blurFilter];

      // Reverted to the correct method for PixiJS v7. The previous method `texture.generate` was incorrect.
      const particleTexture = app.renderer.generateTexture(particleGraphic);
      const sprite = new PIXI.Sprite(particleTexture);
      
      const particle: Particle = {
        sprite: sprite,
        x: Math.random() * app.screen.width,
        y: Math.random() * app.screen.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: radius,
      };
      
      sprite.x = particle.x;
      sprite.y = particle.y;
      sprite.anchor.set(0.5);
      app.stage.addChild(sprite);
      particles.push(particle);

      // Destroy the temporary graphic to free up memory
      particleGraphic.destroy();
    }
    
    app.ticker.add((delta) => {
      particles.forEach(p => {
        p.x += p.vx * delta;
        p.y += p.vy * delta;

        if (p.x < -p.radius || p.x > app.screen.width + p.radius) {
          p.vx *= -1;
        }
        if (p.y < -p.radius || p.y > app.screen.height + p.radius) {
          p.vy *= -1;
        }
        
        p.sprite.x = p.x;
        p.sprite.y = p.y;
      });
    });

    return () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
    };
  }, [canvasRef]);
};