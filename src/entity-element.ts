import { CoordPlane, Entity, TransformComponent, Vector } from 'excalibur'
import { useContext } from './context'
import { UIHostContext } from './engine-context'
import { getPixelConversion } from './util'

export class EntityElement extends HTMLElement {
  entity?: Entity

  constructor() {
    super()
  }

  set this(val: typeof Entity | [typeof Entity, ...any[]]) {
    if (!this.entity) {
      const [cls, args] = Array.isArray(val)
        ? [val[0], val.slice(1)]
        : [val, []]
      this.entity = new cls(...args)
    }
  }

  connectedCallback() {
    if (!this.entity) {
      throw new Error(
        `Missing entity - set with .this=\${[EntityClass, ...constructorArgs]}`,
      )
    }

    const { owner } = useContext(UIHostContext)

    owner.scene?.add(this.entity)

    if (!this.getAttribute('detached')) {
      owner.on('postupdate', this.syncLayout.bind(this))
    }
  }

  syncLayout() {
    if (this.entity?.scene) {
      const bounds = this.getBoundingClientRect()
      const transform = this.entity.get(TransformComponent)
      const canvas = this.entity.scene.engine.canvas.getBoundingClientRect()
      const conversion = getPixelConversion(this.entity.scene.engine)

      transform.coordPlane = CoordPlane.Screen

      if (transform && conversion) {
        transform.pos = new Vector(
          (bounds.left - canvas.left) * (1 / conversion),
          (bounds.top - canvas.top) * (1 / conversion),
        )
      }
    }
  }

  disconnectedCallback() {
    this.entity?.kill()
  }

  addEventListener(
    type: any,
    listener: any,
    options?: { once: boolean },
  ): void {
    if (this.entity) {
      if (options?.once) {
        this.entity.once(type, listener)
      } else {
        this.entity.on(type, listener)
      }
    }
  }

  removeEventListener(type: any, listener: any, options?: any): void {
    if (this.entity) {
      this.entity.off(type, listener)
    }
  }
}

function setByDotNotation(obj: any, path: string, value: any) {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current)) {
      current[part] = {}
    }
    current = current[part]
  }

  current[parts[parts.length - 1]] = value
}

function getWritableDataProperties(obj: any) {
  const props = new Set()
  let current = obj

  while (current && current !== Object.prototype) {
    // include string and symbol keys
    for (const key of [
      ...Object.getOwnPropertyNames(current),
      ...Object.getOwnPropertySymbols(current),
    ]) {
      if (props.has(key)) continue

      const desc = Object.getOwnPropertyDescriptor(current, key)
      // only include data properties that are writable
      if (desc && 'value' in desc && desc.writable) {
        props.add(key)
      }
    }
    current = Object.getPrototypeOf(current)
  }

  return Array.from(props)
}

customElements.define('ex-entity', EntityElement)
