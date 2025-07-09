import * as ex from 'excalibur'
import { UIComponent, UISystem } from 'excalibur-uhtml'

export class PhysicsScene extends ex.Scene {
  constructor() {
    super()

    this.world.systemManager.addSystem(UISystem)
  }

  onActivate(): void {
    this.engine.physics.enabled = true
    this.engine.physics.gravity = ex.vec(0, 800)
  }

  onDeactivate(): void {
    this.engine.physics.enabled = false
  }

  onInitialize(): void {
    this.add(new Plane('horizontal', 0, 0))
    this.add(new Plane('vertical', 0, 0))
    this.add(new Plane('horizontal', 0, 590))
    this.add(new Plane('vertical', 790, 0))

    this.add(new UIExample())
  }
}

class UIExample extends ex.Actor {
  text = 0

  ui = new UIComponent(
    (html) => html`
      <button
        data-width=${this.width}
        data-height=${this.height}
        @click=${this.shove}
      >
        click me
      </button>

      <style>
        button {
          font-size: 32px;
          width: calc(attr(data-width px));
          height: calc(attr(data-height px));
        }
      </style>
    `,
  )

  constructor() {
    super({
      x: 200,
      y: 200,
      width: 200,
      height: 100,
      anchor: ex.vec(0, 0),
      collisionType: ex.CollisionType.Active,
    })
    this.addComponent(this.ui)
    this.shove()
    console.log(this.width)
  }

  shove = () => {
    this.vel = ex.vec(300 * (Math.random() > 0.5 ? 1 : -1), -600)
  }

  onPreCollisionResolve(_: ex.Collider, __: ex.Collider, side: ex.Side) {
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

class Plane extends ex.Actor {
  constructor(direction = 'horizontal', x: number, y: number) {
    super({
      width: direction === 'horizontal' ? 9999 : 20,
      height: direction === 'horizontal' ? 10 : 9999,
      anchor: ex.vec(0, 0),
      color: ex.Color.Green,
      collisionType: ex.CollisionType.Fixed,
      x,
      y,
    })
  }
}
