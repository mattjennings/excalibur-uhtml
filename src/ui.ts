import * as ex from 'excalibur'
import { Hole, Value, html, render } from 'uhtml'

export class UISystem extends ex.System {
  systemType = ex.SystemType.Draw
  query!: ex.Query<typeof UIComponent>
  root = document.createElement('div')
  engine!: ex.Engine

  initialize(world: ex.World, scene: ex.Scene<unknown>): void {
    this.query = world.query([UIComponent])

    this.engine = scene.engine

    // size this.root overtop canvas
    this.root.style.position = 'absolute'
    this.resizeToCanvas()

    window.addEventListener('resize', this.resizeToCanvas.bind(this))
    document.body.appendChild(this.root)
  }

  resizeToCanvas() {
    const canvas = this.engine.canvas

    const rect = canvas.getBoundingClientRect()
    this.root.style.top = rect.top + 'px'
    this.root.style.left = rect.left + 'px'
    this.root.style.width = `${rect.width}px`
    this.root.style.height = `${rect.height}px`
    this.root.style.overflow = 'hidden'
    this.root.style.transform

    this.root.style.setProperty(
      '--pixel-conversion',
      this.getPixelConversion().toString(),
    )
  }

  update(elapsedMs: number): void {
    for (const entity of this.query.entities) {
      const comp = entity.get(UIComponent)
      comp.draw()
    }
  }

  getPixelConversion() {
    const origin = this.engine.screen.worldToPageCoordinates(ex.Vector.Zero)
    const singlePixel = this.engine.screen
      .worldToPageCoordinates(ex.vec(1, 0))
      .sub(origin)
    return singlePixel.x
  }
}

export class UIComponent extends ex.Component {
  type = 'UI'
  root?: HTMLElement
  draw: () => void
  system?: UISystem

  coordPlane?: ex.CoordPlane

  constructor(
    draw: (
      html: (template: TemplateStringsArray, ...values: Value[]) => Hole,
    ) => Hole,
    args: { coordPlane: ex.CoordPlane },
  ) {
    super()

    this.coordPlane = args.coordPlane

    this.draw = () => {
      if (this.root) {
        render(this.root, draw(html))
      }
    }
  }

  onAdd(owner: ex.Entity<any>): void {
    if (owner.scene) {
      this.attach()
    } else {
      owner.on('initialize', () => {
        this.attach()
      })
    }

    owner.on('postupdate', () => {
      this.updatePosition()
    })
  }

  attach() {
    this.system =
      this.owner?.scene?.world.systemManager.get(UISystem) ?? undefined

    if (this.system) {
      this.coordPlane ??= this.owner!.get(ex.TransformComponent)?.coordPlane
      this.root = document.createElement('div')
      this.root.style.position = 'relative'
      this.root.style.transformOrigin = '0 0'
      this.root.style.transform =
        'scale(var(--pixel-conversion), var(--pixel-conversion)) translate(calc(var(--x, 0)), calc(var(--y, 0))'
      this.system.root.append(this.root)
    } else {
      throw new Error('UISystem not found')
    }
  }

  detach() {
    this.root?.remove()
  }

  updatePosition() {
    if (this.root && this.owner) {
      if (this.coordPlane === ex.CoordPlane.World) {
        const transform = this.owner.get(ex.TransformComponent)
        // worldToScreenCoordinates
        const screenCoords =
          this.owner?.scene?.engine.screen.worldToScreenCoordinates(
            transform.pos,
          )
        const conversion = this.system?.getPixelConversion()

        if (screenCoords && conversion) {
          this.root.style.setProperty('--x', screenCoords.x.toString() + 'px')
          this.root.style.setProperty('--y', screenCoords.y.toString() + 'px')
        }
      }
    }
  }
}
