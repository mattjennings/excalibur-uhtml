import * as ex from 'excalibur'
import { PhysicsScene } from './scenes/physics'
import './style.css'

const game = new ex.Engine({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreen,
  pixelArt: true,
  physics: {
    enabled: true,
    gravity: ex.vec(0, 800),
  },
  scenes: {
    physics: new PhysicsScene(),
  },
})

game.start('physics')
