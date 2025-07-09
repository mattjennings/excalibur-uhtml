import * as ex from 'excalibur'
import { PhysicsScene } from './scenes/physics'
import './style.css'
import { MenuScene } from './scenes/menu'

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
    menu: new MenuScene(),
    physics: new PhysicsScene(),
  },
})

game.start('menu')
