import { Hole, Value, html, render } from 'uhtml'
import {
  System,
  type Query,
  SystemType,
  type Engine,
  Component,
  CoordPlane,
  Entity,
  Scene,
  TransformComponent,
  Vector,
  World,
  vec,
} from 'excalibur'

export class UISystem extends System {
  systemType = SystemType.Draw
  query!: Query<typeof UIComponent>
  root = document.createElement('div')
  engine!: Engine

  initialize(world: World, scene: Scene<unknown>): void {
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
    this.root.style.pointerEvents = 'none'

    this.root.style.setProperty(
      '--ex-pixel',
      this.getPixelConversion().toString(),
    )
  }

  update() {
    for (const entity of this.query.entities) {
      const comp = entity.get(UIComponent)
      comp.draw()
    }
  }

  getPixelConversion() {
    const origin = this.engine.screen.worldToPageCoordinates(Vector.Zero)
    const singlePixel = this.engine.screen
      .worldToPageCoordinates(vec(1, 0))
      .sub(origin)
    return singlePixel.x
  }
}

export interface UIComponentOptions {
  /**
   * If set to CoordPlane.Screen, HTML will be positioned relative to the screen. If set to
   * CoordPlane.World, HTML will be positioned relative to its entity (this means
   * it will go off screen if entity is off screen)
   *
   * By default it inherits from the entity.
   */
  coordPlane?: CoordPlane

  /**
   * Renders inside a shadow dom to scope the contents
   */
  scoped?: boolean
}

export class UIComponent extends Component {
  type = 'UIComponent'

  root?: HTMLElement
  shadow?: ShadowRoot
  coordPlane?: CoordPlane
  draw: () => void
  scoped?: boolean

  private system?: UISystem

  constructor(
    draw: (
      html: (template: TemplateStringsArray, ...values: Value[]) => Hole,
    ) => Hole,
    options: UIComponentOptions = {},
  ) {
    super()

    this.coordPlane = options.coordPlane
    this.scoped = options.scoped

    this.draw = () => {
      if (this.root) {
        this.updatePosition()
        render(this.scoped ? this.shadow : this.root, draw(html))
      }
    }
  }

  onAdd(owner: Entity<any>): void {
    if (owner.scene) {
      this.attach()
    } else {
      owner.on('initialize', this.attach)
    }

    owner.on('remove', this.detach)
    owner.on('kill', this.detach)
  }

  attach = () => {
    if (this.owner?.scene) {
      this.system =
        this.owner.scene.world.systemManager.get(UISystem) ?? undefined

      if (this.system) {
        this.coordPlane ??= this.owner!.get(TransformComponent)?.coordPlane
        this.root = document.createElement('div')
        this.root.style.position = 'relative'
        this.root.style.height = '100%'
        this.root.style.width = '100%'
        this.root.style.transformOrigin = '0 0'
        this.root.style.transform =
          'scale(var(--ex-pixel), var(--ex-pixel)) translate(calc(var(--x, 0)), calc(var(--y, 0))'
        this.root.style.pointerEvents = 'auto'

        if (this.scoped) {
          this.shadow = this.root.attachShadow({ mode: 'open' })
          this.root.appendChild(this.shadow)
        }

        this.system.root.append(this.root)

        this.owner!.scene!.once('deactivate', this.detach)
      } else {
        throw new Error('UISystem not found')
      }
    }
  }

  detach = () => {
    this.root?.remove()
    this.owner?.scene?.once('activate', this.attach)
  }

  updatePosition() {
    if (this.root && this.owner) {
      if (this.coordPlane === CoordPlane.World) {
        const transform = this.owner.get(TransformComponent)

        const screenCoords =
          this.owner?.scene?.engine.screen.worldToScreenCoordinates(
            transform.pos,
          )

        const conversion = this.system?.getPixelConversion()

        if (screenCoords && conversion) {
          this.root.style.setProperty('--x', screenCoords.x.toString() + 'px')
          this.root.style.setProperty('--y', screenCoords.y.toString() + 'px')
        } else {
          this.root.style.setProperty('--x', '0px')
          this.root.style.setProperty('--y', '0px')
        }
      }
    }
  }
}
