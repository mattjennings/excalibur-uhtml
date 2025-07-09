import * as ex from 'excalibur'
import './style.css'
import { UIComponent, UISystem } from './ui'

class Scene extends ex.Scene {
  constructor() {
    super()

    this.world.systemManager.addSystem(UISystem)
  }

  onInitialize(engine: ex.Engine<any>): void {
    this.camera.move(ex.vec(400, 1000), 5000)
    this.add(new UIExample())
    this.add(
      new ex.Actor({
        width: 9999,
        height: 10,
        anchor: ex.vec(0, 0),
        color: ex.Color.Yellow,
        collisionType: ex.CollisionType.Fixed,
        x: -100,
        y: 590,
      }),
    )
    this.add(
      new ex.Actor({
        width: 9999,
        height: 10,
        anchor: ex.vec(0, 0),
        color: ex.Color.Yellow,
        collisionType: ex.CollisionType.Fixed,
        x: -100,
        y: 0,
      }),
    )
    this.add(
      new ex.Actor({
        width: 10,
        height: 9999,
        anchor: ex.vec(0, 0),
        color: ex.Color.Yellow,
        collisionType: ex.CollisionType.Fixed,
        x: 0,
        y: 0,
      }),
    )
    this.add(
      new ex.Actor({
        width: 10,
        height: 9999,
        anchor: ex.vec(0, 0),
        color: ex.Color.Yellow,
        collisionType: ex.CollisionType.Fixed,
        x: 790,
        y: 0,
      }),
    )
  }
}

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
    main: new Scene(),
  },
})

class UIExample extends ex.Actor {
  text = 0

  ui = new UIComponent(
    (html) => html`
      <div>
        <div>static</div>
        <div>
          <div>${this.text}</div>
        </div>
        <div>static321</div>
        <div>${'static string'}</div>
        <button @click=${this.bounce}>click me</button>
      </div>
    `,
    {
      coordPlane: ex.CoordPlane.World,
    },
  )

  constructor() {
    super({
      x: 200,
      y: 200,
      width: 100,
      height: 100,
      anchor: ex.vec(0, 0),
      collisionType: ex.CollisionType.Active,
    })
    this.addComponent(this.ui)
    this.bounce()
  }

  onPreUpdate() {
    this.text += 1
  }

  bounce = () => {
    this.vel = ex.vec(200 * (Math.random() > 0.5 ? 1 : -1), -400)
  }

  onPreCollisionResolve(
    self: ex.Collider,
    other: ex.Collider,
    side: ex.Side,
    contact: ex.CollisionContact,
  ) {
    switch (side) {
      case ex.Side.Top:
      case ex.Side.Bottom:
        this.vel.y = -this.vel.y * 0.5
        this.vel.x *= 0.9
        break
      case ex.Side.Left:
      case ex.Side.Right:
        this.vel.x = -this.vel.x * 0.5
        break
    }
  }
}

game.start('main')
