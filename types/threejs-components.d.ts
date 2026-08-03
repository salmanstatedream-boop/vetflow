declare module 'threejs-components/build/cursors/tubes1.min.js' {
  type TubesApp = {
    tubes: {
      setColors: (colors: string[]) => void;
      setLightsColors: (colors: string[]) => void;
      setMaterialOption?: (key: string, value: unknown) => void;
    };
    dispose: () => void;
  };

  const TubesCursor: (
    element: HTMLElement,
    options?: {
      bloom?: false | { threshold?: number; strength?: number; radius?: number };
      tubes?: {
        count?: number;
        colors?: string[];
        minRadius?: number;
        maxRadius?: number;
        lerp?: number;
        noise?: number;
        material?: { metalness?: number; roughness?: number };
        lights?: {
          intensity?: number;
          colors?: string[];
        };
      };
    },
  ) => TubesApp;

  export default TubesCursor;
}
