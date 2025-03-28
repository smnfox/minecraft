export const drawDistance = 1;
export const chunkSize = {
  width: 16,
  height: 24,
};
export const params = {
  terrain: {
    scale: 100,
    magnitude: 8,
    offset: 6,
    waterOffset: 4,
  },
  biomes: {
    scale: 500,
    variation: {
      amplitude: 0.2,
      scale: 50,
    },
    tundraToTemperate: 0.25,
    temperateToJungle: 0.5,
    jungleToDesert: 0.75,
  },
  trees: {
    trunk: {
      minHeight: 4,
      maxHeight: 7,
    },
    canopy: {
      minRadius: 3,
      maxRadius: 3,
      density: 0.7, // Vary between 0.0 and 1.0
    },
    frequency: 0.005,
  },
  clouds: {
    scale: 30,
    density: 0.3,
  },
};
