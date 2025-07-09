import {
  Component,
  CoordPlane,
  Entity,
  Scene,
  System,
  SystemType,
  TransformComponent,
  Vector,
  World,
  vec,
  type Engine,
  type Query,
} from 'excalibur'
import { Hole, render, html as uhtml } from 'uhtml'
import { UIHostContext } from './engine-context'
import { getPixelConversion } from './util'

export class UISystem extends System {
  systemType = SystemType.Draw
  query!: Query<typeof UIComponent>
  root = document.createElement('div')
  engine!: Engine

  initialize(world: World, scene: Scene<unknown>): void {
    this.query = world.query([UIComponent])

    this.engine = scene.engine

    this.resizeToCanvas()

    window.addEventListener('resize', this.resizeToCanvas.bind(this))

    scene.on('deactivate', () => {
      this.root.remove()
    })

    scene.on('activate', () => {
      document.body.appendChild(this.root)
    })
  }

  resizeToCanvas() {
    const canvas = this.engine.canvas

    const rect = canvas.getBoundingClientRect()
    this.root.style.position = 'absolute'
    this.root.style.top = rect.top + 'px'
    this.root.style.left = rect.left + 'px'
    this.root.style.width = `${rect.width}px`
    this.root.style.height = `${rect.height}px`
    this.root.style.overflow = 'hidden'
    this.root.style.pointerEvents = 'none'

    this.root.style.setProperty(
      '--ex-pixel',
      getPixelConversion(this.engine).toString(),
    )
  }

  update() {
    for (const entity of this.query.entities) {
      const comp = entity.get(UIComponent)
      comp.update()
    }
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

  shadow?: ShadowRoot
  coordPlane?: CoordPlane
  draw: () => Hole

  host: HTMLElement

  private system?: UISystem

  constructor(draw: () => Hole, options: UIComponentOptions = {}) {
    super()

    this.coordPlane = options.coordPlane
    this.draw = draw

    this.host = document.createElement('div')
    if (options.scoped) {
      this.host.attachShadow({ mode: 'open' })
    }
    this.host.style.pointerEvents = 'unset'
    this.host.style.position = 'relative'
    this.host.style.height = '100%'
    this.host.style.width = '100%'
    this.host.style.transformOrigin = '0 0'
    this.host.style.transform =
      'scale(var(--ex-pixel), var(--ex-pixel)) translate(calc(var(--x, 0)), calc(var(--y, 0))'
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

  update() {
    this.updatePosition()

    if (this.owner) {
      return UIHostContext.scope({ owner: this.owner! }, () => {
        render(this.host.shadowRoot ? this.host.shadowRoot : this.host, () => {
          return this.draw()
        })
      })
    }
  }

  attach = () => {
    if (this.owner?.scene) {
      this.system =
        this.owner.scene.world.systemManager.get(UISystem) ?? undefined

      if (this.system) {
        this.coordPlane ??= this.owner!.get(TransformComponent)?.coordPlane
        this.system.root.append(this.host)

        this.owner!.scene!.once('deactivate', this.detach)
      } else {
        throw new Error('UISystem not found')
      }
    }
  }

  detach = () => {
    this.host?.remove()
    this.owner?.scene?.once('activate', this.attach)
  }

  updatePosition() {
    if (this.host && this.owner?.scene) {
      if (this.coordPlane === CoordPlane.World) {
        const transform = this.owner.get(TransformComponent)

        const screenCoords =
          this.owner?.scene?.engine.screen.worldToScreenCoordinates(
            transform.pos,
          )

        const conversion = getPixelConversion(this.owner.scene.engine)

        if (screenCoords && conversion) {
          this.host.style.setProperty('--x', screenCoords.x.toString() + 'px')
          this.host.style.setProperty('--y', screenCoords.y.toString() + 'px')
        } else {
          this.host.style.setProperty('--x', '0px')
          this.host.style.setProperty('--y', '0px')
        }
      }
    }
  }
}

export function html(strings: TemplateStringsArray, ...values: any[]) {
  const result = uhtml(strings, ...values)
  return result
}
