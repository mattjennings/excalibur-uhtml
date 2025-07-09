import * as ex from 'excalibur'
import { UIComponent, UISystem } from 'excalibur-uhtml'

export class MenuScene extends ex.Scene {
  constructor() {
    super()

    this.world.systemManager.addSystem(UISystem)
  }

  onInitialize(): void {
    this.add(new Menu())
  }
}

class Menu extends ex.ScreenElement {
  text = 0

  ui = new UIComponent(
    (html) => html`
      <h1>Examples</h1>
      <div id="menu">
        <button @click=${() => this.scene!.engine.goToScene('physics')}>
          Physics
        </button>
      </div>

      <style>
        div {
          width: 100%;
          height: 100%;
          display: flex;
          gap: 8px;
          background: blue;
        }

        button {
          height: 28px;
        }
      </style>
    `,
    {
      scoped: true,
    },
  )

  onInitialize(engine: ex.Engine<any>): void {
    this.addComponent(this.ui)
  }
}
