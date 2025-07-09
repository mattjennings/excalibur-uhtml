import { Engine, Vector } from 'excalibur'

export function getPixelConversion(engine: Engine) {
  const origin = engine.screen.worldToPageCoordinates(Vector.Zero)
  const singlePixel = engine.screen
    .worldToPageCoordinates(new Vector(1, 0))
    .sub(origin)
  return singlePixel.x
}
